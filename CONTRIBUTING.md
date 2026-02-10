# Contributing to Schema Sentry

First off, thanks for your interest in contributing! 🎉 This project is maintained by a solo builder, so keeping scope tight is critical, but your help is invaluable.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Scope](#project-scope)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Release Process](#release-process)

## 🤝 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 9+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/arindamdawn/schema-sentry.git
cd schema-sentry

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
schema-sentry/
├── packages/
│   ├── core/          # Core builders and validation
│   ├── next/          # Next.js App Router component
│   └── cli/           # CLI tool
├── examples/
│   └── next-app/      # Example Next.js application
├── docs/              # Documentation
└── .github/           # GitHub templates and workflows
```

## 🔄 Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes**
   - Write code
   - Add/update tests
   - Update documentation

3. **Run checks locally**
   ```bash
   pnpm build        # Build all packages
   pnpm test         # Run tests
   pnpm typecheck    # TypeScript checks
   ```

4. **Add a changeset** (for user-facing changes)
   ```bash
   pnpm changeset
   ```
   - Select affected packages
   - Choose bump type (patch/minor/major)
   - Write a clear description

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new schema type"
   git push origin feature/your-feature-name
   ```

## 🎯 Project Scope

**V1 focuses on Next.js App Router only.**

### What's In Scope ✅

- Next.js App Router integration
- Core schema.org types
- CLI validation tools
- CI/CD workflows

### What's Out of Scope (for now) ❌

- Other frameworks (React, Vue, Svelte, etc.)
- Pages Router support (deprecated)
- Advanced schema features not commonly used

**Standard response for out-of-scope requests:**

> That's a great idea! The focus right now is perfecting the App Router experience. I've noted it on the roadmap. PRs are welcome for framework-agnostic support!

## 📝 Pull Request Process

1. **Before submitting:**
   - [ ] Tests pass locally
   - [ ] Changes are focused and minimal
   - [ ] Documentation updated if needed
   - [ ] Changeset added if user-facing
   - [ ] PR template filled out

2. **PR Title Format:**
   - `feat: description` - New features
   - `fix: description` - Bug fixes
   - `docs: description` - Documentation
   - `refactor: description` - Code refactoring
   - `test: description` - Tests
   - `chore: description` - Maintenance

3. **Review Process:**
   - PRs will be reviewed within 48-72 hours
   - Address feedback promptly
   - Keep discussions respectful

## 💬 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Build process, dependencies, etc.

**Examples:**
```
feat(core): add Event schema builder

fix(next): resolve hydration issue with Schema component

docs: update README with new CLI options
```

## 🏷️ Issue Labels

We use labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature requests
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `roadmap` - Planned for future versions

## 🚀 Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for versioning.

### For Contributors

Just add a changeset with your PR:
```bash
pnpm changeset
```

### For Maintainers

1. **Version packages:**
   ```bash
   pnpm version-packages
   ```

2. **Publish to npm:**
   ```bash
   pnpm release
   ```

**Note:** Releases are automated via GitHub Actions when changeset PRs are merged.

## 🆘 Getting Help

- 💬 [GitHub Discussions](https://github.com/arindamdawn/schema-sentry/discussions) - Q&A and general discussion
- 🐛 [Issues](https://github.com/arindamdawn/schema-sentry/issues) - Bug reports and feature requests
- 📧 For security issues, see [SECURITY.md](SECURITY.md)

## 🙏 Thank You!

Every contribution, no matter how small, helps make Schema Sentry better for the community. Thank you for your time and effort! 🎉

---

**Happy coding!** 🚀
