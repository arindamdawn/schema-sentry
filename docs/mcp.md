# MCP Server

Model Context Protocol (MCP) server for Schema Sentry - use Schema Sentry directly from Claude Desktop, Cursor, and other AI assistants.

## Installation

```bash
# Install as dev dependency
pnpm add -D @schemasentry/mcp

# Or run directly without install
npx @schemasentry/mcp
```

## Setup

### Claude Desktop

1. Open Claude Desktop settings
2. Click **Developer** > **Edit MCP Settings**
3. Add to the JSON:

```json
{
  "mcpServers": {
    "schema-sentry": {
      "command": "npx",
      "args": ["@schemasentry/mcp"]
    }
  }
}
```

4. Restart Claude Desktop

### Cursor

1. Open Cursor Settings (Cmd+, on Mac, Ctrl+, on Windows)
2. Navigate to **MCP** tab
3. Click **Add new server**
4. Enter the command: `npx @schemasentry/mcp`
5. Click **Add Server**
6. Restart Cursor

### Zed Editor

Add to your `~/.zed/settings.json`:

```json
{
  "mcp": {
    "schema-sentry": {
      "command": "npx",
      "args": ["@schemasentry/mcp"]
    }
  }
}
```

### VS Code (with Copilot)

VS Code doesn't have native MCP support yet. Use the [MCP VS Code extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.example) or wait for official support.

### Other MCP Clients

Any MCP-compatible client can connect:

```bash
npx @schemasentry/mcp
```

The server uses stdio transport by default.

## Tools

### schemasentry_validate

Validate schema by checking built HTML output against manifest. Validates reality, not just config files.

**Parameters:**
- `manifest` (string, optional) - Path to manifest JSON, defaults to `schema-sentry.manifest.json`
- `root` (string, optional) - Root directory containing built HTML output
- `appDir` (string, optional) - Path to Next.js app directory, defaults to `./app`
- `format` (string, optional) - Output format: `json`, `table`, or `tree`

**Example:**
```json
{
  "manifest": "schema-sentry.manifest.json",
  "root": "./.next/server/app"
}
```

### schemasentry_audit

Analyze schema health and check for ghost routes (routes in manifest without Schema components).

**Parameters:**
- `manifest` (string, optional) - Path to manifest JSON
- `root` (string, optional) - Project root for scanning
- `appDir` (string, optional) - Path to Next.js app directory
- `sourceScan` (boolean, optional) - Enable source file scanning, defaults to `true`

### schemasentry_collect

Collect JSON-LD blocks from built HTML output.

**Parameters:**
- `root` (string, optional) - Root directory to scan for HTML files
- `routes` (string[], optional) - Only collect specific routes

### schemasentry_scaffold

Generate schema code for pages without schema - shows copy-paste examples.

**Parameters:**
- `root` (string, optional) - Root directory to scan for page files
- `routes` (string[], optional) - Specific routes to scaffold

### schemasentry_scan

Scan source files to detect Schema component usage - returns routes with/without schema.

**Parameters:**
- `root` (string, optional) - Project root directory
- `appDir` (string, optional) - Path to Next.js app directory

### schemasentry_suggest

AI-powered schema suggestions - analyzes routes and generates contextualized schema recommendations using your own AI provider (OpenAI, Anthropic, Google, etc.).

This is the **key tool** for generating real, contextualized schema based on your actual page content. The AI analyzes your routes and provides:
- Suggested schema types based on URL patterns
- Required fields for each schema type
- Recommendations for SEO and AI discoverability

**Parameters:**
- `routes` (string[], optional) - Routes to analyze. If not provided, will scan your app directory automatically
- `provider` (string, optional) - AI provider: `openai`, `anthropic`, `google`, `nvidia`, or `openrouter`. Default: `openai`
- `apiKey` (string, optional) - API key for the AI provider. Can also set via environment variable
- `model` (string, optional) - Model to use (provider-specific defaults if omitted)

**No API key needed if you already have one for other tools!**

The MCP will auto-detect API keys from environment variables. If you use OpenAI for Copilot, Claude Code, or any other AI tool, just set:

```bash
# In your shell profile (~/.zshrc, ~/.bashrc)
export OPENAI_API_KEY="sk-..."
# OR for Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

Then just call the tool without an apiKey parameter:

```json
{
  "provider": "openai"
}
```

Or even simpler - it auto-detects which provider you have a key for:

```json
{}
```

**Example:**
```json
{
  "routes": ["/", "/blog", "/products", "/about"],
  "provider": "openai"
}
```

Or let AI scan your app automatically:
```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-..."
}
```

## Resources

### schema://health

Returns current schema validation status.

### schema://manifest

Returns contents of `schema-sentry.manifest.json`.

## Example Conversations

### Validate Schema

```
You: "Validate my site's schema to make sure all pages have proper structured data"

