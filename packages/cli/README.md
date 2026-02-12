# @schemasentry/cli

CLI for Schema Sentry validation and reporting.

## Install

```bash
pnpm add -D @schemasentry/cli
npm install -D @schemasentry/cli
```

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

### `validate`

Check schema coverage and validation:

```bash
pnpm schemasentry validate --manifest ./schema-sentry.manifest.json --data ./schema-sentry.data.json
```

With GitHub annotations:

```bash
pnpm schemasentry validate --annotations github
```

### `audit`

Analyze site-wide schema health:

```bash
pnpm schemasentry audit --data ./schema-sentry.data.json --manifest ./schema-sentry.manifest.json
```

With HTML report:

```bash
pnpm schemasentry audit \
  --data ./schema-sentry.data.json \
  --format html \
  --output ./report.html
```

### `collect`

Collect JSON-LD blocks from built HTML output and emit schema data JSON:

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

### `scaffold`

Auto-generate schema stubs for routes without schema (dry-run by default):

```bash
pnpm schemasentry scaffold --manifest ./schema-sentry.manifest.json --data ./schema-sentry.data.json
```

Preview what would be generated without writing files:

```bash
pnpm schemasentry scaffold
```

Apply scaffolded schema to your files:

```bash
pnpm schemasentry scaffold --write
```

Skip confirmation prompts:

```bash
pnpm schemasentry scaffold --write --force
```

**Pattern-based auto-detection** infers schema types from URL patterns:
- `/blog/*` → BlogPosting
- `/products/*` → Product
- `/faq` → FAQPage
- `/events/*` → Event
- `/howto/*` → HowTo
- and more...

## Options

| Option | Description |
|--------|-------------|
| `--format json\|html` | Output format |
| `--annotations none\|github` | CI annotations |
| `-o, --output <path>` | Write output to file |
| `--root <path>` | Root directory to scan (`collect`, `scaffold`) |
| `--routes <routes...>` | Collect only specific routes (`collect`) |
| `--strict-routes` | Fail when any route passed to `--routes` is missing (`collect`) |
| `--check` | Compare collected output with existing data and fail on drift (`collect`) |
| `--write` | Apply scaffolded changes to files (`scaffold`) |
| `--force` | Skip confirmation prompts (`scaffold`) |
| `--recommended / --no-recommended` | Enable recommended field checks |

## Documentation

See [Schema Sentry Docs](https://github.com/arindamdawn/schema-sentry#readme)
