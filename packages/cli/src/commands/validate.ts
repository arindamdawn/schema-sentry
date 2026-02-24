import { Command } from "commander";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "path";
import chalk from "chalk";
import { stableStringify, type Manifest } from "@schemasentry/core";
import type { Report } from "../report";
import { renderHtmlReport } from "../html";
import { emitGitHubAnnotations } from "../annotations";
import { formatDuration } from "../summary";
import {
  performRealityCheck,
  type RealityCheckReport
} from "../reality";

import { formatRealityReportTable, formatRealityReportTree } from "../visualize.js";
import {
  resolveOutputFormat,
  resolveAnnotationsMode,
  resolveRecommendedOption,
  resolveRulesets,
  printCliError,
  isManifest
} from "./utils.js";

import { runMultipleRulesets, parseRulesetNames } from "../rules/index.js";
import { collectSchemaData } from "../collect.js";
import { scanSourceFiles } from "../source.js";

const DEFAULT_BUILD_OUTPUT_CANDIDATES = [
  ".next/server/app",
  "out",
  ".next/server/pages"
] as const;

export const resolveBuildOutputCandidates = (
  cwd: string,
  explicitRoot?: string
): string[] => {
  if (explicitRoot && explicitRoot.trim().length > 0) {
    return [path.resolve(cwd, explicitRoot)];
  }

  const seen = new Set<string>();
  const resolved: string[] = [];
  for (const candidate of DEFAULT_BUILD_OUTPUT_CANDIDATES) {
    const absolute = path.resolve(cwd, candidate);
    if (!seen.has(absolute)) {
      seen.add(absolute);
      resolved.push(absolute);
    }
  }
  return resolved;
};

export const resolveExistingBuildOutputDir = async (
  candidates: string[]
): Promise<string | undefined> => {
  for (const candidate of candidates) {
    try {
      // Check if directory exists (throws if not accessible)
      await access(candidate);
      return candidate;
    } catch {
      // Directory doesn't exist or isn't accessible - continue to next candidate
    }
  }
  return undefined;
};

const runBuildCommand = async (command: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, {
      stdio: "inherit",
      shell: true
    });

    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(`Build command exited with code ${code ?? "unknown"}`)
      );
    });
  });

