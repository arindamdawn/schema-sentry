# Validation

Schema Sentry `validate` performs a reality check against built HTML output.
It verifies what is actually rendered, not just config files.

## Validate (Reality Check)

```bash
pnpm schemasentry validate --manifest ./schema-sentry.manifest.json
```

When `--root` is omitted, Schema Sentry auto-detects the first existing build output in this order:

1. `./.next/server/app`
2. `./out`
3. `./.next/server/pages`

Run build automatically before validation:

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --build
```

Set root explicitly (recommended for CI):

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --root ./.next/server/app
```

For static exports:

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --root ./out
```

Custom build command:

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --build \
  --build-command "pnpm --filter my-app build"
```

## Reports and Annotations

The CLI emits JSON to stdout and a human summary to stderr by default.

Write an HTML report:

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --root ./.next/server/app \
  --format html \
  --output ./schema-sentry-validate-report.html
```

Emit GitHub annotations in CI:

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --root ./.next/server/app \
  --annotations github
```

## Audit

`audit` analyzes schema health and ghost routes (manifest routes without `<Schema>` usage in source).

```bash
pnpm schemasentry audit \
  --manifest ./schema-sentry.manifest.json \
  --root ./app
```

If no schema data file is loaded, `audit` runs in source-only mode and skips legacy coverage checks to avoid false positives.

You can still provide a legacy data file for additional checks:

```bash
pnpm schemasentry audit \
  --manifest ./schema-sentry.manifest.json \
  --data ./schema-sentry.data.json \
  --root ./app
```

## Config

`schema-sentry.config.json` applies to both `validate` and `audit`. CLI flags override config.

## Recommended Field Checks

Recommended field validation is enabled by default and emits warnings instead of errors.

```bash
pnpm schemasentry validate --no-recommended
```

You can also set defaults in `schema-sentry.config.json`:

```json
{
  "recommended": false
}
```
