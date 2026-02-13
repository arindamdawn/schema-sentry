## Summary

Expands the roadmap with high-impact developer-experience features based on community feedback.

## Changes

### Priority Queue (Updated)

1. **v0.7.0** - Rulesets (`google`, `ai-citation`) + CLI visualization (table default)
2. **v0.8.0** - GitHub bot + Pages Router support
3. **v0.9.0** - VS Code extension + Plugin API + Framework adapters
4. **v0.9.1** - AI suggestions (`schemasentry suggest`) + provider architecture

### v0.7.0 Scope (Rulesets + Visualization)

- **Rulesets**
  - `--rules google` for Google rich-result-focused checks
  - `--rules ai-citation` for LLM/citation-focused checks
  - Shared rule engine architecture for extensibility
- **CLI schema visualization**
  - Table output by default (`--format table`)
  - Columns: Route, Schema Types, Blocks, Status
  - Tree output for hierarchical view (`--format tree`)

### v0.8.0 Scope

- **GitHub bot** — automated PR comments for schema review
- **Pages Router support** — `@schemasentry/react` package
- **Schema testing framework** — assertions like "all articles must have author"
- **Team policy controls** — rule severity overrides, allowlist/denylist

### v0.9.0 Scope

- **VS Code extension** — preview panel, snippets
- **Plugin API** — custom validators for enterprise teams
- **Framework adapters** — Astro or Remix (first non-Next.js)

### v0.9.1 Scope

- **AI suggestions** — `schemasentry suggest` (read-only, experimental)
- **Provider architecture** — OpenAI, Anthropic, Gemini, OpenRouter support

### v1.0.0

- Stable API contract
- Comprehensive test coverage (>80%)
- Product Hunt launch
