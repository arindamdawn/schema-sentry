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
- `validate` combines the manifest with built HTML output to verify rendered schema.
- `audit` can optionally combine the manifest with a schema data file in legacy mode.
- Use `schemasentry init` to generate a starter manifest.
- Use `schemasentry init --scan` to include all discovered routes as `WebPage` entries.
- Use `schemasentry audit --scan` to detect missing routes after setup.