export const validateCommand = new Command("validate")
  .description("Validate schema by checking built HTML output against manifest (validates reality, not just config files)")
  .option(
    "-m, --manifest <path>",
    "Path to manifest JSON",
    "schema-sentry.manifest.json"
  )
  .option(
    "-r, --root <path>",
    "Root directory containing built HTML output (auto-detected when omitted)"
  )
  .option("--build", "Run build before validation using --build-command")
  .option(
    "--build-command <command>",
    "Build command used with --build",
    "pnpm build"
  )
  .option(
    "--app-dir <path>",
    "Path to Next.js app directory for source scanning",
    "./app"
  )
  .option("-c, --config <path>", "Path to config JSON")
  .option("--format <format>", "Report format (json|html|table|tree)", "table")
  .option("--annotations <provider>", "Emit CI annotations (none|github)", "none")
  .option("-o, --output <path>", "Write report output to file")
  .option("--rules <rulesets>", "Run rulesets (google,ai-citation). Comma-separated for multiple.")
  .option("--recommended", "Enable recommended field checks")
  .option("--no-recommended", "Disable recommended field checks")
  .action(async (options: {
    manifest: string;
    root?: string;
    build?: boolean;
    buildCommand?: string;
    appDir?: string;
    config?: string;
    format?: string;
    annotations?: string;
    output?: string;
    rules?: string;
  }) => {
    const start = Date.now();
    const format = resolveOutputFormat(options.format);
    const annotationsMode = resolveAnnotationsMode(options.annotations);
    const recommended = await resolveRecommendedOption(options.config);
    const rulesets = resolveRulesets(options.rules);
    const cwd = process.cwd();
    const manifestPath = path.resolve(cwd, options.manifest);
    const appDir = path.resolve(cwd, options.appDir ?? "./app");

    // Load manifest (optional - will use source scanning if not found)
    let manifest: Manifest | undefined;
    let manifestLoaded = false;
    try {
      const raw = await readFile(manifestPath, "utf8");
      manifest = JSON.parse(raw) as Manifest;
      if (!isManifest(manifest)) {
        printCliError(
          "manifest.invalid_shape",
          "Manifest must contain a 'routes' object with string array values",
          "Ensure each route maps to an array of schema type names."
        );
        process.exit(1);
        return;
      }
      manifestLoaded = true;
    } catch {
      // Manifest not found - will use source scanning to build virtual manifest
      console.error(chalk.gray(`No manifest found at ${manifestPath}, using source scanning...\n`));
    }

    // Print header
    console.error(chalk.blue.bold("🔍 Schema Sentry Reality Check"));
    if (manifestLoaded) {
      console.error(chalk.gray("Validating actual built HTML against manifest expectations...\n"));
    } else {
      console.error(chalk.gray("Running in manifest-less mode - validating source against built HTML...\n"));
    }

    if (options.build) {
      const buildCommand = options.buildCommand ?? "pnpm build";
      console.error(chalk.gray(`Running build command: ${buildCommand}\n`));
      try {
        await runBuildCommand(buildCommand);
        console.error(chalk.gray("\nBuild completed.\n"));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        printCliError(
          "validate.build_failed",
          `Build failed before validation: ${message}`,
          "Fix build errors or run validate without --build and pass an existing --root."
        );
        process.exit(1);
        return;
      }
    }

    const candidateRoots = resolveBuildOutputCandidates(cwd, options.root);
    const builtOutputDir = await resolveExistingBuildOutputDir(candidateRoots);
    if (!builtOutputDir) {
      const checkedPaths = candidateRoots
        .map((candidate) => path.relative(cwd, candidate) || ".")
        .map((candidate) => `- ${candidate}`)
        .join("\n");

      const help = options.root
        ? "Build your app first or pass a valid --root directory with built HTML output."
        : "Build your app first (`next build`), run with --build, or pass --root explicitly.";

      printCliError(
        "validate.no_build_output",
        `No built HTML output found. Checked:\n${checkedPaths}`,
        help
      );
      process.exit(1);
      return;
    }

    if (!options.root) {
      const displayPath = path.relative(cwd, builtOutputDir) || ".";
      console.error(chalk.gray(`Using built output directory: ${displayPath}\n`));
    }

    // Perform reality check
    let report: RealityCheckReport;
    try {
      report = await performRealityCheck({
        manifest,
        builtOutputDir,
        sourceDir: appDir,
        recommended
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      printCliError(
        "validate.check_failed",
        `Failed to validate: ${message}`,
        "Ensure your app is built and the --root points to the output directory."
      );
      process.exit(1);
      return;
    }

    // Run rulesets if specified
    let rulesetResults: Map<string, { errors: number; warnings: number }> | undefined;
    if (rulesets.length > 0) {
      const collected = await collectSchemaData({ rootDir: builtOutputDir });
      const routesData = collected.data.routes ?? {};
      
      rulesetResults = new Map();
      let totalRulesetErrors = 0;
      let totalRulesetWarnings = 0;

      for (const route of report.routes) {
        const nodes = routesData[route.route] ?? [];
        const result = runMultipleRulesets(rulesets, nodes);
        
        rulesetResults.set(route.route, {
          errors: result.summary.errors,
          warnings: result.summary.warnings
        });
        
        totalRulesetErrors += result.summary.errors;
        totalRulesetWarnings += result.summary.warnings;
        
        report.routes[report.routes.indexOf(route)].issues.push(...result.issues);
      }

      report.summary.errors += totalRulesetErrors;
      report.summary.warnings += totalRulesetWarnings;
      report.ok = report.summary.errors === 0;
      
      if (rulesets.length > 0) {
        console.error(chalk.gray(`\n📋 Rulesets: ${rulesets.join(", ")} (${totalRulesetErrors}E, ${totalRulesetWarnings}W)`));
      }
    }

    // Output format handling
    if (format === "table") {
      const tableOutput = formatRealityReportTable(report, rulesetResults);
      console.log(tableOutput);
    } else if (format === "tree") {
      const treeOutput = formatRealityReportTree(report, rulesetResults);
      console.log(treeOutput);
    } else if (format === "json") {
      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        await mkdir(path.dirname(outputPath), { recursive: true });
        await writeFile(outputPath, stableStringify(report), "utf8");
        console.error(chalk.green(`\n✓ Report written to ${outputPath}`));
      } else {
        console.log(stableStringify(report));
      }
    } else {
      // HTML format
      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        await mkdir(path.dirname(outputPath), { recursive: true });
        // Convert reality report to old report format for HTML rendering
        const legacyReport = convertRealityToLegacyReport(report);
        await writeFile(outputPath, renderHtmlReport(legacyReport, { title: "Schema Sentry Validate Report" }), "utf8");
        console.error(chalk.green(`\n✓ HTML report written to ${outputPath}`));
      }
    }

    // Print summary
    printRealitySummary(report, Date.now() - start);
    
    // Emit annotations for CI
    if (annotationsMode === "github") {
      const legacyReport = convertRealityToLegacyReport(report);
      emitGitHubAnnotations(legacyReport, "validate");
    }

    process.exit(report.ok ? 0 : 1);
  });

