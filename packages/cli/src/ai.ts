import { generateText } from "ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { SchemaTypeName } from "@schemasentry/core";

export type AIProvider = "openai" | "anthropic" | "google" | "nvidia" | "openrouter";

export interface ProviderConfig {
  provider: AIProvider;
  model?: string;
  apiKey?: string;
}

export interface SchemaSuggestion {
  route: string;
  suggestedType?: SchemaTypeName;
  missingFields: string[];
  recommendations: string[];
  confidence: number;
}

export interface SuggestionResult {
  ok: boolean;
  provider: AIProvider;
  model: string;
  suggestions: SchemaSuggestion[];
  errors: string[];
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o",
  anthropic: "claude-3.5-sonnet-20241022",
  google: "gemini-2.0-flash-exp",
  nvidia: "nvidia/llama-3.3-70b-instruct",
  openrouter: "openai/gpt-4o"
};

const PROVIDER_API_KEYS: Record<AIProvider, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_API_KEY",
  nvidia: "NVIDIA_API_KEY",
  openrouter: "OPENROUTER_API_KEY"
};

export function resolveProvider(provider?: string): AIProvider | null {
  if (!provider) {
    for (const [name, envVar] of Object.entries(PROVIDER_API_KEYS)) {
      if (process.env[envVar]) {
        return name as AIProvider;
      }
    }
    return null;
  }

  const normalized = provider.toLowerCase();
  const validProviders: AIProvider[] = ["openai", "anthropic", "google", "nvidia", "openrouter"];
  
  if (validProviders.includes(normalized as AIProvider)) {
    return normalized as AIProvider;
  }

  return null;
}

export function resolveModel(provider: AIProvider, explicitModel?: string): string {
  if (explicitModel) {
    return explicitModel;
  }

  const envModelKey = `${provider.toUpperCase()}_MODEL`;
  const envModel = process.env[envModelKey];
  if (envModel) {
    return envModel;
  }

  return DEFAULT_MODELS[provider];
}

export function resolveApiKey(provider: AIProvider): string | undefined {
  const envVar = PROVIDER_API_KEYS[provider];
  return process.env[envVar];
}

export function getAvailableProviders(): { provider: AIProvider; hasKey: boolean }[] {
  const providers: AIProvider[] = ["openai", "anthropic", "google", "nvidia", "openrouter"];
  return providers.map((provider) => ({
    provider,
    hasKey: !!resolveApiKey(provider)
  }));
}

export function validateProviderConfig(config: ProviderConfig): string[] {
  const errors: string[] = [];

  if (!config.provider) {
    errors.push("No provider specified. Use --provider flag or set an API key env var.");
    return errors;
  }

  const apiKey = resolveApiKey(config.provider);
  if (!apiKey) {
    const envVar = PROVIDER_API_KEYS[config.provider];
    errors.push(`Missing API key for ${config.provider}. Set ${envVar} environment variable.`);
  }

  return errors;
}

export async function generateSchemaSuggestions(
  routes: string[],
  config: ProviderConfig
): Promise<SuggestionResult> {
  const errors = validateProviderConfig(config);
  if (errors.length > 0) {
    return {
      ok: false,
      provider: config.provider,
      model: resolveModel(config.provider, config.model),
      suggestions: [],
      errors
    };
  }

  const model = resolveModel(config.provider, config.model);
  const apiKey = resolveApiKey(config.provider)!;
  
  const routeList = routes.map((r) => `- ${r}`).join("\n");

  const systemPrompt = `You are a JSON-LD schema expert. Given a list of routes from a Next.js application, analyze them and suggest appropriate Schema.org types and fields.

Available schema types: Organization, Person, Place, LocalBusiness, WebSite, WebPage, Article, BlogPosting, Product, VideoObject, ImageObject, Event, Review, FAQPage, HowTo, BreadcrumbList.

For each route, respond with:
1. A suggested schema type based on the URL pattern (e.g., /blog/* -> BlogPosting, /products/* -> Product, /faq -> FAQPage)
2. Required fields that should be included for that type
3. Recommendations for additional fields to improve SEO and AI discoverability

Respond in JSON format:
{
  "suggestions": [
    {
      "route": "/blog/my-post",
      "suggestedType": "BlogPosting",
      "missingFields": ["author", "datePublished"],
      "recommendations": ["Add image for social sharing", "Include dateModified for freshness"]
    }
  ]
}`;

  const userPrompt = `Analyze these routes and suggest schema types:\n${routeList}`;

  try {
    let text: string;
    
    switch (config.provider) {
      case "openai":
      case "nvidia":
      case "openrouter": {
        const openaiClient = new OpenAI({
          apiKey,
          baseURL: config.provider === "nvidia" 
            ? "https://integrate.api.nvidia.com/v1"
            : config.provider === "openrouter"
            ? "https://openrouter.ai/v1"
            : undefined
        });
        
        const modelId = config.provider === "nvidia" ? `nvidia/${model}` : model;
        
        const result = await openaiClient.chat.completions.create({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7
        });
        
        text = result.choices[0]?.message?.content || "";
        break;
      }
        
      case "anthropic": {
        const anthropicClient = new Anthropic({ apiKey });
        
        const result = await anthropicClient.messages.create({
          model,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: "user", content: userPrompt }
          ]
        });
        
        text = result.content[0]?.type === "text" ? result.content[0].text : "";
        break;
      }
        
      case "google": {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const googleClient = new GoogleGenerativeAI(apiKey);
        const geminiModel = googleClient.getGenerativeModel({ model });
        
        const chatSession = geminiModel.startChat({
          generationConfig: {
            temperature: 0.7,
          },
          systemInstruction: systemPrompt
        });
        
        const response = await chatSession.sendMessage(userPrompt);
        text = response.response.text();
        break;
      }
        
      default:
        return {
          ok: false,
          provider: config.provider,
          model,
          suggestions: [],
          errors: [`Unsupported provider: ${config.provider}`]
        };
    }

    return parseAIResponse(config.provider, model, text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      ok: false,
      provider: config.provider,
      model,
      suggestions: [],
      errors: [`AI request failed: ${message}`]
    };
  }
}

function parseAIResponse(
  provider: AIProvider,
  model: string,
  text: string
): SuggestionResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        ok: false,
        provider,
        model,
        suggestions: [],
        errors: ["Failed to parse AI response as JSON"]
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const suggestions = (parsed.suggestions || []).map((s: any) => ({
      route: s.route,
      suggestedType: s.suggestedType as SchemaTypeName | undefined,
      missingFields: s.missingFields || [],
      recommendations: s.recommendations || [],
      confidence: s.confidence || 0.8
    }));

    return {
      ok: true,
      provider,
      model,
      suggestions,
      errors: []
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      ok: false,
      provider,
      model,
      suggestions: [],
      errors: [`Failed to parse response: ${message}`]
    };
  }
}
