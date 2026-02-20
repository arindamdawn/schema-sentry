import { Command } from "commander";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "path";
import chalk from "chalk";
import { stableStringify, type Manifest, type JsonLdValue, type SchemaNode, type SchemaTypeName } from "@schemasentry/core";
import {
  resolveProvider,
  resolveModel,
  resolveApiKey,
  generateSchemaSuggestions,
  getAvailableProviders,
  type SchemaSuggestion
} from "../ai.js";
import { printCliError, isManifest } from "./utils.js";
import { formatDuration } from "../summary.js";

export const suggestCommand = new Command("suggest")
  .description("AI-powered schema suggestions (experimental) - Analyze routes and suggest schema types using AI")
  .option(
    "-m, --manifest <path>",
    "Path to manifest JSON",
    "schema-sentry.manifest.json"
  )
  .option(
    "-r, --routes <paths...>",
    "Specific routes to analyze (overrides manifest)"
  )
  .option(
    "-p, --provider <provider>",
    "AI provider to use (openai, anthropic, google, nvidia, openrouter)"
  )
  .option(
    "-k, --api-key <key>",
    "API key for the AI provider (or set via env var: OPENAI_API_KEY, etc.)"
  )
  .option(
    "--model <model>",
    "Model to use (defaults to provider's recommended model)"
  )
  .option(
    "--format <format>",
    "Output format (json|table)",
    "table"
  )
  .option(
    "-o, --output <path>",
    "Write report output to file"
  )
  .option(
    "--write",
    "Write suggested schema to manifest file (requires --force to confirm)"
  )
  .option(
    "--force",
    "Skip confirmation prompt when using --write"
  )
  .option(
    "--app-dir <path>",
    "Path to Next.js app directory for source code updates",
    "./app"
  )
  .action(async (options: {
    manifest: string;
    routes?: string[];
    provider?: string;
    apiKey?: string;
    model?: string;
    format?: string;
    output?: string;
    write?: boolean;
    force?: boolean;
    appDir?: string;
  }) => {
    const start = Date.now();
    const cwd = process.cwd();

    console.error(chalk.yellow.bold("[EXPERIMENTAL] This feature is experimental"));
    console.error(chalk.blue.bold("\nSchema Sentry AI Suggestions"));
    console.error(chalk.gray("Analyzing routes and generating schema recommendations...\n"));

    // Resolve provider
    const resolvedProvider = resolveProvider(options.provider);
    
    if (!resolvedProvider) {
      const available = getAvailableProviders();
      const availableList = available
        .filter((p) => p.hasKey)
        .map((p) => p.provider)
        .join(", ");
      
      console.error(chalk.yellow("No AI provider configured"));
      console.error(chalk.gray("\nAvailable providers with API keys:"));
      if (availableList) {
        console.error(chalk.gray(`  ${availableList}\n`));
      } else {
        console.error(chalk.gray("  (none configured)\n"));
      }
      
      console.error(chalk.gray("To use AI suggestions, set one of:"));
      console.error(chalk.gray("  OPENAI_API_KEY"));
      console.error(chalk.gray("  ANTHROPIC_API_KEY"));
      console.error(chalk.gray("  GOOGLE_API_KEY"));
      console.error(chalk.gray("  NVIDIA_API_KEY"));
      console.error(chalk.gray("  OPENROUTER_API_KEY"));
      console.error(chalk.gray("\nOr specify a provider with --provider flag"));
      console.error(chalk.gray("Example: schemasentry suggest --provider openai\n"));
      
      printCliError(
        "suggest.no_provider",
        "No AI provider available",
        "Configure an API key or use --provider to specify one"
      );
      process.exit(1);
      return;
    }

    const model = resolveModel(resolvedProvider, options.model);
    const apiKey = options.apiKey || resolveApiKey(resolvedProvider);

    console.error(chalk.gray(`Using provider: ${chalk.cyan(resolvedProvider)}`));
    console.error(chalk.gray(`Using model: ${chalk.cyan(model)}\n`));

    // Get routes
    let routes: string[] = [];

    if (options.routes && options.routes.length > 0) {
      routes = options.routes;
    } else {
      const manifestPath = path.resolve(cwd, options.manifest);
      try {
        const raw = await readFile(manifestPath, "utf8");
        const manifest = JSON.parse(raw) as Manifest;

        if (!isManifest(manifest)) {
          printCliError(
            "manifest.invalid_shape",
            "Manifest must contain a 'routes' object with string array values",
            "Ensure each route maps to an array of schema type names."
          );
          process.exit(1);
          return;
        }

        routes = Object.keys(manifest.routes);
      } catch (error) {
        printCliError(
          "manifest.not_found",
          `Manifest not found at ${manifestPath}`,
          "Run schemasentry init to generate starter files, or pass routes directly with --routes."
        );
        process.exit(1);
        return;
      }
    }

    if (routes.length === 0) {
      printCliError(
        "suggest.no_routes",
        "No routes to analyze",
        "Provide routes via --routes flag or a manifest file"
      );
      process.exit(1);
      return;
    }

    console.error(chalk.gray(`Analyzing ${routes.length} routes...\n`));

    // Generate suggestions
    const result = await generateSchemaSuggestions(routes, {
      provider: resolvedProvider,
      model,
      apiKey
    });

    if (!result.ok) {
      console.error(chalk.red("AI request failed:"));
      for (const error of result.errors) {
        console.error(chalk.red(`   ${error}`));
      }
      process.exit(1);
      return;
    }

    // Output
    if (options.format === "json") {
      const output = stableStringify({
        provider: result.provider,
        model: result.model,
        suggestions: result.suggestions as unknown as JsonLdValue
      });
      
      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        await mkdir(path.dirname(outputPath), { recursive: true });
        await writeFile(outputPath, output, "utf8");
        console.error(chalk.green(`\nReport written to ${outputPath}`));
      } else {
        console.log(output);
      }
    } else {
      printTableOutput(result.suggestions);
    }

    // Write to manifest if --write flag is provided
    if (options.write) {
      const manifestPath = path.resolve(cwd, options.manifest);
      let manifest: Manifest = { routes: {} };
      
      // Load existing manifest
      try {
        const raw = await readFile(manifestPath, "utf8");
        manifest = JSON.parse(raw) as Manifest;
      } catch {
        // No existing manifest, create new one
      }

      // Apply suggestions to manifest
      const validSuggestions = result.suggestions.filter(s => s.suggestedType);
      
      for (const suggestion of validSuggestions) {
        manifest.routes[suggestion.route] = [suggestion.suggestedType!];
      }

      if (validSuggestions.length > 0) {
        const manifestContent = stableStringify(manifest);
        
        if (!options.force) {
          console.error(chalk.yellow(`\nThis will update ${validSuggestions.length} routes in ${options.manifest}:`));
          for (const s of validSuggestions) {
            console.error(chalk.gray(`  ${s.route} -> ${s.suggestedType}`));
          }
          console.error(chalk.yellow("\nUse --force to confirm or run without --write to preview only."));
        } else {
          await writeFile(manifestPath, manifestContent, "utf8");
          console.error(chalk.green(`\nUpdated ${manifestPath} with ${validSuggestions.length} route suggestions`));
        }
      }
    }

    // Summary
    const duration = Date.now() - start;
    console.error(chalk.gray(`\nCompleted in ${formatDuration(duration)}`));
    console.error(chalk.yellow.bold("\n[EXPERIMENTAL] AI suggestions may not be accurate. Verify before using.\n"));
  });

