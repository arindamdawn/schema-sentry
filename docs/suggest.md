# Suggest

AI-powered schema suggestions with BYOK (Bring Your Own Key) providers.

## Quick Start

```bash
# Auto-detect provider from env vars
pnpm schemasentry suggest

# Specify provider
pnpm schemasentry suggest --provider openai

# Specify model
pnpm schemasentry suggest --provider openai --model gpt-4o

# Use NVIDIA NIM with API key
pnpm schemasentry suggest --provider nvidia --api-key $NVIDIA_API_KEY

# JSON output
pnpm schemasentry suggest --format json --output ./schema-sentry.suggestions.json

# Apply suggestions to manifest
pnpm schemasentry suggest --write --force
```

## Providers

Set one of the following environment variables or pass `--api-key` directly:

- OpenAI: `OPENAI_API_KEY`
- Anthropic: `ANTHROPIC_API_KEY`
- Google Gemini: `GOOGLE_API_KEY`
- NVIDIA NIM: `NVIDIA_API_KEY`
- OpenRouter: `OPENROUTER_API_KEY`

## Options

| Option | Description |
|--------|-------------|
| `--provider <name>` | Provider: openai, anthropic, google, nvidia, openrouter |
| `--api-key <key>` | API key (overrides env var) |
| `--model <name>` | Model override for provider |
| `--format json\|table` | Output format |
| `--output <path>` | Write output to file |
| `--write` | Apply suggestions to manifest |
| `--force` | Skip confirmation when using `--write` |

## Notes

- Suggest is **experimental**. Always review output before applying.
- `--write` updates `schema-sentry.manifest.json` with suggested types.
