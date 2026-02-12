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
      - name: Validate schema
        run: pnpm schemasentry validate --manifest ./schema-sentry.manifest.json --data ./schema-sentry.data.json
```

## PR Annotations

Use `--annotations github` to emit GitHub Actions workflow commands (`::error` / `::warning`) for each issue. These appear directly in the PR interface.

```yaml
- name: Schema validate with PR annotations
  run: |
    pnpm schemasentry validate \
      --manifest ./schema-sentry.manifest.json \
      --data ./schema-sentry.data.json \
      --annotations github
```

**Example output in PR:**

```
✗ schema-sentry.manifest.json:15 - Missing schema for /pricing
✗ schema-sentry.manifest.json:22 - Missing schema for /about
⚠ schema-sentry.data.json:8 - Recommended field 'image' is missing for /blog/launch
```

## Multiple Output Formats

Choose between JSON (machine-readable) and HTML (human-readable) reports.

### JSON Output

```yaml
- name: Validate with JSON output
  run: pnpm schemasentry validate --format json --output ./schema-report.json
```

### HTML Report

```yaml
- name: Generate HTML schema report
  run: |
    pnpm schemasentry audit \
      --data ./schema-sentry.data.json \
      --manifest ./schema-sentry.manifest.json \
      --format html \
      --output ./schema-sentry-audit-report.html
```

## Upload Reports as Artifacts

Share HTML reports with your team by uploading them as workflow artifacts.

```yaml
- name: Upload schema report
  uses: actions/upload-artifact@v4
  with:
    name: schema-sentry-audit-report
    path: ./schema-sentry-audit-report.html
    retention-days: 30
```

## Complete Example Workflow

This workflow combines validation, PR annotations, and HTML report upload:

```yaml
name: Schema Sentry

on:
  pull_request:
    paths:
      - '**.json'
      - '**.md'
      - '!.git/**'
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

      - name: Validate schema with PR annotations
        run: |
          pnpm schemasentry validate \
            --manifest ./schema-sentry.manifest.json \
            --data ./schema-sentry.data.json \
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
          pnpm schemasentry audit \
            --data ./schema-sentry.data.json \
            --manifest ./schema-sentry.manifest.json \
            --format html \
            --output ./schema-audit-report.html

      - name: Upload HTML report artifact
        uses: actions/upload-artifact@v4
        with:
          name: schema-audit-report
          path: ./schema-audit-report.html
```

## Audit in CI

Use `audit` command to analyze site-wide schema coverage:

```yaml
- name: Schema audit
  run: |
    pnpm schemasentry audit \
      --data ./schema-sentry.data.json \
      --manifest ./schema-sentry.manifest.json \
      --annotations github \
      --format json \
      --output ./audit-report.json
```

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
| `schema-sentry.manifest.json` | Route-to-schema-type mappings |
| `schema-sentry.data.json` | Actual schema data per route |

### Command Options

| Option | Description |
|--------|-------------|
| `--format json\|html` | Output format (default: json) |
| `--annotations none\|github` | Emit CI annotations (default: none) |
| `-o, --output <path>` | Write output to file |
| `--recommended / --no-recommended` | Enable/disable recommended field checks (default: enabled) |

## Performance the CLI validation Guardrail

Benchmark path on a 200-route synthetic fixture and fail if runtime exceeds 5 seconds.

```yaml
- name: Verify performance target
  run: pnpm test -- packages/core/src/performance.test.ts
```

This test ensures validation remains fast even as your site grows.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | Validation errors found |

Use exit codes to gate merges in CI:

```yaml
- name: Validate schema
  run: pnpm schemasentry validate --manifest ./schema-sentry.manifest.json --data ./schema-sentry.data.json

- name: Check result
  if: failure()
  run: echo "Schema validation failed. See annotations for details."
```
