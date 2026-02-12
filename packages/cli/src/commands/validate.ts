import { Command } from "commander";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "path";
import chalk from "chalk";
import { stableStringify, type Manifest } from "@schemasentry/core";
import type { Report } from "../report";
import { renderHtmlReport } from "../html";
import { emitGitHubAnnotations } from "../annotations";
import { formatDuration } from "../summary";
import {
  performRealityCheck,
  formatRealityReport,
  type RealityCheckReport
} from "../reality";
import {
  resolveOutputFormat,
  resolveAnnotationsMode,
  resolveRecommendedOption,
  printCliError,
  isManifest
} from "./utils.js";

export const validateCommand = new Command("validate")
  .description("Validate schema by checking built HTML output against manifest (validates reality, not just config files)")
  .option(
    "-m, --manifest <path>",
    "Path to manifest JSON",
    "schema-sentry.manifest.json"
  )
  .option(
    "-r, --root <path>",
    "Root directory containing built HTML output (e.g., ./out or ./.next/server/app)",
    "./out"
  )
  .option(
    "--app-dir <path>",
    "Path to Next.js app directory for source scanning",
    "./app"
  )
  .option("-c, --config <path>", "Path to config JSON")
  .option("--format <format>", "Report format (json|html)", "json")
  .option("--annotations <provider>", "Emit CI annotations (none|github)", "none")
  .option("-o, --output <path>", "Write report output to file")
  .option("--recommended", "Enable recommended field checks")
  .option("--no-recommended", "Disable recommended field checks")
  .action(async (options: {
    manifest: string;
    root: string;
    appDir?: string;
    config?: string;
    format?: string;
    annotations?: string;
    output?: string;
  }) => {
    const start = Date.now();
    const format = resolveOutputFormat(options.format);
    const annotationsMode = resolveAnnotationsMode(options.annotations);
    const recommended = await resolveRecommendedOption(options.config);
    const manifestPath = path.resolve(process.cwd(), options.manifest);
    const builtOutputDir = path.resolve(process.cwd(), options.root);
    const appDir = path.resolve(process.cwd(), options.appDir ?? "./app");

    // Load manifest
    let manifest: Manifest;
    try {
      const raw = await readFile(manifestPath, "utf8");
      manifest = JSON.parse(raw) as Manifest;
    } catch (error) {
      printCliError(
        "manifest.not_found",
        `Manifest not found at ${manifestPath}`,
        "Run `schemasentry init` to generate starter files."
      );
      process.exit(1);
      return;
    }

    if (!isManifest(manifest)) {
      printCliError(
        "manifest.invalid_shape",
        "Manifest must contain a 'routes' object with string array values",
        "Ensure each route maps to an array of schema type names."
      );
      process.exit(1);
      return;
    }

    // Print header
    console.error(chalk.blue.bold("🔍 Schema Sentry Reality Check"));
    console.error(chalk.gray("Validating actual built HTML against manifest expectations...\n"));

    // Check if built output exists
    try {
      await access(builtOutputDir);
    } catch {
      printCliError(
        "validate.no_build_output",
        `No built HTML output found at ${builtOutputDir}`,
        "Build your Next.js app first with `next build`, then run validate."
      );
      process.exit(1);
      return;
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

    // Output format handling
    if (format === "json") {
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
