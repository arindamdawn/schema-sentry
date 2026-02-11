#!/usr/bin/env node
import { Command } from "commander";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "path";
import { stableStringify, type Manifest } from "@schemasentry/core";
import { buildReport, type Report, type SchemaDataFile } from "./report";
import { fileExists, getDefaultAnswers, writeInitFiles } from "./init";
import { buildAuditReport } from "./audit";
import { formatSummaryLine } from "./summary";
import { ConfigError, loadConfig, resolveRecommended } from "./config";
import { scanRoutes } from "./routes";
import { renderHtmlReport } from "./html";
import { emitGitHubAnnotations } from "./annotations";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const program = new Command();

program
  .name("schemasentry")
  .description("Schema Sentry CLI")
  .version(resolveCliVersion());

program
  .command("validate")
  .description("Validate schema coverage and rules")
  .option(
    "-m, --manifest <path>",
    "Path to manifest JSON",
    "schema-sentry.manifest.json"
  )
  .option(
    "-d, --data <path>",
    "Path to schema data JSON",
    "schema-sentry.data.json"
  )
  .option("-c, --config <path>", "Path to config JSON")
  .option("--format <format>", "Report format (json|html)", "json")
  .option("--annotations <provider>", "Emit CI annotations (none|github)", "none")
  .option("-o, --output <path>", "Write report output to file")
  .option("--recommended", "Enable recommended field checks")
  .option("--no-recommended", "Disable recommended field checks")
  .action(async (options: {
    manifest: string;
    data: string;
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
    const dataPath = path.resolve(process.cwd(), options.data);
    let raw: string;

    try {
      raw = await readFile(manifestPath, "utf8");
    } catch (error) {
      printCliError(
        "manifest.not_found",
        `Manifest not found at ${manifestPath}`,
        "Run `schemasentry init` to generate starter files."
      );
      process.exit(1);
      return;
    }

    let manifest: Manifest;
    try {
      manifest = JSON.parse(raw) as Manifest;
    } catch (error) {
      printCliError(
        "manifest.invalid_json",
        "Manifest is not valid JSON",
        "Check the JSON syntax or regenerate with `schemasentry init`."
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

    let dataRaw: string;
    try {
      dataRaw = await readFile(dataPath, "utf8");
    } catch (error) {
      printCliError(
        "data.not_found",
        `Schema data not found at ${dataPath}`,
        "Run `schemasentry init` to generate starter files."
      );
      process.exit(1);
      return;
    }

    let data: SchemaDataFile;
    try {
      data = JSON.parse(dataRaw) as SchemaDataFile;
    } catch (error) {
      printCliError(
        "data.invalid_json",
        "Schema data is not valid JSON",
        "Check the JSON syntax or regenerate with `schemasentry init`."
      );
      process.exit(1);
      return;
    }

    if (!isSchemaData(data)) {
      printCliError(
        "data.invalid_shape",
        "Schema data must contain a 'routes' object with array values",
        "Ensure each route maps to an array of JSON-LD blocks."
      );
      process.exit(1);
      return;
    }

    const report = buildReport(manifest, data, { recommended });
    await emitReport({
      report,
      format,
      outputPath: options.output,
      title: "Schema Sentry Validate Report"
    });
    emitAnnotations(report, annotationsMode, "validate");
    printValidateSummary(report, Date.now() - start);
    process.exit(report.ok ? 0 : 1);
  });

program
  .command("init")
  .description("Interactive setup wizard")
  .option(
    "-m, --manifest <path>",
    "Path to manifest JSON",
    "schema-sentry.manifest.json"
  )
  .option(
    "-d, --data <path>",
    "Path to schema data JSON",
    "schema-sentry.data.json"
  )
  .option("-y, --yes", "Use defaults and skip prompts")
  .option("-f, --force", "Overwrite existing files")
  .option("--scan", "Scan the filesystem for routes and add WebPage entries")
  .option("--root <path>", "Project root for scanning", ".")
  .action(async (options: {
    manifest: string;
    data: string;
    yes?: boolean;
    force?: boolean;
    scan?: boolean;
    root?: string;
  }) => {
    const manifestPath = path.resolve(process.cwd(), options.manifest);
    const dataPath = path.resolve(process.cwd(), options.data);
    const force = options.force ?? false;
    const useDefaults = options.yes ?? false;
    const answers = useDefaults ? getDefaultAnswers() : await promptAnswers();
    const scannedRoutes = options.scan
      ? await scanRoutes({ rootDir: path.resolve(process.cwd(), options.root ?? ".") })
      : [];
    if (options.scan && scannedRoutes.length === 0) {
      console.error("No routes found during scan.");
    }

    const [overwriteManifest, overwriteData] = await resolveOverwrites({
      manifestPath,
      dataPath,
      force,
      interactive: !useDefaults
    });

    const result = await writeInitFiles({
      manifestPath,
      dataPath,
      overwriteManifest,
      overwriteData,
      answers,
      scannedRoutes
    });

    printInitSummary({ manifestPath, dataPath, result });
  });

program
  .command("audit")
  .description("Analyze schema health and report issues")
  .option(
    "-d, --data <path>",
    "Path to schema data JSON",
    "schema-sentry.data.json"
  )
  .option("-m, --manifest <path>", "Path to manifest JSON (optional)")
  .option("--scan", "Scan the filesystem for routes")
  .option("--root <path>", "Project root for scanning", ".")
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
    format?: string;
    annotations?: string;
    output?: string;
  }) => {
    const start = Date.now();
    const format = resolveOutputFormat(options.format);
    const annotationsMode = resolveAnnotationsMode(options.annotations);
    const recommended = await resolveRecommendedOption(options.config);
    const dataPath = path.resolve(process.cwd(), options.data);
    let dataRaw: string;

    try {
      dataRaw = await readFile(dataPath, "utf8");
    } catch (error) {
      printCliError(
        "data.not_found",
        `Schema data not found at ${dataPath}`,
        "Run `schemasentry init` to generate starter files."
      );
      process.exit(1);
      return;
    }

    let data: SchemaDataFile;
    try {
      data = JSON.parse(dataRaw) as SchemaDataFile;
    } catch (error) {
      printCliError(
        "data.invalid_json",
        "Schema data is not valid JSON",
        "Check the JSON syntax or regenerate with `schemasentry init`."
      );
      process.exit(1);
      return;
    }

    if (!isSchemaData(data)) {
      printCliError(
        "data.invalid_shape",
        "Schema data must contain a 'routes' object with array values",
        "Ensure each route maps to an array of JSON-LD blocks."
      );
      process.exit(1);
      return;
    }

    let manifest: Manifest | undefined;
    if (options.manifest) {
      const manifestPath = path.resolve(process.cwd(), options.manifest);
      let manifestRaw: string;

      try {
        manifestRaw = await readFile(manifestPath, "utf8");
      } catch (error) {
        printCliError(
          "manifest.not_found",
          `Manifest not found at ${manifestPath}`,
          "Run `schemasentry init` to generate starter files."
        );
        process.exit(1);
        return;
      }

      try {
        manifest = JSON.parse(manifestRaw) as Manifest;
      } catch (error) {
        printCliError(
          "manifest.invalid_json",
          "Manifest is not valid JSON",
          "Check the JSON syntax or regenerate with `schemasentry init`."
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
    }

    const requiredRoutes = options.scan
      ? await scanRoutes({ rootDir: path.resolve(process.cwd(), options.root ?? ".") })
      : [];
    if (options.scan && requiredRoutes.length === 0) {
      console.error("No routes found during scan.");
    }

    const report = buildAuditReport(data, {
      recommended,
      manifest,
      requiredRoutes: requiredRoutes.length > 0 ? requiredRoutes : undefined
    });
    await emitReport({
      report,
      format,
      outputPath: options.output,
      title: "Schema Sentry Audit Report"
    });
    emitAnnotations(report, annotationsMode, "audit");
    printAuditSummary(report, Boolean(manifest), Date.now() - start);
    process.exit(report.ok ? 0 : 1);
  });

function isManifest(value: unknown): value is Manifest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const manifest = value as Manifest;
  if (!manifest.routes || typeof manifest.routes !== "object") {
    return false;
  }

  for (const entry of Object.values(manifest.routes)) {
    if (!Array.isArray(entry) || entry.some((item) => typeof item !== "string")) {
      return false;
    }
  }

  return true;
}

function isSchemaData(value: unknown): value is SchemaDataFile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as SchemaDataFile;
  if (!data.routes || typeof data.routes !== "object") {
    return false;
  }

  for (const entry of Object.values(data.routes)) {
    if (!Array.isArray(entry)) {
      return false;
    }
  }

  return true;
}

