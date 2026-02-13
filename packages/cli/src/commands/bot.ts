import { Command } from "commander";
import chalk from "chalk";
import { stableStringify, type Manifest, type SchemaTypeName } from "@schemasentry/core";
import { resolveCliVersion } from "./utils.js";
import type { RulesetName } from "../rules/index.js";

export const botCommand = new Command()
  .name("bot")
  .description("GitHub Bot for automated PR schema reviews")
  .version(resolveCliVersion())
  .option(
    "--pr <url>",
    "PR URL to post comment to (e.g., https://github.com/owner/repo/pull/123)"
  )
  .option(
    "--manifest <path>",
    "Path to manifest JSON",
    "schema-sentry.manifest.json"
  )
  .option(
    "--root <path>",
    "Root directory containing built HTML output",
    ".next/server/app"
  )
  .option(
    "--rules <rulesets>",
    "Run rulesets (google,ai-citation). Comma-separated for multiple."
  )
  .option(
    "--token <token>",
    "GitHub token (defaults to GITHUB_TOKEN env var)"
  )
  .option(
    "--event <event>",
    "GitHub event type (pull_request, issue_comment)"
  )
  .action(async (options: {
    pr?: string;
    manifest: string;
    root: string;
    rules?: string;
    token?: string;
    event?: string;
  }) => {
    const token = options.token || process.env.GITHUB_TOKEN;
    
    if (!token) {
      console.error(chalk.red("Error: GITHUB_TOKEN is required"));
      console.error(chalk.gray("Set GITHUB_TOKEN env var or pass --token"));
      process.exit(1);
    }

    console.log(chalk.blue.bold("🔍 Schema Sentry Bot"));
    console.log(chalk.gray("Automated PR schema review\n"));

    if (!options.pr && !options.event) {
      console.log(chalk.yellow("Usage:"));
      console.log(chalk.gray("  # Post validation result to a PR"));
      console.log(chalk.cyan("  schemasentry bot --pr https://github.com/owner/repo/pull/123"));
      console.log(chalk.gray("\n  # As GitHub Action (event-based)"));
      console.log(chalk.cyan("  schemasentry bot --event pull_request"));
      console.log(chalk.gray("\n  # With rulesets"));
      console.log(chalk.cyan("  schemasentry bot --pr <url> --rules google,ai-citation"));
      process.exit(0);
    }

    const prUrl = options.pr;
    const eventType = options.event;

    if (prUrl) {
      await postToPR(prUrl, token, options);
    } else if (eventType) {
      await handleEvent(eventType, token, options);
    }
  });

