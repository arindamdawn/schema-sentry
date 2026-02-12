## Summary

Expands the roadmap with high-impact developer-experience features based on community feedback.

## Changes

### Priority Queue (Updated)

1. **Pattern-based auto-detection** — infer schema types from route conventions
2. **`schemasentry scaffold`** — TOP PRIORITY for v0.5.0 (safe write/update with dry-run)
3. **Rulesets** — Google-rich-results and AI-citation validation
4. **VS Code extension** — schema preview, snippets, inline decorations
5. **GitHub bot** — CI automation for PR comments
6. **Pages Router support** — extend beyond App Router
7. **Schema testing framework** — assertions for schema correctness
8. **AI suggestions** — read-only recommendations (moved to v0.7.0)
9-10. Plugin API, Framework adapters

### v0.5.0 Scope (Core Authoring Workflow)

- **`schemasentry scaffold`** — Generate schema for pages without it
  - Use auto-detected page types as defaults
  - Interactive prompts for customization
  - Dry-run mode by default for safety
- **Pattern-based auto-detection** — infer `/blog/*` → BlogPosting, `/products/*` → Product

### v0.6.0 Scope

- **Rulesets** — `--rules google`, `--rules ai-citation`
- **VS Code extension** — preview panel, snippets, inline decorations
- **GitHub bot** — automated PR comments
- **Pages Router support** — `@schemasentry/react` package

### v0.7.0 Scope

- **Schema testing framework** — write assertions like "all articles must have author"
- **AI suggestions** — read-only recommendations (experimental)
- **Plugin API** — custom validators for enterprise teams

### v0.8.0 Scope

- **Framework adapters** — Astro, Remix, SvelteKit, Angular
- **CMS integrations** — Sanity, Contentful, Strapi patterns

### Post-v1.0

- Visual schema editor
- GraphQL schema awareness
- i18n/multi-language support
- Schema.org deprecation alerts

---

**Documentation fixes included:**
- Update expected output format in examples README
- Add collect command options to CI docs
- Clarify CHANGELOG wording for v0.4.0 changes