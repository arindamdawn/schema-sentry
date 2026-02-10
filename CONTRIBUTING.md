# Contributing

Thanks for your interest in Schema Sentry. This project is maintained by a solo builder, so keeping scope tight is critical.

## Scope

V1 focuses on **Next.js App Router** only. Requests for other frameworks should be opened as roadmap issues. Contributor-led PRs are welcome.

Standard response for out-of-scope requests:

> That's a great idea. The focus right now is perfecting the App Router experience. I've noted it on the roadmap. PRs are welcome!

## Development Setup

```bash
pnpm install
pnpm build
```

## Workspace Scripts

- `pnpm build` — build all packages
- `pnpm lint` — lint all packages
- `pnpm test` — run tests (currently minimal)

## Pull Requests

- Keep PRs small and focused
- Add or update tests where appropriate
- Update docs and changelog for user-facing changes

## Releases

This repo uses Changesets for versioning and releases.

Typical flow:

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

Automation runs in GitHub Actions and requires a `NPM_TOKEN` secret with publish access.

## Code of Conduct

By participating, you agree to the Code of Conduct in `CODE_OF_CONDUCT.md`.
