import { Command } from "commander";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "path";
import { stableStringify } from "@schemasentry/core";
import type { SchemaDataFile } from "../report.js";
import {
  collectSchemaData,
  compareSchemaData,
  formatSchemaDataDrift,
  normalizeRouteFilter,
  type CollectStats,
  type CollectWarning
} from "../collect.js";
import { formatDuration } from "../summary.js";
import {
  resolveCollectOutputFormat,
  printCliError,
  isSchemaData
} from "./utils.js";

export const collectCommand = new Command("collect")
  .description("Collect JSON-LD blocks from built HTML output")
  .option("--root <path>", "Root directory to scan for HTML files", ".")
  .option("--routes <routes...>", "Only collect specific routes (repeat or comma-separated)")
  .option("--strict-routes", "Fail when any route passed via --routes is missing")
  .option("--format <format>", "Output format (json)", "json")
  .option("-o, --output <path>", "Write collected schema data to file")
  .option("--check", "Compare collected output with an existing schema data file")
  .option(
    "-d, --data <path>",
    "Path to existing schema data JSON for --check",
    "schema-sentry.data.json"
  )
  .action(async (options: {
    root?: string;
    routes?: string[];
    strictRoutes?: boolean;
    format?: string;
    output?: string;
    check?: boolean;
    data: string;
  }) => {
    const start = Date.now();
    const format = resolveCollectOutputFormat(options.format);
    const rootDir = path.resolve(process.cwd(), options.root ?? ".");
    const check = options.check ?? false;
    const requestedRoutes = normalizeRouteFilter(options.routes ?? []);
    const strictRoutes = options.strictRoutes ?? false;

    let collected: Awaited<ReturnType<typeof collectSchemaData>>;
    try {
      collected = await collectSchemaData({ rootDir, routes: requestedRoutes });
    } catch (error) {
      const reason =
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Unknown file system error";
      printCliError(
        "collect.scan_failed",
        `Could not scan HTML output at ${rootDir}: ${reason}`,
        "Point --root to a directory containing built HTML output."
      );
      process.exit(1);
      return;
    }

    if (collected.stats.htmlFiles === 0) {
      printCliError(
        "collect.no_html",
        `No HTML files found under ${rootDir}`,
        "Point --root to a static output directory (for example ./out)."
      );
      process.exit(1);
      return;
    }

    if (strictRoutes && collected.missingRoutes.length > 0) {
      printCliError(
        "collect.missing_required_routes",
        `Required routes were not found in collected HTML: ${collected.missingRoutes.join(", ")}`,
        "Rebuild output, adjust --root, or update --routes."
      );
      process.exit(1);
      return;
    }

    let driftDetected = false;
    if (check) {
      const existingPath = path.resolve(process.cwd(), options.data);
      let existingRaw: string;

      try {
        existingRaw = await readFile(existingPath, "utf8");
      } catch (error) {
        printCliError(
          "data.not_found",
          `Schema data not found at ${existingPath}`,
          "Run `schemasentry collect --output ./schema-sentry.data.json` to generate it."
        );
        process.exit(1);
        return;
      }

      let existingData: SchemaDataFile;
      try {
        existingData = JSON.parse(existingRaw) as SchemaDataFile;
      } catch (error) {
        printCliError(
          "data.invalid_json",
          "Schema data is not valid JSON",
          "Check the JSON syntax or regenerate with `schemasentry collect --output`."
        );
        process.exit(1);
        return;
      }

      if (!isSchemaData(existingData)) {
        printCliError(
          "data.invalid_shape",
          "Schema data must contain a 'routes' object with array values",
          "Ensure each route maps to an array of JSON-LD blocks."
        );
        process.exit(1);
        return;
      }

      const existingDataForCompare =
        requestedRoutes.length > 0
          ? filterSchemaDataByRoutes(existingData, requestedRoutes)
          : existingData;
      const drift = compareSchemaData(existingDataForCompare, collected.data);
      driftDetected = drift.hasChanges;
      if (driftDetected) {
        console.error(formatSchemaDataDrift(drift));
      } else {
        console.error("collect | No schema data drift detected.");
      }
    }

    const content = formatCollectOutput(collected.data, format);
    if (options.output) {
      const resolvedPath = path.resolve(process.cwd(), options.output);
      try {
        await mkdir(path.dirname(resolvedPath), { recursive: true });
        await writeFile(resolvedPath, `${content}\n`, "utf8");
        console.error(`Collected data written to ${resolvedPath}`);
      } catch (error) {
        const reason =
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Unknown file system error";
        printCliError(
          "output.write_failed",
          `Could not write collected data to ${resolvedPath}: ${reason}`
        );
        process.exit(1);
        return;
      }
    } else if (!check) {
      console.log(content);
    }

    printCollectWarnings(collected.warnings);
    printCollectSummary({
      stats: collected.stats,
      durationMs: Date.now() - start,
      checked: check,
      driftDetected,
      requestedRoutes: collected.requestedRoutes,
      missingRoutes: collected.missingRoutes,
      strictRoutes
    });
    process.exit(driftDetected ? 1 : 0);
  });

function formatCollectOutput(
  data: SchemaDataFile,
  format: "json"
): string {
  if (format === "json") {
    return stableStringify(data);
  }
  return stableStringify(data);
}

function filterSchemaDataByRoutes(
  data: SchemaDataFile,
  routes: string[]
): SchemaDataFile {
  const filteredRoutes: SchemaDataFile["routes"] = {};
  for (const route of routes) {
    if (Object.prototype.hasOwnProperty.call(data.routes, route)) {
      filteredRoutes[route] = data.routes[route];
    }
  }

  return {
    routes: filteredRoutes
  };
}

function printCollectWarnings(warnings: CollectWarning[]): void {
  if (warnings.length === 0) {
    return;
  }

  const maxPrinted = 10;
  console.error(`collect | Warnings: ${warnings.length}`);
  for (const warning of warnings.slice(0, maxPrinted)) {
    console.error(`- ${warning.file}: ${warning.message}`);
  }
  if (warnings.length > maxPrinted) {
    console.error(`- ... ${warnings.length - maxPrinted} more warning(s)`);
  }
}

function printCollectSummary(options: {
  stats: CollectStats;
  durationMs: number;
  checked: boolean;
  driftDetected: boolean;
  requestedRoutes: string[];
  missingRoutes: string[];
  strictRoutes: boolean;
}): void {
  const {
    stats,
    durationMs,
    checked,
    driftDetected,
    requestedRoutes,
    missingRoutes,
    strictRoutes
  } = options;
  const parts = [
    `HTML files: ${stats.htmlFiles}`,
    `Routes: ${stats.routes}`,
    `Blocks: ${stats.blocks}`,
    `Invalid blocks: ${stats.invalidBlocks}`,
    `Duration: ${formatDuration(durationMs)}`
  ];

  if (checked) {
    parts.push(`Check: ${driftDetected ? "drift_detected" : "clean"}`);
  }
  if (requestedRoutes.length > 0) {
    parts.push(`Route filter: ${requestedRoutes.length}`);
  }
  if (missingRoutes.length > 0) {
    parts.push(`Missing filtered routes: ${missingRoutes.length}`);
  }
  if (strictRoutes) {
    parts.push("Strict routes: enabled");
  }

  console.error(`collect | ${parts.join(" | ")}`);
}
