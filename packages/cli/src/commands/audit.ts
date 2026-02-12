import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { promises as fs } from "node:fs";
import path from "path";
import chalk from "chalk";
import type { Manifest } from "@schemasentry/core";
import type { SchemaDataFile } from "../report.js";
import { buildAuditReport } from "../audit.js";
import { renderHtmlReport } from "../html.js";
import { emitGitHubAnnotations } from "../annotations.js";
import { formatDuration } from "../summary.js";
import { scanRoutes } from "../routes.js";
import { scanSourceFiles } from "../source.js";
import {
  resolveOutputFormat,
  resolveAnnotationsMode,
  resolveRecommendedOption,
  printCliError,
  isManifest,
  isSchemaData
} from "./utils.js";

export const auditCommand = new Command("audit")
  .description("Analyze schema health and check for ghost routes (routes in manifest without Schema components)")
  .option(
    "-d, --data <path>",
    "Path to schema data JSON (optional, for legacy mode)",
    "schema-sentry.data.json"
  )
  .option("-m, --manifest <path>", "Path to manifest JSON (optional)", "schema-sentry.manifest.json")
  .option("--scan", "Scan the filesystem for routes")
  .option("--root <path>", "Project root for scanning", ".")
  .option("--app-dir <path>", "Path to Next.js app directory for source scanning", "./app")
  .option("--source-scan", "Enable source file scanning for ghost route detection", false)
  .option("-c, --config <path>", "Path to config JSON")
  .option("--format <format>", "Report format (json|html)", "json")
  .option("--annotations <provider>", "Emit CI annotations (none|github)", "none")
  .option("-o, --output <path>", "Write report output to file")
  .option("--recommended", "Enable recommended field checks")
  .option("--no-recommended", "Disable recommended field checks")
  .action(async (options: {
    data: string;
    manifest?: string;
    config?: string;
    scan?: boolean;
    root?: string;
    appDir?: string;
    sourceScan?: boolean;
    format?: string;
    annotations?: string;
    output?: string;
  }) => {
    const start = Date.now();
    const format = resolveOutputFormat(options.format);
    const annotationsMode = resolveAnnotationsMode(options.annotations);
    const recommended = await resolveRecommendedOption(options.config);
    const appDir = path.resolve(process.cwd(), options.appDir ?? "./app");
    
    // Print header
    console.error(chalk.blue.bold("🔍 Schema Sentry Audit"));
    console.error(chalk.gray("Analyzing schema health and checking for ghost routes...\n"));

    // Load manifest if provided
    let manifest: Manifest | undefined;
    const manifestPath = options.manifest ? path.resolve(process.cwd(), options.manifest) : undefined;
    if (manifestPath) {
      try {
        const manifestRaw = await readFile(manifestPath, "utf8");
        manifest = JSON.parse(manifestRaw) as Manifest;
        if (!isManifest(manifest)) {
          printCliError(
            "manifest.invalid_shape",
            "Manifest must contain a 'routes' object with string array values",
            "Ensure each route maps to an array of schema type names."
          );
          process.exit(1);
          return;
        }
      } catch {
        // Manifest not found or invalid - continue without it
        manifest = undefined;
      }
    }

    // Load data if provided (legacy mode)
    let data: SchemaDataFile | undefined;
    const dataPath = path.resolve(process.cwd(), options.data);
    try {
      const dataRaw = await readFile(dataPath, "utf8");
      data = JSON.parse(dataRaw) as SchemaDataFile;
      if (!isSchemaData(data)) {
        data = undefined;
      }
    } catch {
      data = undefined;
    }

    // Scan source files to detect Schema component usage (skip if --source-scan=false)
    // Default is true (enabled)
    const sourceScanEnabled = options.sourceScan !== false;
    const sourceScanResult = !sourceScanEnabled
      ? { routes: [], totalFiles: 0, filesWithSchema: 0, filesMissingSchema: 0 }
      : await scanSourceFiles({ rootDir: options.root ?? ".", appDir });

    // Scan filesystem for routes if requested
    const scannedRoutes = options.scan
      ? await scanRoutes({ rootDir: path.resolve(process.cwd(), options.root ?? ".") })
      : [];

    // Identify ghost routes (routes in manifest but no Schema component in source)
    // Skip ghost route detection if source scanning is disabled
    const ghostRoutes: string[] = [];
    if (manifest && sourceScanEnabled) {
      for (const route of Object.keys(manifest.routes)) {
        const sourceInfo = sourceScanResult.routes.find(r => r.route === route);
        if (!sourceInfo?.hasSchemaUsage) {
          ghostRoutes.push(route);
        }
      }
    }

    // Build audit report
    const report = buildAuditReport(data ?? { routes: {} }, {
      recommended,
      manifest,
      requiredRoutes: scannedRoutes.length > 0 ? scannedRoutes : undefined
    });

    // Output handling
    if (format === "json") {
      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(JSON.stringify(report, null, 2));
      }
    } else {
      // HTML format
      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        const html = renderHtmlReport(report, { title: "Schema Sentry Audit Report" });
        await fs.writeFile(outputPath, html, "utf8");
        console.error(chalk.green(`\n✓ HTML report written to ${outputPath}`));
      }
    }

    // Emit annotations
    if (annotationsMode === "github") {
      emitGitHubAnnotations(report, "audit");
    }
    
    // Print enhanced audit summary with ghost routes
    printEnhancedAuditSummary({
      report,
      hasManifest: Boolean(manifest),
      ghostRoutes,
      sourceScan: sourceScanResult,
      durationMs: Date.now() - start
    });
    
    process.exit(report.ok && ghostRoutes.length === 0 ? 0 : 1);
  });