Claude: [calls schemasentry_validate tool]
→ Returns:
{
  "ok": true,
  "summary": {
    "routes": 10,
    "score": 95,
    "errors": 0,
    "warnings": 2
  },
  "routes": [...]
}
```

### Find Missing Schema

```
You: "Which pages on my site are missing schema markup?"

Claude: [calls schemasentry_scan]
→ Returns:
{
  "routes": [
    { "route": "/about", "hasSchemaUsage": false },
    { "route": "/contact", "hasSchemaUsage": true }
  ],
  "filesMissingSchema": 1
}
```

### Generate Schema Code

```
You: "Add schema to my blog pages - they're missing structured data"

Claude: [calls schemasentry_scaffold with root: "./app"]
→ Returns:
[
  {
    "route": "/blog",
    "filePath": "/path/to/app/blog/page.tsx",
    "suggestedTypes": ["Blog", "Article"],
    "code": "import { Schema, BlogPosting } from '@schemasentry/next';\n\n<Schema data={BlogPosting({...})} />"
  }
]
```

### Audit Ghost Routes

```
You: "Find any routes in my manifest that don't have Schema components in the source code"

Claude: [calls schemasentry_audit]
→ Returns:
{
  "ghostRoutes": ["/deprecated", "/old-page"],
  "sourceScan": {...},
  "report": {...}
}
```

### Check Manifest

```
You: "Show me what schema types are expected on my home page"

Claude: [reads schema://manifest]
→ Returns:
{
  "routes": {
    "/": ["Organization", "WebSite"],
    "/blog": ["Article", "BreadcrumbList"]
  }
}
```

### AI-Powered Schema Generation (Key Feature!)

```
You: "Analyze my routes and suggest what schema types I should add"

Claude: [calls schemasentry_suggest without routes - it scans automatically]
→ Returns:
{
  "ok": true,
  "provider": "openai",
  "suggestions": [
    {
      "route": "/",
      "suggestedType": "Organization",
      "missingFields": ["name", "url"],
      "recommendations": ["Add logo for image search", "Add contact info for local SEO"]
    },
    {
      "route": "/blog",
      "suggestedType": "Blog",
      "missingFields": ["description"],
      "recommendations": ["Add blog posting schema to articles", "Include datePublished"]
    },
    {
      "route": "/products",
      "suggestedType": "Product",
      "missingFields": ["name", "offers", "price"],
      "recommendations": ["Add aggregateRating for social proof", "Include review schema"]
    }
  ]
}
```

```
You: "Generate schema suggestions for my /about page using Anthropic"

Claude: [calls schemasentry_suggest with provider: "anthropic"]
→ Returns:
{
  "ok": true,
  "provider": "anthropic",
  "suggestions": [
    {
      "route": "/about",
      "suggestedType": "AboutPage",
      "missingFields": ["description"],
      "recommendations": [
        "Use Organization schema for company info",
        "Add founder Person schema",
        "Include historical data if applicable"
      ]
    }
  ]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SCHEMA_SENTRY_ROOT` | Project root directory | Current working directory |
| `SCHEMA_SENTRY_MANIFEST` | Path to manifest | `schema-sentry.manifest.json` |

## Programmatic Usage

### Python (MCP SDK)

```python
from mcp import ClientSession, StdioServerParameters
import asyncio

async def main():
    params = StdioServerParameters(
        command="npx",
        args=["@schemasentry/mcp"]
    )
    
    async with ClientSession(params) as session:
        # Initialize
        await session.initialize()
        
        # List tools
        tools = await session.list_tools()
        print(tools)
        
        # Call validate
        result = await session.call_tool("schemasentry_validate", {
            "manifest": "schema-sentry.manifest.json"
        })
        print(result)

asyncio.run(main())
```

### TypeScript

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
const server = new Server({ name: "my-app", version: "1.0.0" });

// Use the MCP server as a library
import { performRealityCheck, scanSourceFiles } from "@schemasentry/cli";
```

## Troubleshooting

### Server not starting

```bash
# Check Node.js version (requires 18+)
node --version

# Try with verbose output
DEBUG=* npx @schemasentry/mcp
```

### Tools not available

1. Restart your AI client
2. Check the MCP settings JSON is valid
3. Try reinstalling: `pnpm add -D @schemasentry/mcp`

### Path issues

Set the project root explicitly:

```json
{
  "mcpServers": {
    "schema-sentry": {
      "command": "npx",
      "args": ["@schemasentry/mcp"],
      "env": {
        "SCHEMA_SENTRY_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

## See Also

- [Validation Guide](../validation.md) - Understanding reality check validation
- [Manifest Guide](../manifest.md) - Managing schema manifest
- [CLI Reference](./cli.md) - Full CLI documentation
