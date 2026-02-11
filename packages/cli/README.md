# @schemasentry/cli

CLI for Schema Sentry validation and reporting.

## Install

```bash
pnpm add -D @schemasentry/cli
npm install -D @schemasentry/cli
```

## Commands

### `init`

Generate starter manifest and data files:

```bash
pnpm schemasentry init
```

With route scanning:

```bash
pnpm schemasentry init --scan
```

### `validate`

Check schema coverage and validation:

```bash
pnpm schemasentry validate --manifest ./schema-sentry.manifest.json --data ./schema-sentry.data.json
```

With GitHub annotations:

```bash
pnpm schemasentry validate --annotations github
```

### `audit`

Analyze site-wide schema health:

```bash
pnpm schemasentry audit --data ./schema-sentry.data.json --manifest ./schema-sentry.manifest.json
```

With HTML report:

```bash
pnpm schemasentry audit \
  --data ./schema-sentry.data.json \
  --format html \
  --output ./report.html
```

## Options

| Option | Description |
|--------|-------------|
| `--format json\|html` | Output format |
| `--annotations none\|github` | CI annotations |
| `-o, --output <path>` | Write output to file |
| `--recommended / --no-recommended` | Enable recommended field checks |

## Documentation

See [Schema Sentry Docs](https://github.com/arindamdawn/schema-sentry#readme)
