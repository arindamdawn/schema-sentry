# Manifest

The manifest maps routes to expected schema blocks and powers coverage checks.

## Example

```json
{
  "routes": {
    "/": ["Organization", "WebSite"],
    "/blog/[slug]": ["Article"]
  }
}
```

## Notes

- Routes should match App Router segment patterns.
- Schema names refer to builders from `@schemasentry/core`.
- The CLI combines the manifest with a schema data file to validate coverage.
