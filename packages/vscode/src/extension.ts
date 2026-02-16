import * as vscode from 'vscode';
import * as path from 'path';

let decorationType: vscode.TextEditorDecorationType | undefined;
let previewPanel: vscode.WebviewPanel | undefined;

const SCHEMA_TYPES = [
  { label: 'Organization', description: 'Company or business entity' },
  { label: 'Person', description: 'Individual person' },
  { label: 'Article', description: 'News article or blog post' },
  { label: 'BlogPosting', description: 'Blog post' },
  { label: 'Product', description: 'Product item for sale' },
  { label: 'FAQPage', description: 'Frequently Asked Questions' },
  { label: 'HowTo', description: 'How-to guide or tutorial' },
  { label: 'Event', description: 'Event or occasion' },
  { label: 'Review', description: 'Product or service review' },
  { label: 'LocalBusiness', description: 'Local business with physical location' },
  { label: 'VideoObject', description: 'Video content' },
  { label: 'ImageObject', description: 'Image content' },
  { label: 'WebSite', description: 'Website' },
  { label: 'BreadcrumbList', description: 'Breadcrumb navigation' }
];

function activate(context: vscode.ExtensionContext) {
  console.log('Schema Sentry extension activated');
  
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.text = '$(shield) Schema Sentry';
  statusBar.command = 'schemasentry.preview';
  statusBar.tooltip = 'Schema Sentry - Click to preview schema';
  statusBar.show();
  context.subscriptions.push(statusBar);

  vscode.window.showInformationMessage('Schema Sentry extension activated!');

  registerCommands(context);
  registerEventHandlers(context);
  loadConfiguration(context);
}

function registerCommands(context: vscode.ExtensionContext) {
  const previewCmd = vscode.commands.registerCommand('schemasentry.preview', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text) {
      vscode.window.showInformationMessage('Select code to preview schema');
      return;
    }

    showPreviewPanel(context, text, editor);
  });

  const addSchemaCmd = vscode.commands.registerCommand('schemasentry.addSchema', async () => {
    const items = SCHEMA_TYPES.map(st => ({
      label: st.label,
      description: st.description
    }));

    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select schema type to add'
    });

    if (picked) {
      const snippet = generateSchemaSnippet(picked.label);
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.insertSnippet(new vscode.SnippetString(snippet));
        vscode.window.showInformationMessage(`Added ${picked.label} schema`);
      }
    }
  });

  const validateCmd = vscode.commands.registerCommand('schemasentry.validate', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor');
      return;
    }

    const document = editor.document;
    const text = document.getText();

    const issues = validateSchemaInCode(text);
    
    if (issues.length === 0) {
      vscode.window.showInformationMessage('No schema issues found');
    } else {
      showValidationResults(issues);
    }
  });

  context.subscriptions.push(previewCmd, addSchemaCmd, validateCmd);
}

function registerEventHandlers(context: vscode.ExtensionContext) {
  vscode.workspace.onDidChangeConfiguration(() => {
    loadConfiguration(context);
  });

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      updateDecorations(editor);
    }
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.uri === event.document.uri) {
      updateDecorations(editor);
    }
  });
}

function loadConfiguration(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('schemasentry');
  const enableDecorations = config.get<boolean>('enableDecorations', true);

  if (enableDecorations) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      updateDecorations(editor);
    }
  } else {
    clearDecorations();
  }
}

function updateDecorations(editor: vscode.TextEditor) {
  const config = vscode.workspace.getConfiguration('schemasentry');
  if (!config.get<boolean>('enableDecorations', true)) {
    return;
  }

  const document = editor.document;
  const text = document.getText();
  
  const schemaMatches = findSchemaTypes(text);

  const decorations: vscode.DecorationOptions[] = schemaMatches.map(match => {
    const range = new vscode.Range(
      document.positionAt(match.start),
      document.positionAt(match.end)
    );

    return {
      range,
      renderOptions: {
        before: {
          contentText: match.type,
          backgroundColor: '#4CAF50',
          color: '#FFFFFF',
          fontWeight: 'bold',
          textDecoration: 'none; margin-right: 8px; padding: 2px 6px; border-radius: 3px;'
        }
      }
    };
  });

  if (!decorationType) {
    decorationType = vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
    });
  }

  editor.setDecorations(decorationType, decorations);
}

