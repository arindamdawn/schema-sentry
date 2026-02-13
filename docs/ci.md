# CI Integration

Use Schema Sentry in CI to gate merges, annotate pull requests, and publish report artifacts.

## Quick Start

```yaml
name: schema-check

on:
  pull_request:
  push:
    branches: [main]

jobs:
  schema-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Build app
        run: pnpm build
      - name: Validate schema (reality check)
        run: pnpm schemasentry validate --manifest ./schema-sentry.manifest.json --root ./.next/server/app
```

## PR Annotations

Use `--annotations github` to emit GitHub Actions workflow commands (`::error` / `::warning`) for each issue.

```yaml
- name: Schema validate with PR annotations
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --root ./.next/server/app \
      --annotations github
```

## Output Formats

Choose between table (default, human-readable), tree (hierarchical), JSON (machine-readable), and HTML (human-readable) reports.

### Table Output (Default)

```yaml
- name: Validate with table output
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --root ./.next/server/app \
      --format table
```

### Tree Output

```yaml
- name: Validate with tree output
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --root ./.next/server/app \
      --format tree
```

### JSON Output

```yaml
- name: Validate with JSON output
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --root ./.next/server/app \
      --format json \
      --output ./schema-report.json
```

### HTML Output

```yaml
- name: Generate HTML validation report
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --root ./.next/server/app \
      --format html \
      --output ./schema-sentry-validate-report.html
```

## Rulesets

Validate schema against specific optimization targets using rulesets.

### Google Rich Results

Validate that your schema meets Google's rich result requirements:

```yaml
- name: Validate for Google rich results
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --root ./.next/server/app \
      --rules google
```

### AI Citation

Validate that your schema is optimized for AI/LLM citation:

```yaml
- name: Validate for AI citation
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --root ./.next/server/app \
      --rules ai-citation
```

### Multiple Rulesets

Combine rulesets for comprehensive validation:

```yaml
- name: Validate for both Google and AI
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --root ./.next/server/app \
      --rules google,ai-citation
```

## Upload Reports as Artifacts

```yaml
- name: Upload schema report
  uses: actions/upload-artifact@v4
  with:
    name: schema-sentry-validate-report
    path: ./schema-sentry-validate-report.html
    retention-days: 30
```

## Complete Example Workflow

```yaml
name: Schema Sentry

on:
  pull_request:
    paths:
      - "**.json"
      - "**.md"
      - "!.git/**"
  push:
    branches: [main]

jobs:
  schema-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build app
        run: pnpm build

      - name: Validate schema with PR annotations
        run: |
          pnpm schemasentry validate \
            --manifest ./schema-sentry.manifest.json \
            --root ./.next/server/app \
            --annotations github \
            --format json \
            --output ./schema-report.json

      - name: Upload JSON report artifact
        uses: actions/upload-artifact@v4
        with:
          name: schema-report
          path: ./schema-report.json

      - name: Generate and upload HTML report
        run: |
          pnpm schemasentry validate \
            --manifest ./schema-sentry.manifest.json \
            --root ./.next/server/app \
            --format html \
            --output ./schema-validate-report.html

      - name: Upload HTML report artifact
        uses: actions/upload-artifact@v4
        with:
          name: schema-validate-report
          path: ./schema-validate-report.html
```

## Audit in CI

Use `audit` to analyze schema health and ghost routes:

```yaml
- name: Schema audit
  run: |
    pnpm schemasentry audit \
      --manifest ./schema-sentry.manifest.json \
      --root ./app \
      --annotations github \
      --format json \
      --output ./audit-report.json
```

Add `--data ./schema-sentry.data.json` when you explicitly want legacy data-file coverage checks in audit.

## Data Drift Check in CI

Use `collect --check` to detect when rendered JSON-LD output has diverged from
`schema-sentry.data.json`:

```yaml
- name: Build app output
  run: pnpm --filter schema-sentry-example-next-app build

- name: Detect schema data drift
  run: |
    pnpm schemasentry collect \
      --root ./examples/next-app/.next/server/app \
      --routes / /blog /faq \
      --strict-routes \
      --check \
      --data ./examples/next-app/schema-sentry.data.json
```

For static exports, point `--root` to your export directory (for example `./out`).

## Configuration

### Required Files

| File | Description |
|------|-------------|
| `schema-sentry.manifest.json` | Route-to-schema-type mappings used by `validate` and `audit` |

### Optional Files

| File | Description |
|------|-------------|
| `schema-sentry.data.json` | Legacy collected schema data, mainly for `collect --check` and optional audit input |

### Validation Options

| Option | Description |
|--------|-------------|
| `--root <path>` | Built output directory for `validate` (for example `./.next/server/app` or `./out`) |
| `--build` | Run build before validation (`pnpm build` by default) |
| `--build-command <command>` | Custom build command used with `--build` |
| `--format json\|html\|table\|tree` | Output format (default: table) |
| `--rules google\|ai-citation` | Run rulesets for Google rich results or AI citation checks |
| `--annotations none\|github` | Emit CI annotations (default: none) |
| `-o, --output <path>` | Write output to file |
| `--recommended / --no-recommended` | Enable/disable recommended field checks (default: enabled) |

### collect Command Options

| Option | Description |
|--------|-------------|
| `--root <path>` | Root directory to scan for built HTML files |
| `--routes <routes...>` | Only collect specific routes (comma-separated or repeated flag) |
| `--strict-routes` | Fail if any route passed via `--routes` is missing |
| `--format json` | Output format (default: json) |
| `-o, --output <path>` | Write collected schema data to file |
| `--check` | Compare collected output with an existing schema data file |
| `-d, --data <path>` | Path to existing schema data file for `--check` |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | Validation/audit errors found |

Use exit codes to gate merges in CI:

```yaml
- name: Validate schema
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --root ./.next/server/app

- name: Check result
  if: failure()
  run: echo "Schema validation failed. See annotations for details."
```
