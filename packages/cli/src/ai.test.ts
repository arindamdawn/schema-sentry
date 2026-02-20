import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  resolveProvider,
  resolveModel,
  resolveApiKey,
  getAvailableProviders,
  validateProviderConfig,
  type ProviderConfig
} from "./ai";

describe("resolveProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns null when no provider specified and no env vars", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "");
    vi.stubEnv("NVIDIA_API_KEY", "");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    
    const result = resolveProvider();
    expect(result).toBeNull();
  });

  it("resolves openai from env var", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    
    const result = resolveProvider();
    expect(result).toBe("openai");
  });

  it("resolves anthropic from env var", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test-key");
    
    const result = resolveProvider();
    expect(result).toBe("anthropic");
  });

  it("resolves explicitly specified provider", () => {
    const result = resolveProvider("openai");
    expect(result).toBe("openai");
  });

  it("resolves case-insensitive provider", () => {
    const result = resolveProvider("OPENAI");
    expect(result).toBe("openai");
  });

  it("returns null for invalid provider", () => {
    const result = resolveProvider("invalid");
    expect(result).toBeNull();
  });
});

describe("resolveModel", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns default model for openai", () => {
    const result = resolveModel("openai");
    expect(result).toBe("gpt-4o");
  });

  it("returns default model for anthropic", () => {
    const result = resolveModel("anthropic");
    expect(result).toBe("claude-3.5-sonnet-20241022");
  });

  it("returns explicit model when provided", () => {
    const result = resolveModel("openai", "gpt-4-turbo");
    expect(result).toBe("gpt-4-turbo");
  });

  it("returns env var model when set", () => {
    vi.stubEnv("OPENAI_MODEL", "gpt-4-turbo");
    
    const result = resolveModel("openai");
    expect(result).toBe("gpt-4-turbo");
  });

  it("explicit model takes precedence over env var", () => {
    vi.stubEnv("OPENAI_MODEL", "gpt-4-turbo");
    
    const result = resolveModel("openai", "gpt-4o");
    expect(result).toBe("gpt-4o");
  });
});

describe("resolveApiKey", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns API key from env var", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
    
    const result = resolveApiKey("openai");
    expect(result).toBe("sk-test-key");
  });

  it("returns undefined when no API key", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    
    const result = resolveApiKey("openai");
    expect(result).toBeFalsy();
  });
});

describe("getAvailableProviders", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("lists all providers with their key status", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "");
    vi.stubEnv("NVIDIA_API_KEY", "nv-test");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    
    const result = getAvailableProviders();
    
    const openai = result.find(p => p.provider === "openai");
    const anthropic = result.find(p => p.provider === "anthropic");
    const nvidia = result.find(p => p.provider === "nvidia");
    
    expect(openai?.hasKey).toBe(true);
    expect(anthropic?.hasKey).toBe(false);
    expect(nvidia?.hasKey).toBe(true);
  });
});

describe("validateProviderConfig", () => {
  it("returns error when no provider specified", () => {
    const config: ProviderConfig = { provider: null as any };
    const errors = validateProviderConfig(config);
    
    expect(errors).toContain("No provider specified. Use --provider flag or set an API key env var.");
  });

  it("returns error when API key is missing", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    
    const config: ProviderConfig = { provider: "openai" };
    const errors = validateProviderConfig(config);
    
    expect(errors).toContain("Missing API key for openai. Set OPENAI_API_KEY environment variable.");
  });

  it("returns no errors when valid", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    
    const config: ProviderConfig = { provider: "openai" };
    const errors = validateProviderConfig(config);
    
    expect(errors).toHaveLength(0);
  });
});
