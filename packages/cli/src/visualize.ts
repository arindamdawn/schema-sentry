import chalk from "chalk";
import type { RealityCheckReport, RouteRealityReport } from "./reality";

export type VisualizationFormat = "table" | "tree";

export const formatRealityReportTable = (
  report: RealityCheckReport,
  rulesetResults?: Map<string, { errors: number; warnings: number }>
): string => {
  const lines: string[] = [];

  const header = [
    chalk.white("Route"),
    chalk.white("Status"),
    chalk.white("Types"),
    chalk.white("Issues")
  ];
  lines.push(header.join(" | "));
  lines.push(chalk.gray("-".repeat(80)));

  for (const route of report.routes) {
    const statusIcon = getStatusIcon(route);
    const types = route.expectedTypes.length > 0
      ? route.expectedTypes.join(", ")
      : route.foundTypes.join(", ");
    const issueCount = route.issues.length;
    const rulesetInfo = rulesetResults?.get(route.route);
    
    let issueText = "";
    if (issueCount > 0) {
      const errors = route.issues.filter(i => i.severity === "error").length;
      const warnings = route.issues.filter(i => i.severity === "warn").length;
      issueText = `${errors > 0 ? chalk.red(`${errors}E`) : ""} ${warnings > 0 ? chalk.yellow(`${warnings}W`) : ""}`.trim();
    }
    if (rulesetInfo) {
      const rErrors = rulesetInfo.errors > 0 ? chalk.red(`${rulesetInfo.errors}E`) : "";
      const rWarnings = rulesetInfo.warnings > 0 ? chalk.yellow(`${rulesetInfo.warnings}W`) : "";
      const rText = [rErrors, rWarnings].filter(Boolean).join(" ");
      if (rText) {
        issueText = issueText ? `${issueText} ${rText}` : rText;
      }
    }

    const routeDisplay = route.route.length > 30
      ? "..." + route.route.slice(-27)
      : route.route;

    lines.push([
      chalk.white(routeDisplay),
      statusIcon,
      chalk.cyan(types || "-"),
      issueText || chalk.green("✓")
    ].join(" | "));
  }

  return lines.join("\n");
};

export const formatRealityReportTree = (
  report: RealityCheckReport,
  rulesetResults?: Map<string, { errors: number; warnings: number }>
): string => {
  const lines: string[] = [];

  lines.push(chalk.blue.bold("Schema Sentry"));
  lines.push("");

  for (const route of report.routes) {
    const statusIcon = getStatusIcon(route);
    const routeLine = `${statusIcon} ${chalk.white(route.route)}`;
    lines.push(routeLine);

    if (route.expectedTypes.length > 0 || route.foundTypes.length > 0) {
      const types = route.expectedTypes.length > 0 ? route.expectedTypes : route.foundTypes;
      for (const type of types) {
        lines.push(`  ├── ${chalk.cyan(type)}`);
      }
    }

    if (route.issues.length > 0) {
      const errors = route.issues.filter(i => i.severity === "error");
      const warnings = route.issues.filter(i => i.severity === "warn");
      
      for (let i = 0; i < errors.length; i++) {
        const isLast = i === errors.length - 1 && warnings.length === 0;
        const prefix = isLast ? "└──" : "├──";
        lines.push(`  ${prefix} ${chalk.red("●")} ${errors[i].message}`);
      }
      
      for (let i = 0; i < warnings.length; i++) {
        const isLast = i === warnings.length - 1;
        const prefix = isLast ? "└──" : "├──";
        lines.push(`  ${prefix} ${chalk.yellow("●")} ${warnings[i].message}`);
      }
    }

    const rulesetInfo = rulesetResults?.get(route.route);
    if (rulesetInfo && (rulesetInfo.errors > 0 || rulesetInfo.warnings > 0)) {
      const rErrors = rulesetInfo.errors > 0 ? chalk.red(`${rulesetInfo.errors} errors`) : "";
      const rWarnings = rulesetInfo.warnings > 0 ? chalk.yellow(`${rulesetInfo.warnings} warnings`) : "";
      lines.push(`  └── ${chalk.blue("○")} Rules: ${[rErrors, rWarnings].filter(Boolean).join(", ")}`);
    }

    lines.push("");
  }

  return lines.join("\n");
};

function getStatusIcon(route: RouteRealityReport): string {
  const hasErrors = route.issues.some(i => i.severity === "error");
  const hasWarnings = route.issues.some(i => i.severity === "warn");
  
  if (hasErrors) {
    return chalk.red("✗");
  }
  if (hasWarnings) {
    return chalk.yellow("◐");
  }
  return chalk.green("✓");
}