function printTableOutput(suggestions: SchemaSuggestion[]): void {
  if (suggestions.length === 0) {
    console.log(chalk.yellow("No suggestions generated"));
    return;
  }

  // Header
  console.log(chalk.bold.cyan("Route".padEnd(30)) + " " + 
    chalk.bold.cyan("Suggested Type".padEnd(20)) + " " + 
    chalk.bold.cyan("Missing Fields"));
  console.log(chalk.gray("=".repeat(80)));

  for (const suggestion of suggestions) {
    const route = suggestion.route.padEnd(30);
    const suggestedType = (suggestion.suggestedType || "?").padEnd(20);
    const missing = suggestion.missingFields.slice(0, 3).join(", ");
    const more = suggestion.missingFields.length > 3 
      ? ` +${suggestion.missingFields.length - 3} more` 
      : "";
    
    console.log(route + " " + chalk.yellow(suggestedType) + " " + chalk.red(missing + more));
    
    if (suggestion.recommendations.length > 0) {
      console.log(chalk.gray("   Recommendations:"));
      for (const rec of suggestion.recommendations.slice(0, 2)) {
        console.log(chalk.gray(`     - ${rec}`));
      }
    }
    console.log("");
  }

  console.log(chalk.gray(`\nTotal: ${suggestions.length} suggestions`));
}
