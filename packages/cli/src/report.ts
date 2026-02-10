import {
  stableStringify,
  validateSchema,
  type Manifest,
  type SchemaNode,
  type SchemaTypeName,
  type ValidationOptions,
  type ValidationIssue
} from "@schemasentry/core";

export type SchemaDataFile = {
  routes: Record<string, SchemaNode[]>;
};

export type RouteReport = {
  route: string;
  ok: boolean;
  score: number;
  issues: ValidationIssue[];
  expectedTypes: SchemaTypeName[];
  foundTypes: SchemaTypeName[];
};

export type ReportSummary = {
  routes: number;
  errors: number;
  warnings: number;
  score: number;
};

export type Report = {
  ok: boolean;
  summary: ReportSummary;
  routes: RouteReport[];
};

export type ReportOptions = ValidationOptions;

export const buildReport = (
  manifest: Manifest,
  data: SchemaDataFile,
  options: ReportOptions = {}
): Report => {
  const manifestRoutes = manifest.routes ?? {};
  const dataRoutes = data.routes ?? {};
  const allRoutes = new Set<string>([
    ...Object.keys(manifestRoutes),
    ...Object.keys(dataRoutes)
  ]);

  const routes = Array.from(allRoutes).sort().map((route) => {
    const expectedTypes = manifestRoutes[route] ?? [];
    const nodes = dataRoutes[route] ?? [];
    const foundTypes = nodes
      .map((node) => node["@type"])
      .filter((type): type is SchemaTypeName => typeof type === "string");

    const validation = validateSchema(nodes, options);
    const issues: ValidationIssue[] = [...validation.issues];

    if (expectedTypes.length > 0) {
      if (nodes.length === 0) {
        issues.push({
          path: `routes["${route}"]`,
          message: "No schema blocks found for route",
          severity: "error",
          ruleId: "coverage.missing_route"
        });
      }

      for (const expectedType of expectedTypes) {
        if (!foundTypes.includes(expectedType)) {
          issues.push({
            path: `routes["${route}"].types`,
            message: `Missing expected schema type '${expectedType}'`,
            severity: "error",
            ruleId: "coverage.missing_type"
          });
        }
      }
    }

    if (!manifestRoutes[route] && nodes.length > 0) {
      issues.push({
        path: `routes["${route}"]`,
        message: "Route has schema but is missing from manifest",
        severity: "warn",
        ruleId: "coverage.unlisted_route"
      });
    }

    const errorCount = issues.filter((issue) => issue.severity === "error")
      .length;
    const warnCount = issues.filter((issue) => issue.severity === "warn").length;
    const score = Math.max(0, validation.score - errorCount * 5 - warnCount * 2);

    return {
      route,
      ok: errorCount === 0,
      score,
      issues,
      expectedTypes,
      foundTypes
    };
  });

  const summaryErrors = routes.reduce(
    (count, route) => count + route.issues.filter((i) => i.severity === "error").length,
    0
  );
  const summaryWarnings = routes.reduce(
    (count, route) => count + route.issues.filter((i) => i.severity === "warn").length,
    0
  );
  const summaryScore =
    routes.length === 0
      ? 0
      : Math.round(
          routes.reduce((total, route) => total + route.score, 0) / routes.length
        );

  return {
    ok: summaryErrors === 0,
    summary: {
      routes: routes.length,
      errors: summaryErrors,
      warnings: summaryWarnings,
      score: summaryScore
    },
    routes
  };
};

export const formatReport = (report: Report): string =>
  stableStringify(report);