function printRealitySummary(
  report: RealityCheckReport,
  durationMs: number
): void {
  console.error("");
  
  if (report.ok) {
    console.error(chalk.green.bold("✅ All routes pass reality check"));
  } else {
    console.error(chalk.red.bold("❌ Reality check failed"));
  }
  
  console.error(chalk.gray(`\n📊 Summary:`));
  console.error(`   Routes checked: ${report.summary.routes}`);
  console.error(`   Score: ${report.summary.score}/100`);
  console.error(`   Duration: ${formatDuration(durationMs)}`);
  
  if (report.summary.validRoutes > 0) {
    console.error(chalk.green(`   ✅ Valid: ${report.summary.validRoutes}`));
  }
  if (report.summary.missingInSource > 0) {
    console.error(chalk.red(`   ❌ Missing in source: ${report.summary.missingInSource}`));
  }
  if (report.summary.missingInHtml > 0) {
    console.error(chalk.red(`   ❌ Missing in HTML: ${report.summary.missingInHtml}`));
  }
  if (report.summary.missingFromManifest > 0) {
    console.error(chalk.yellow(`   ⚠️  Missing from manifest: ${report.summary.missingFromManifest}`));
  }
  if (report.summary.typeMismatches > 0) {
    console.error(chalk.red(`   ❌ Type mismatches: ${report.summary.typeMismatches}`));
  }
  
  if (report.summary.errors > 0 || report.summary.warnings > 0) {
    console.error(chalk.gray(`\n📝 Details:`));
    console.error(`   Errors: ${chalk.red(report.summary.errors.toString())}`);
    console.error(`   Warnings: ${chalk.yellow(report.summary.warnings.toString())}`);
  }
  
  // Show problem routes
  const problemRoutes = report.routes.filter(r => r.issues.length > 0);
  if (problemRoutes.length > 0) {
    console.error(chalk.gray(`\n🔍 Problem routes:`));
    for (const route of problemRoutes.slice(0, 5)) {
      console.error(chalk.white(`\n   ${route.route}`));
      for (const issue of route.issues) {
        const icon = issue.severity === "error" ? chalk.red("❌") : chalk.yellow("⚠️");
        console.error(`     ${icon} ${issue.message}`);
      }
    }
    if (problemRoutes.length > 5) {
      console.error(chalk.gray(`\n   ... and ${problemRoutes.length - 5} more`));
    }
  }
  
  console.error("");
}

function convertRealityToLegacyReport(report: RealityCheckReport): Report {
  return {
    ok: report.ok,
    summary: {
      routes: report.summary.routes,
      errors: report.summary.errors,
      warnings: report.summary.warnings,
      score: report.summary.score,
      coverage: {
        missingRoutes: report.summary.missingInSource + report.summary.missingInHtml,
        missingTypes: report.summary.typeMismatches,
        unlistedRoutes: report.summary.missingFromManifest
      }
    },
    routes: report.routes.map(r => ({
      route: r.route,
      ok: r.status === "valid" && r.issues.filter(i => i.severity === "error").length === 0,
      score: r.score,
      issues: r.issues,
      expectedTypes: r.expectedTypes,
      foundTypes: r.foundTypes
    }))
  };
}
