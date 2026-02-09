# Validation

Schema Sentry validates JSON-LD for:

- Required fields
- Manifest coverage

The initial CLI emits a JSON report. HTML output is planned.

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