type OutputFormat = "json" | "html";
type AnnotationsMode = "none" | "github";

function resolveOutputFormat(value?: string): OutputFormat {
  const format = (value ?? "json").trim().toLowerCase();
  if (format === "json" || format === "html") {
    return format;
  }

  printCliError(
    "output.invalid_format",
    `Unsupported report format '${value ?? ""}'`,
    "Use --format json or --format html."
  );
  process.exit(1);
  return "json";
}

function resolveAnnotationsMode(value?: string): AnnotationsMode {
  const mode = (value ?? "none").trim().toLowerCase();
  if (mode === "none" || mode === "github") {
    return mode;
  }

  printCliError(
    "annotations.invalid_provider",
    `Unsupported annotations provider '${value ?? ""}'`,
    "Use --annotations none or --annotations github."
  );
  process.exit(1);
  return "none";
}

function formatReportOutput(
  report: Report,
  format: OutputFormat,
  title: string
): string {
  if (format === "html") {
    return renderHtmlReport(report, { title });
  }

  return stableStringify(report);
}

async function emitReport(options: {
  report: Report;
  format: OutputFormat;
  outputPath?: string;
  title: string;
}): Promise<void> {
  const { report, format, outputPath, title } = options;
  const content = formatReportOutput(report, format, title);

  if (!outputPath) {
    console.log(content);
    return;
  }

  const resolvedPath = path.resolve(process.cwd(), outputPath);
  try {
    await mkdir(path.dirname(resolvedPath), { recursive: true });
    await writeFile(resolvedPath, content, "utf8");
    console.error(`Report written to ${resolvedPath}`);
  } catch (error) {
    const reason =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "Unknown file system error";
    printCliError(
      "output.write_failed",
      `Could not write report to ${resolvedPath}: ${reason}`
    );
    process.exit(1);
  }
}

