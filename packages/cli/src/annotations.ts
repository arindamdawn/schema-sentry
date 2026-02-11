import type { ValidationIssue } from "@schemasentry/core";
import type { Report } from "./report";

const escapeCommandValue = (value: string): string =>
  value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

const escapeCommandProperty = (value: string): string =>
  escapeCommandValue(value).replace(/:/g, "%3A").replace(/,/g, "%2C");

const formatIssueMessage = (route: string, issue: ValidationIssue): string =>
  `[${route}] ${issue.ruleId}: ${issue.message} (${issue.path})`;

export const buildGitHubAnnotationLines = (
  report: Report,
  commandLabel: string
): string[] => {
  const title = escapeCommandProperty(`Schema Sentry ${commandLabel}`);
  const lines: string[] = [];

  for (const route of report.routes) {
    for (const issue of route.issues) {
      const level = issue.severity === "error" ? "error" : "warning";
      const message = escapeCommandValue(formatIssueMessage(route.route, issue));
      lines.push(`::${level} title=${title}::${message}`);
    }
  }

  return lines;
};

export const emitGitHubAnnotations = (
  report: Report,
  commandLabel: string
): void => {
  const lines = buildGitHubAnnotationLines(report, commandLabel);
  for (const line of lines) {
    console.error(line);
  }
};