function clearDecorations() {
  if (decorationType) {
    decorationType.dispose();
    decorationType = undefined;
  }
}

function findSchemaTypes(text: string): { type: string; start: number; end: number }[] {
  const results: { type: string; start: number; end: number }[] = [];
  
  for (const schemaType of SCHEMA_TYPES) {
    const regex = new RegExp(`(['"\`])${schemaType.label}(['"\`])`, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({
        type: schemaType.label,
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }

  const builderRegex = /Schema\.(organization|person|article|blogPosting|product|faqPage|howTo|event|review|localBusiness|videoObject|imageObject|website|breadcrumbList)\s*\(/gi;
  let builderMatch;
  while ((builderMatch = builderRegex.exec(text)) !== null) {
    const typeName = builderMatch[1].charAt(0).toUpperCase() + builderMatch[1].slice(1);
    const camelCase = typeName.replace(/([A-Z])/g, ' $1').trim();
    const typeMap: Record<string, string> = {
      'Blog Posting': 'BlogPosting',
      'Faq Page': 'FAQPage',
      'How To': 'HowTo',
      'Local Business': 'LocalBusiness',
      'Video Object': 'VideoObject',
      'Image Object': 'ImageObject',
      'Web Site': 'WebSite',
      'Breadcrumb List': 'BreadcrumbList'
    };
    results.push({
      type: typeMap[camelCase] || typeName,
      start: builderMatch.index,
      end: builderMatch.index + builderMatch[0].length
    });
  }

  return results;
}

function generateSchemaSnippet(type: string): string {
  const snippets: Record<string, string> = {
    Organization: `import { Schema } from '@schemasentry/next';

export function organizationSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '$1',
        url: '$2',
        logo: '$3',
      }}
    />
  );
}`,
    Person: `import { Schema } from '@schemasentry/next';

export function personSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: '$1',
        url: '$2',
      }}
    />
  );
}`,
    Article: `import { Schema } from '@schemasentry/next';

export function articleSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: '$1',
        datePublished: '$2',
        author: {
          '@type': 'Person',
          name: '$3',
        },
      }}
    />
  );
}`,
    BlogPosting: `import { Schema } from '@schemasentry/next';

export function blogPostingSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: '$1',
        datePublished: '$2',
        dateModified: '$3',
        author: {
          '@type': 'Person',
          name: '$4',
        },
      }}
    />
  );
}`,
    Product: `import { Schema } from '@schemasentry/next';

export function productSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: '$1',
        description: '$2',
        offers: {
          '@type': 'Offer',
          price: '$3',
          priceCurrency: 'USD',
        },
      }}
    />
  );
}`,
    FAQPage: `import { Schema } from '@schemasentry/next';

export function faqSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '$1',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '$2',
            },
          },
        ],
      }}
    />
  );
}`,
    HowTo: `import { Schema } from '@schemasentry/next';

export function howToSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: '$1',
        step: [
          {
            '@type': 'HowToStep',
            name: '$2',
            text: '$3',
          },
        ],
      }}
    />
  );
}`,
    Event: `import { Schema } from '@schemasentry/next';

export function eventSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: '$1',
        startDate: '$2',
        location: {
          '@type': 'Place',
          name: '$3',
        },
      }}
    />
  );
}`,
    Review: `import { Schema } from '@schemasentry/next';

export function reviewSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Review',
        itemReviewed: {
          '@type': 'Product',
          name: '$1',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '$2',
        },
        author: {
          '@type': 'Person',
          name: '$3',
        },
      }}
    />
  );
}`,
    LocalBusiness: `import { Schema } from '@schemasentry/next';

export function localBusinessSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: '$1',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '$2',
          addressLocality: '$3',
          addressRegion: '$4',
          postalCode: '$5',
        },
        telephone: '$6',
      }}
    />
  );
}`,
    VideoObject: `import { Schema } from '@schemasentry/next';

export function videoSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: '$1',
        description: '$2',
        thumbnailUrl: '$3',
        uploadDate: '$4',
      }}
    />
  );
}`,
    ImageObject: `import { Schema } from '@schemasentry/next';

export function imageSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: '$1',
        url: '$2',
        width: '$3',
        height: '$4',
      }}
    />
  );
}`,
    WebSite: `import { Schema } from '@schemasentry/next';

export function websiteSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '$1',
        url: '$2',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: '$3?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}`,
    BreadcrumbList: `import { Schema } from '@schemasentry/next';

export function breadcrumbSchema() {
  return (
    <Schema
      schema={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '$1',
            item: '$2',
          },
        ],
      }}
    />
  );
}`
  };

  return snippets[type] || `// Add ${type} schema here`;
}

function showPreviewPanel(context: vscode.ExtensionContext, code: string, editor: vscode.TextEditor) {
  const config = vscode.workspace.getConfiguration('schemasentry');
  if (!config.get<boolean>('enablePreview', true)) {
    vscode.window.showInformationMessage('Schema preview is disabled in settings');
    return;
  }

  const detectedTypes = findSchemaTypes(code);
  const schemaTypesHtml = detectedTypes.length > 0
    ? detectedTypes.map(st => `<span class="schema-tag">${st.type}</span>`).join('')
    : '<span class="no-schema">No schema types detected</span>';

  const webviewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
        h2 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .schema-tag { 
          display: inline-block; 
          background: #4CAF50; 
          color: white; 
          padding: 4px 12px; 
          border-radius: 16px; 
          margin: 4px;
          font-size: 13px;
        }
        .no-schema { color: #999; font-style: italic; }
        .schema-list { margin-top: 20px; }
        .info { color: #666; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <h2>Schema Sentry Preview</h2>
      <div class="schema-list">
        <strong>Detected Schema Types:</strong><br/><br/>
        ${schemaTypesHtml}
      </div>
      <div class="info">
        <p>Available schema types: ${SCHEMA_TYPES.map(s => s.label).join(', ')}</p>
      </div>
    </body>
    </html>
  `;

  if (previewPanel) {
    previewPanel.reveal(vscode.ViewColumn.Two);
  } else {
    previewPanel = vscode.window.createWebviewPanel(
      'schemaPreview',
      'Schema Sentry Preview',
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    previewPanel.webview.html = webviewHtml;

    previewPanel.onDidDispose(() => {
      previewPanel = undefined;
    });
  }
}

function validateSchemaInCode(text: string): string[] {
  const issues: string[] = [];
  const detectedTypes = findSchemaTypes(text);

  if (detectedTypes.length === 0) {
    issues.push('No schema types found in the selected code');
  }

  const hasOrganization = detectedTypes.some(d => d.type === 'Organization');
  const hasWebsite = detectedTypes.some(d => d.type === 'WebSite');
  
  if (!hasOrganization && !hasWebsite) {
    issues.push('Consider adding an Organization or WebSite schema for better SEO');
  }

  return issues;
}

function showValidationResults(issues: string[]) {
  const channel = vscode.window.createOutputChannel('Schema Sentry Validation');
  channel.clear();
  channel.appendLine('=== Schema Sentry Validation Results ===\n');
  
  issues.forEach((issue, index) => {
    channel.appendLine(`${index + 1}. ${issue}`);
  });
  
  channel.show();
}

function deactivate() {
  clearDecorations();
  if (previewPanel) {
    previewPanel.dispose();
  }
}

export { activate, deactivate };