function emitAnnotations(
  report: Report,
  mode: AnnotationsMode,
  commandLabel: string
): void {
  if (mode !== "github") {
    return;
  }
  emitGitHubAnnotations(report, commandLabel);
}

function printCliError(
  code: string,
  message: string,
  suggestion?: string
): void {
  console.error(
    stableStringify({
      ok: false,
      errors: [
        {
          code,
          message,
          ...(suggestion !== undefined ? { suggestion } : {})
        }
      ]
    })
  );
}

async function resolveRecommendedOption(configPath?: string): Promise<boolean> {
  const override = getRecommendedOverride(process.argv);

  try {
    const config = await loadConfig({ configPath });
    return resolveRecommended(override, config);
  } catch (error) {
    if (error instanceof ConfigError) {
      printCliError(error.code, error.message, error.suggestion);
      process.exit(1);
      return true;
    }
    throw error;
  }
}

function getRecommendedOverride(argv: string[]): boolean | undefined {
  if (argv.includes("--recommended")) {
    return true;
  }
  if (argv.includes("--no-recommended")) {
    return false;
  }
  return undefined;
}

function resolveCliVersion(): string {
  try {
    const raw = readFileSync(new URL("../package.json", import.meta.url), "utf8");
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

program.parse();

function printValidateSummary(
  report: ReturnType<typeof buildReport>,
  durationMs: number
): void {
  console.error(
    formatSummaryLine("validate", {
      ...report.summary,
      durationMs,
      coverage: report.summary.coverage
    })
  );
}

function printAuditSummary(
  report: ReturnType<typeof buildAuditReport>,
  coverageEnabled: boolean,
  durationMs: number
): void {
  console.error(
    formatSummaryLine("audit", {
      ...report.summary,
      durationMs,
      coverage: report.summary.coverage
    })
  );
  if (!coverageEnabled) {
    console.error("Coverage checks skipped (no manifest provided).");
  }
}

async function promptAnswers(): Promise<{
  siteName: string;
  siteUrl: string;
  authorName: string;
}> {
  const defaults = getDefaultAnswers();
  const rl = createInterface({ input, output });

  try {
    const siteName = await ask(rl, "Site name", defaults.siteName);
    const siteUrl = await ask(rl, "Base URL", defaults.siteUrl);
    const authorName = await ask(rl, "Primary author name", defaults.authorName);
    return { siteName, siteUrl, authorName };
  } finally {
    rl.close();
  }
}

async function ask(
  rl: ReturnType<typeof createInterface>,
  question: string,
  fallback: string
): Promise<string> {
  const answer = (await rl.question(`${question} (${fallback}): `)).trim();
  return answer.length > 0 ? answer : fallback;
}

async function resolveOverwrites(options: {
  manifestPath: string;
  dataPath: string;
  force: boolean;
  interactive: boolean;
}): Promise<[boolean, boolean]> {
  const { manifestPath, dataPath, force, interactive } = options;
  if (force) {
    return [true, true];
  }

  const manifestExists = await fileExists(manifestPath);
  const dataExists = await fileExists(dataPath);

  if (!interactive) {
    return [false, false];
  }

  const rl = createInterface({ input, output });
  try {
    const overwriteManifest = manifestExists
      ? await confirm(rl, `Manifest exists at ${manifestPath}. Overwrite?`, false)
      : false;
    const overwriteData = dataExists
      ? await confirm(rl, `Data file exists at ${dataPath}. Overwrite?`, false)
      : false;
    return [overwriteManifest, overwriteData];
  } finally {
    rl.close();
  }
}

async function confirm(
  rl: ReturnType<typeof createInterface>,
  question: string,
  defaultValue: boolean
): Promise<boolean> {
  const hint = defaultValue ? "Y/n" : "y/N";
  const answer = (await rl.question(`${question} (${hint}): `)).trim().toLowerCase();
  if (!answer) {
    return defaultValue;
  }
  return answer === "y" || answer === "yes";
}

function printInitSummary(options: {
  manifestPath: string;
  dataPath: string;
  result: Awaited<ReturnType<typeof writeInitFiles>>;
}): void {
  const { manifestPath, dataPath, result } = options;
  const created = [];
  if (result.manifest !== "skipped") {
    created.push(`${manifestPath} (${result.manifest})`);
  }
  if (result.data !== "skipped") {
    created.push(`${dataPath} (${result.data})`);
  }

  if (created.length > 0) {
    console.log("Schema Sentry init complete.");
    console.log(`Created ${created.length} file(s):`);
    created.forEach((entry) => console.log(`- ${entry}`));
  }

  if (result.manifest === "skipped" || result.data === "skipped") {
    console.log("Some files were skipped. Use --force to overwrite.");
  }

  if (result.manifest === "skipped" && result.data === "skipped") {
    console.log("No files were written.");
  }

  if (created.length > 0) {
    console.log("Next: run `schemasentry validate` to verify your setup.");
  }
}
