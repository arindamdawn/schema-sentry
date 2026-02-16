# Schema Sentry VS Code Extension

Type-safe JSON-LD structured data helpers for VS Code.

## Features

### 📋 Snippets
Type `schema-` in a .tsx/.js file to see available snippets:
- `schema-organization` - Organization schema
- `schema-person` - Person schema
- `schema-article` - Article schema
- `schema-blogposting` - BlogPosting schema
- `schema-product` - Product schema
- `schema-faq` - FAQPage schema
- `schema-howto` - HowTo schema
- `schema-event` - Event schema
- `schema-localbusiness` - LocalBusiness schema
- `schema-website` - WebSite schema

### 🎯 Commands
- `Schema Sentry: Preview Schema` - View detected schema types in preview panel
- `Schema Sentry: Add Schema Type` - Quick pick to insert schema snippet
- `Schema Sentry: Validate File` - Show validation issues in output

### ✨ Inline Decorations
Automatically shows schema type badges in the editor when editing TSX/JS files.

### ⚙️ Settings
- `schemasentry.enablePreview` - Enable schema preview panel (default: true)
- `schemasentry.enableDecorations` - Show schema type decorations (default: true)

## Installation

```bash
code --install-extension schema-sentry-vscode-0.9.0.vsix
```

## Requirements

- VS Code 1.99.0+
- TypeScript or JavaScript files
