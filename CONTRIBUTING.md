# Contributing to Schema Sentry

Thanks for your interest in contributing. This project is maintained by a solo builder, so keeping scope tight is important.

## 🧾 Code of Conduct

This project follows the Contributor Covenant. See `CODE_OF_CONDUCT.md`.

## 🚀 Getting Started

Prerequisites:

- Node.js 18+
- pnpm 9+
- Git

Setup:

```bash
git clone https://github.com/arindamdawn/schema-sentry.git
cd schema-sentry
pnpm install
pnpm build
pnpm test
```

## 🔁 Development Workflow

1. Create a branch.
2. Make changes with tests.
3. Run local checks:

```bash
pnpm build
pnpm test
pnpm typecheck
```

4. Add a changeset for user-facing changes:

```bash
pnpm changeset
```

5. Commit and push.

## 🧭 Scope

V1 focuses on Next.js App Router only.

Out-of-scope requests should receive this response:

> That's a great idea. The focus right now is perfecting the App Router experience. I've noted it on the roadmap. PRs are welcome!

## ✅ Pull Requests

- Keep PRs small and focused
- Add or update tests where appropriate
- Update docs for user-facing changes
- Add a changeset when behavior changes
- Fill out the PR template

Suggested PR title prefixes: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

## 🚢 Release Process

This repo uses Changesets.

For contributors:

```bash
pnpm changeset
```

For maintainers:

```bash
pnpm version-packages
pnpm release
```

Releases run in GitHub Actions and require a `NPM_TOKEN` secret.

## 💬 Getting Help

- Issues: https://github.com/arindamdawn/schema-sentry/issues
- Discussions: https://github.com/arindamdawn/schema-sentry/discussions
- Security issues: see `SECURITY.md`
