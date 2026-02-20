# Dev Mode

Interactive mode for Schema Sentry. Includes prompts and optional watch mode.

## Quick Start

```bash
# Prompt-driven selection
pnpm schemasentry dev

# Run validate once
pnpm schemasentry dev --action validate --once

# Watch for changes
pnpm schemasentry dev --action validate --watch ./app schema-sentry.manifest.json

# Run audit with prompts
pnpm schemasentry dev --action audit

# Run suggest with prompts
pnpm schemasentry dev --action suggest
```

## Options

| Option | Description |
|--------|-------------|
| `--action <name>` | validate, audit, suggest |
| `--once` | Run once and exit |
| `--watch <paths...>` | Paths to watch (default: app/pages/manifest/config) |
| `--manifest <path>` | Manifest file path |
| `--root <path>` | Root dir for validate/audit |
| `--app-dir <path>` | App dir for validate/audit |
| `--build` | Run build before validate |
| `--build-command <cmd>` | Build command |
| `--format <format>` | Output format |
| `--rules <rulesets>` | Rulesets for validate |
| `--annotations <provider>` | CI annotations |
| `--recommended / --no-recommended` | Recommended checks |
| `--data <path>` | Schema data file (audit) |
| `--scan` | Scan filesystem for routes (audit) |
| `--no-source-scan` | Disable source scanning (audit) |
| `--provider <name>` | AI provider (suggest) |
| `--api-key <key>` | API key (suggest) |
| `--model <name>` | Model (suggest) |
| `--write` | Apply suggestions (suggest) |
| `--force` | Skip confirmation prompts |

## Notes

- `dev` re-runs the chosen command on file changes.
- Changes are debounced to avoid overlapping runs.
