import {
  stableStringify,
  validateSchema,
  type Manifest,
  type SchemaNode,
  type SchemaTypeName,
  type ValidationOptions,
  type ValidationIssue
} from "@schemasentry/core";
import { collectSchemaData, type CollectResult } from "./collect";
import { scanSourceFiles, type SourceScanResult } from "./source";

export type RealityCheckOptions = ValidationOptions & {
  manifest: Manifest;
  builtOutputDir: string;
  sourceDir: string;
};

export type RouteRealityStatus =
  | "valid" // Has schema in source, HTML, and manifest match
  | "missing_in_html" // Source has schema component but no JSON-LD in built HTML
  | "missing_in_source" // Manifest expects schema but source file doesn't have component
  | "missing_from_manifest" // HTML has schema but not listed in manifest
  | "type_mismatch"; // Schema types in HTML don't match manifest expectations

export type RouteRealityReport = {
  route: string;
  status: RouteRealityStatus;
  sourceHasComponent: boolean;
  htmlHasSchema: boolean;
  expectedTypes: SchemaTypeName[];
  foundTypes: SchemaTypeName[];
  issues: ValidationIssue[];
  score: number;
};

export type RealityCheckReport = {
  ok: boolean;
  summary: {
    routes: number;
    errors: number;
    warnings: number;
    score: number;
    validRoutes: number;
    missingInHtml: number;
    missingInSource: number;
    missingFromManifest: number;
    typeMismatches: number;
  };
  routes: RouteRealityReport[];
};

export const performRealityCheck = async (
  options: RealityCheckOptions
): Promise<RealityCheckReport> => {
  // 1. Scan source files
  const sourceScan = await scanSourceFiles({ rootDir: options.sourceDir });

  // 2. Collect from built HTML
  const collected = await collectSchemaData({ rootDir: options.builtOutputDir });

  // 3. Build comprehensive report
  return buildRealityReport({
    manifest: options.manifest,
    sourceScan,
    collected,
    validationOptions: { recommended: options.recommended }
  });
};

type ReportInput = {
  manifest: Manifest;
  sourceScan: SourceScanResult;
  collected: CollectResult;
  validationOptions: ValidationOptions;
};

