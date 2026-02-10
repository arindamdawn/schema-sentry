# Validation

Schema Sentry validates JSON-LD for:

- Required fields
- Recommended fields (advisory warnings)
- Manifest coverage

The CLI emits a JSON report to stdout and a human-readable summary to stderr.
HTML output is planned.

## Audit

Audit analyzes the schema data file and reports health without requiring a manifest.

```bash
pnpm schemasentry audit --data ./schema-sentry.data.json
```

Pass a manifest to include coverage checks:

```bash
pnpm schemasentry audit --data ./schema-sentry.data.json --manifest ./schema-sentry.manifest.json
```

Scan the filesystem to detect routes without schema:

```bash
pnpm schemasentry audit --data ./schema-sentry.data.json --scan
```

Use `--root` to set the project root for scanning.

## Recommended Field Checks

Recommended field validation is enabled by default and emits warnings instead of errors.
Disable it with:

```bash
pnpm schemasentry validate --no-recommended
```

You can also configure defaults in `schema-sentry.config.json`:

```json
{
  "recommended": false
}
```

CLI flags override config. Use `--config` to point at a custom file.

## Schema Data Input

The CLI expects a schema data file with JSON-LD blocks per route.

```json
{
  "routes": {
    "/": [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Acme Corp"
      }
    ]
  }
}
```