type EnhancedAuditSummaryOptions = {
  report: ReturnType<typeof buildAuditReport>;
  hasManifest: boolean;
  ghostRoutes: string[];
  sourceScan: import("../source.js").SourceScanResult;
  durationMs: number;
};

function printEnhancedAuditSummary(options: EnhancedAuditSummaryOptions): void {
  const { report, hasManifest, ghostRoutes, sourceScan, durationMs } = options;
  
  console.error("");
  
  if (report.ok && ghostRoutes.length === 0) {
    console.error(chalk.green.bold("✅ Audit passed"));
  } else {
    console.error(chalk.red.bold("❌ Audit found issues"));
  }
  
  console.error(chalk.gray(`\n📊 Summary:`));
  console.error(`   Routes analyzed: ${report.summary.routes}`);
  console.error(`   Score: ${report.summary.score}/100`);
  console.error(`   Duration: ${formatDuration(durationMs)}`);
  
  // Source code analysis
  if (sourceScan.totalFiles > 0) {
    console.error(chalk.gray(`\n📁 Source Code Analysis:`));
    console.error(`   Page files found: ${sourceScan.totalFiles}`);
    console.error(chalk.green(`   ✅ With Schema components: ${sourceScan.filesWithSchema}`));
    if (sourceScan.filesMissingSchema > 0) {
      console.error(chalk.red(`   ❌ Missing Schema: ${sourceScan.filesMissingSchema}`));
    }
  }
  
  // Ghost routes
  if (hasManifest && ghostRoutes.length > 0) {
    console.error(chalk.red(`\n👻 Ghost Routes (${ghostRoutes.length}):`));
    console.error(chalk.gray("   Routes in manifest but no <Schema> component in source:"));
    for (const route of ghostRoutes.slice(0, 5)) {
      console.error(chalk.red(`   ❌ ${route}`));
    }
    if (ghostRoutes.length > 5) {
      console.error(chalk.gray(`   ... and ${ghostRoutes.length - 5} more`));
    }
    console.error(chalk.gray("\n   These routes are in your manifest but don't have Schema components."));
    console.error(chalk.gray("   Run `schemasentry scaffold` to see what code to add."));
  }
  
  // Legacy data file issues
  if (report.summary.errors > 0 || report.summary.warnings > 0) {
    console.error(chalk.gray(`\n📝 Data File Issues:`));
    console.error(`   Errors: ${chalk.red(report.summary.errors.toString())}`);
    console.error(`   Warnings: ${chalk.yellow(report.summary.warnings.toString())}`);
  }
  
  console.error("");
}