async function postToPR(
  prUrl: string,
  token: string,
  options: {
    manifest: string;
    root: string;
    rules?: string;
  }
): Promise<void> {
  const { owner, repo, pullNumber } = parsePRUrl(prUrl);
  
  if (!owner || !repo || !pullNumber) {
    console.error(chalk.red("Invalid PR URL format"));
    console.error(chalk.gray("Expected: https://github.com/owner/repo/pull/123"));
    process.exit(1);
  }

  console.log(chalk.gray(`Posting to ${owner}/${repo} PR #${pullNumber}...`));

  const validationResult = await runValidation(options);
  
  const commentBody = formatBotComment(validationResult, options);
  
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          body: commentBody
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log(chalk.green(`✅ Comment posted: ${result.html_url}`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(chalk.red(`Failed to post comment: ${message}`));
    process.exit(1);
  }
}

async function handleEvent(
  eventType: string,
  token: string,
  options: {
    manifest: string;
    root: string;
    rules?: string;
  }
): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  
  if (!eventPath) {
    console.error(chalk.red("Error: GITHUB_EVENT_PATH not found"));
    console.error(chalk.gray("This command should be run in GitHub Actions"));
    process.exit(1);
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  try {
    const eventData = JSON.parse(await fs.readFile(eventPath, "utf-8"));

    if (eventType === "pull_request") {
      const pr = eventData.pull_request;
      if (!pr) {
        console.error(chalk.red("No pull_request data in event"));
        process.exit(1);
      }

      const prUrl = pr.html_url;
      console.log(chalk.gray(`Processing PR: ${prUrl}`));

      await postToPR(prUrl, token, options);
    } else if (eventType === "issue_comment") {
      const comment = eventData.comment;
      const issue = eventData.issue;

      if (!comment || !issue) {
        console.error(chalk.red("No comment or issue data in event"));
        process.exit(1);
      }

      if (!comment.body.includes("/schemasentry")) {
        console.log(chalk.gray("Skipping - not a /schemasentry command"));
        return;
      }

      const prUrl = issue.pull_request?.html_url;
      if (!prUrl) {
        console.log(chalk.gray("Skipping - not a PR comment"));
        return;
      }

      console.log(chalk.gray(`Processing /schemasentry command from: ${comment.html_url}`));
      await postToPR(prUrl, token, options);
    } else {
      console.error(chalk.red(`Unsupported event type: ${eventType}`));
      process.exit(1);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(chalk.red(`Failed to handle event: ${message}`));
    process.exit(1);
  }
}

interface ValidationResult {
  ok: boolean;
  summary: {
    routes: number;
    errors: number;
    warnings: number;
    score: number;
  };
  rules?: string;
}

async function runValidation(options: {
  manifest: string;
  root: string;
  rules?: string;
}): Promise<ValidationResult> {
  console.log(chalk.gray("Running validation...\n"));

  const { performRealityCheck } = await import("../reality.js");
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const { collectSchemaData } = await import("../collect.js");
  const { runMultipleRulesets } = await import("../rules/index.js");

  const cwd = process.cwd();
  const manifestPath = path.resolve(cwd, options.manifest);
  const builtOutputDir = path.resolve(cwd, options.root);

  let manifest: Manifest;
  try {
    const raw = await readFile(manifestPath, "utf-8");
    const parsed = JSON.parse(raw);
    manifest = {
      routes: Object.fromEntries(
        Object.entries(parsed.routes || {}).map(
          ([k, v]: [string, unknown]) => [k, (v as string[]).map(t => t as SchemaTypeName)]
        )
      )
    };
  } catch {
    console.error(chalk.red(`Manifest not found at ${manifestPath}`));
    process.exit(1);
  }

  const collected = await collectSchemaData({ rootDir: builtOutputDir });

  const report = await performRealityCheck({
    manifest,
    builtOutputDir,
    sourceDir: path.resolve(cwd, "app"),
    recommended: true
  });

  if (options.rules) {
    const rulesets = options.rules.split(",").map((r) => r.trim() as RulesetName);
    const routesData = collected.data.routes || {};

    for (const route of report.routes) {
      const nodes = routesData[route.route] || [];
      const result = runMultipleRulesets(rulesets, nodes);
      report.routes[report.routes.indexOf(route)].issues.push(...result.issues);
      report.summary.errors += result.summary.errors;
      report.summary.warnings += result.summary.warnings;
    }
    report.ok = report.summary.errors === 0;
  }

  return {
    ok: report.ok,
    summary: report.summary,
    rules: options.rules
  };
}

function formatBotComment(
  result: ValidationResult,
  options: { manifest: string; root: string; rules?: string }
): string {
  const icon = result.ok ? "✅" : "❌";
  const status = result.ok ? "All checks passed!" : "Schema issues found";

  let rulesInfo = "";
  if (options.rules) {
    rulesInfo = `\n**Rulesets:** ${options.rules}`;
  }

  return `## 🔍 Schema Sentry Bot Review ${icon}

${status}

| Metric | Value |
|--------|-------|
| Routes | ${result.summary.routes} |
| Errors | ${result.summary.errors} |
| Warnings | ${result.summary.warnings} |
| Score | ${result.summary.score}/100 |
${rulesInfo}

---
*Run with: \`schemasentry validate --manifest ${options.manifest} --root ${options.root}${options.rules ? ` --rules ${options.rules}` : ""}\`*`;
}

function parsePRUrl(url: string): {
  owner?: string;
  repo?: string;
  pullNumber?: number;
} {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) {
    return {};
  }
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: parseInt(match[3], 10)
  };
}