const buildRealityReport = (input: ReportInput): RealityCheckReport => {
  const { manifest, sourceScan, collected, validationOptions } = input;
  const manifestRoutes = manifest.routes ?? {};
  const collectedRoutes = collected.data.routes ?? {};

  // Build set of all routes we know about
  const allRoutes = new Set<string>([
    ...Object.keys(manifestRoutes),
    ...sourceScan.routes.map((r) => r.route),
    ...Object.keys(collectedRoutes)
  ]);

  const routeReports: RouteRealityReport[] = [];
  let validRoutes = 0;
  let missingInHtml = 0;
  let missingInSource = 0;
  let missingFromManifest = 0;
  let typeMismatches = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const route of allRoutes) {
    const sourceInfo = sourceScan.routes.find((r) => r.route === route);
    const htmlNodes = collectedRoutes[route] ?? [];
    const expectedTypes = manifestRoutes[route] ?? [];

    const sourceHasComponent =
      sourceInfo?.hasSchemaImport && sourceInfo?.hasSchemaUsage;
    const htmlHasSchema = htmlNodes.length > 0;

    // Validate the actual HTML schema
    const validation = validateSchema(htmlNodes, validationOptions);
    const foundTypes = htmlNodes
      .map((node) => node["@type"])
      .filter((type): type is SchemaTypeName => typeof type === "string");

    // Determine status and build issues
    let status: RouteRealityStatus;
    const issues: ValidationIssue[] = [...validation.issues];

    if (expectedTypes.length > 0 && !sourceHasComponent) {
      status = "missing_in_source";
      missingInSource++;
      issues.push({
        path: `routes["${route}"]`,
        message:
          "Manifest expects schema but source file has no <Schema> component",
        severity: "error",
        ruleId: "reality.missing_source_component"
      });
    } else if (sourceHasComponent && !htmlHasSchema) {
      status = "missing_in_html";
      missingInHtml++;
      issues.push({
        path: `routes["${route}"]`,
        message:
          "Source has <Schema> component but no JSON-LD found in built HTML. Did you build the app?",
        severity: "error",
        ruleId: "reality.missing_html_output"
      });
    } else if (htmlHasSchema && expectedTypes.length === 0) {
      status = "missing_from_manifest";
      missingFromManifest++;
      issues.push({
        path: `routes["${route}"]`,
        message: `Route has schema in HTML but is not listed in manifest`,
        severity: "warn",
        ruleId: "reality.unlisted_route"
      });
    } else if (
      expectedTypes.length > 0 &&
      htmlHasSchema &&
      !expectedTypes.every((t) => foundTypes.includes(t))
    ) {
      status = "type_mismatch";
      typeMismatches++;
      const missingTypes = expectedTypes.filter((t) => !foundTypes.includes(t));
      issues.push({
        path: `routes["${route}"].types`,
        message: `Missing expected schema types: ${missingTypes.join(", ")}`,
        severity: "error",
        ruleId: "reality.type_mismatch"
      });
    } else if (htmlHasSchema) {
      status = "valid";
      validRoutes++;
    } else {
      // No schema anywhere - not in manifest, not in source, not in HTML
      status = "valid";
      validRoutes++;
    }

    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warnCount = issues.filter((i) => i.severity === "warn").length;
    totalErrors += errorCount;
    totalWarnings += warnCount;

    const score = Math.max(0, 100 - errorCount * 10 - warnCount * 2);

    routeReports.push({
      route,
      status,
      sourceHasComponent: sourceHasComponent ?? false,
      htmlHasSchema,
      expectedTypes,
      foundTypes,
      issues,
      score
    });
  }

  // Sort routes for consistent output
  routeReports.sort((a, b) => a.route.localeCompare(b.route));

  const avgScore =
    routeReports.length === 0
      ? 100
      : Math.round(
          routeReports.reduce((sum, r) => sum + r.score, 0) / routeReports.length
        );

  return {
    ok: totalErrors === 0,
    summary: {
      routes: routeReports.length,
      errors: totalErrors,
      warnings: totalWarnings,
      score: avgScore,
      validRoutes,
      missingInHtml,
      missingInSource,
      missingFromManifest,
      typeMismatches
    },
    routes: routeReports
  };
};

export const formatRealityReport = (report: RealityCheckReport): string => {
  const lines: string[] = [];

  // Summary
  const status = report.ok ? "✅" : "❌";
  lines.push(`${status} Schema Reality Check`);
  lines.push(`   Routes: ${report.summary.routes}`);
  lines.push(`   Score: ${report.summary.score}/100`);
  lines.push(`   Errors: ${report.summary.errors}`);
  lines.push(`   Warnings: ${report.summary.warnings}`);
  lines.push("");

  // Detailed breakdown
  if (report.summary.validRoutes > 0) {
    lines.push(`✅ Valid: ${report.summary.validRoutes}`);
  }
  if (report.summary.missingInSource > 0) {
    lines.push(
      `❌ Missing in source: ${report.summary.missingInSource} (manifest expects schema but no <Schema> component)`
    );
  }
  if (report.summary.missingInHtml > 0) {
    lines.push(
      `❌ Missing in HTML: ${report.summary.missingInHtml} (have component but not in built output)`
    );
  }
  if (report.summary.missingFromManifest > 0) {
    lines.push(
      `⚠️  Missing from manifest: ${report.summary.missingFromManifest} (have schema but not listed)`
    );
  }
  if (report.summary.typeMismatches > 0) {
    lines.push(
      `❌ Type mismatches: ${report.summary.typeMismatches} (wrong schema types)`
    );
  }

  // Problem routes
  const problemRoutes = report.routes.filter((r) => r.issues.length > 0);
  if (problemRoutes.length > 0) {
    lines.push("");
    lines.push("Problem routes:");
    for (const route of problemRoutes.slice(0, 10)) {
      lines.push(`\n  ${route.route}`);
      for (const issue of route.issues) {
        const icon = issue.severity === "error" ? "❌" : "⚠️";
        lines.push(`    ${icon} ${issue.message}`);
      }
    }
    if (problemRoutes.length > 10) {
      lines.push(`\n  ... and ${problemRoutes.length - 10} more`);
    }
  }

  return lines.join("\n");
};
