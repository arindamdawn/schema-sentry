import type { SchemaNode, SchemaTypeName, ValidationIssue } from "@schemasentry/core";

export type SchemaDataFile = {
  routes: Record<string, SchemaNode[]>;
};

export type CoverageInput = {
  expectedTypesByRoute: Record<string, SchemaTypeName[]>;
  requiredRoutes?: string[];
};

export type CoverageSummary = {
  missingRoutes: number;
  missingTypes: number;
  unlistedRoutes: number;
};

export type CoverageResult = {
  allRoutes: string[];
  issuesByRoute: Record<string, ValidationIssue[]>;
  summary: CoverageSummary;
};

export const buildCoverageResult = (
  input: CoverageInput,
  data: SchemaDataFile
): CoverageResult => {
  const manifestRoutes = input.expectedTypesByRoute ?? {};
  const dataRoutes = data.routes ?? {};
  const derivedRequiredRoutes = Object.entries(manifestRoutes)
    .filter(([, types]) => (types ?? []).length > 0)
    .map(([route]) => route);
  const requiredRoutes = new Set<string>([
    ...(input.requiredRoutes ?? []),
    ...derivedRequiredRoutes
  ]);
  const allRoutes = Array.from(
    new Set<string>([
      ...Object.keys(manifestRoutes),
      ...requiredRoutes,
      ...Object.keys(dataRoutes)
    ])
  ).sort();

  const issuesByRoute: Record<string, ValidationIssue[]> = {};
  const summary: CoverageSummary = {
    missingRoutes: 0,
    missingTypes: 0,
    unlistedRoutes: 0
  };

  for (const route of allRoutes) {
    const issues: ValidationIssue[] = [];
    const expectedTypes = manifestRoutes[route] ?? [];
    const nodes = dataRoutes[route] ?? [];
    const foundTypes = nodes
      .map((node) => node["@type"])
      .filter((type): type is SchemaTypeName => typeof type === "string");

    if (requiredRoutes.has(route) && nodes.length === 0) {
      issues.push({
        path: `routes["${route}"]`,
        message: "No schema blocks found for route",
        severity: "error",
        ruleId: "coverage.missing_route"
      });
      summary.missingRoutes += 1;
    }

    for (const expectedType of expectedTypes) {
      if (!foundTypes.includes(expectedType)) {
        issues.push({
          path: `routes["${route}"].types`,
          message: `Missing expected schema type '${expectedType}'`,
          severity: "error",
          ruleId: "coverage.missing_type"
        });
        summary.missingTypes += 1;
      }
    }

    if (!manifestRoutes[route] && !requiredRoutes.has(route) && nodes.length > 0) {
      issues.push({
        path: `routes["${route}"]`,
        message: "Route has schema but is missing from manifest",
        severity: "warn",
        ruleId: "coverage.unlisted_route"
      });
      summary.unlistedRoutes += 1;
    }

    if (issues.length > 0) {
      issuesByRoute[route] = issues;
    }
  }

  return {
    allRoutes,
    issuesByRoute,
    summary
  };
};
