# Validation

Schema Sentry validates JSON-LD for:

- Required fields
- Recommended fields (advisory warnings)
- Manifest coverage

The initial CLI emits a JSON report. HTML output is planned.

## Recommended Field Checks

Recommended field validation is enabled by default and emits warnings instead of errors.
Disable it with:

```bash
pnpm schemasentry validate --no-recommended
```

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
