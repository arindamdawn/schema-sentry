# @schemasentry/cli

CLI for Schema Sentry validation and reporting.

## Install

```bash
pnpm add -D @schemasentry/cli
npm install -D @schemasentry/cli
```

## Important: Zero False Positives!

Schema Sentry v0.6.0+ validates **actual built HTML output**, not just JSON configuration files. This eliminates the false positives common in other tools.

**The workflow:**
1. `init` → Create starter files
2. `scaffold` → See what code to add (shows copy-paste examples!)
3. Add Schema components to your pages
4. `validate --build` (or run `next build`) → Produce built output
5. `validate` → Check actual HTML (catches missing schema!)

## Commands

### `init`

Generate starter manifest and data files:

```bash
pnpm schemasentry init
```

With route scanning:

```bash
pnpm schemasentry init --scan
```

### `validate` (Reality Check)

⚠️ **BREAKING CHANGE in v0.6.0**: Now validates actual HTML output instead of JSON files!

Validate schema by checking built HTML output:

```bash
# Auto-detect built output and validate
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json

# Build automatically before validation
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --build
```

Set root explicitly (recommended in CI):

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --root ./.next/server/app
```

Check static export:

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --root ./out
```

**What it validates:**
- ✅ Routes with Schema components in source code
- ✅ Actual JSON-LD rendered in built HTML
- ✅ Schema types match manifest expectations
- ❌ Ghost routes (manifest expects schema but no component in source)
- ❌ Missing schema (component exists but not in HTML - forgot to build?)

With GitHub annotations:

```bash
pnpm schemasentry validate --annotations github
```

### `audit`

Analyze site-wide schema health and detect ghost routes:

```bash
pnpm schemasentry audit \
  --manifest ./schema-sentry.manifest.json \
  --root ./app
```

**Ghost routes** are routes in your manifest that don't have Schema components in the source code. They cause false positives in other tools!

If no schema data file is loaded, `audit` runs in source-only mode and skips legacy coverage checks.
Provide `--data` when you want data-file coverage checks.

With source scanning:

```bash
pnpm schemasentry audit --manifest ./schema-sentry.manifest.json --root ./app --scan
```

### `scaffold`

See what schema code you need to add to your pages (shows copy-paste examples):

```bash
pnpm schemasentry scaffold --root ./app
```

Example output:
```
📄 /blog/[slug]
   File: app/blog/[slug]/page.tsx
   Types: BlogPosting

   Add this code to your page:
   ─────────────────────────────────────────
   import { Schema, BlogPosting } from "@schemasentry/next";

   const blogPosting = BlogPosting({
     headline: "Blog Post Title",
     authorName: "Author Name",
     datePublished: "2026-02-12",
     url: "https://yoursite.com/blog/[slug]"
   });

   export default function Page() {
     return (
       <>
         <Schema data={[blogPosting]} />
         {/* Your existing content */}
       </>
     );
   }
   ─────────────────────────────────────────
```

Apply scaffolded schema to JSON files:

```bash
pnpm schemasentry scaffold --root ./app --write
```

**Pattern-based auto-detection** infers schema types from URL patterns:
- `/blog/*` → BlogPosting
- `/products/*` → Product
- `/faq` → FAQPage
- `/events/*` → Event
- `/howto/*` → HowTo
- and more...

### `collect`

Collect JSON-LD blocks from built HTML output:

```bash
pnpm schemasentry collect --root ./out --output ./schema-sentry.data.json
```

Check collected output against your current data file (CI drift guard):

```bash
pnpm schemasentry collect --root ./out --check --data ./schema-sentry.data.json
```

Collect and compare only selected routes, failing if any required route is missing:

```bash
pnpm schemasentry collect \
  --root ./out \
  --routes / /blog /faq \
  --strict-routes \
  --check \
  --data ./schema-sentry.data.json
```

## Options

| Option | Description |
|--------|-------------|
| `--format json\|html` | Output format |
| `--annotations none\|github` | CI annotations |
| `-o, --output <path>` | Write output to file |
| `--root <path>` | Root directory (built output for validate/collect, app dir for scaffold/audit) |
| `--build` | Run build before validation (`pnpm build` by default) |
| `--build-command <command>` | Custom build command used with `--build` |
| `--app-dir <path>` | Path to Next.js app directory (default: ./app) |
| `--routes <routes...>` | Collect only specific routes (`collect`) |
| `--strict-routes` | Fail when any route passed to `--routes` is missing (`collect`) |
| `--check` | Compare collected output with existing data and fail on drift (`collect`) |
| `--write` | Apply scaffolded changes to files (`scaffold`) |
| `--force` | Skip confirmation prompts (`scaffold`) |
| `--recommended / --no-recommended` | Enable recommended field checks |

## CI/CD Example

```yaml
# .github/workflows/schema-check.yml
name: Schema Check

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: pnpm schemasentry validate \
          --manifest ./schema-sentry.manifest.json \
          --root ./.next/server/app \
          --annotations github
```

## Migration from v0.5.0

**OLD (v0.5.0 - JSON validation - FALSE POSITIVES):**
```bash
schemasentry validate --manifest ./manifest.json --data ./data.json
```

**NEW (v0.6.0 - Reality check - NO FALSE POSITIVES):**
```bash
# 1. Validate using auto-detected build output
schemasentry validate --manifest ./manifest.json
# or run build automatically first:
schemasentry validate --manifest ./manifest.json --build
```

## Documentation

See [Schema Sentry Docs](https://github.com/arindamdawn/schema-sentry#readme)
### `suggest` (AI Suggestions)

Analyze routes and suggest schema types using AI (BYOK providers):

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

Supported providers:
- OpenAI (`OPENAI_API_KEY`)
- Anthropic (`ANTHROPIC_API_KEY`)
- Google Gemini (`GOOGLE_API_KEY`)
- NVIDIA NIM (`NVIDIA_API_KEY`)
- OpenRouter (`OPENROUTER_API_KEY`)
