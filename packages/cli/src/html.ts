import type { Report, RouteReport } from "./report";

export type HtmlReportOptions = {
  title: string;
  generatedAt?: Date;
};

const escapeHtml = (value: unknown): string =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderRouteIssues = (route: RouteReport): string => {
  if (route.issues.length === 0) {
    return '<p class="muted">No issues.</p>';
  }

  const items = route.issues
    .map((issue) => {
      const severityClass = issue.severity === "error" ? "sev-error" : "sev-warn";
      return `<li class="${severityClass}">
        <span class="sev">${escapeHtml(issue.severity.toUpperCase())}</span>
        <code>${escapeHtml(issue.ruleId)}</code>
        <span>${escapeHtml(issue.message)}</span>
        <small>${escapeHtml(issue.path)}</small>
      </li>`;
    })
    .join("");

  return `<ul class="issues">${items}</ul>`;
};

const renderRoute = (route: RouteReport): string => {
  const statusClass = route.ok ? "ok" : "fail";
  const expected = route.expectedTypes.length
    ? route.expectedTypes.join(", ")
    : "(none)";
  const found = route.foundTypes.length ? route.foundTypes.join(", ") : "(none)";

  return `<section class="route">
    <header>
      <h3>${escapeHtml(route.route)}</h3>
      <span class="badge ${statusClass}">${route.ok ? "OK" : "FAIL"}</span>
    </header>
    <p><strong>Score:</strong> ${route.score}</p>
    <p><strong>Expected types:</strong> ${escapeHtml(expected)}</p>
    <p><strong>Found types:</strong> ${escapeHtml(found)}</p>
    ${renderRouteIssues(route)}
  </section>`;
};

const renderCoverage = (report: Report): string => {
  if (!report.summary.coverage) {
    return "<li><strong>Coverage:</strong> not enabled</li>";
  }

  const coverage = report.summary.coverage;
  return `<li><strong>Coverage:</strong> missing_routes=${coverage.missingRoutes} missing_types=${coverage.missingTypes} unlisted_routes=${coverage.unlistedRoutes}</li>`;
};

export const renderHtmlReport = (
  report: Report,
  options: HtmlReportOptions
): string => {
  const title = escapeHtml(options.title);
  const generatedAt = escapeHtml(
    (options.generatedAt ?? new Date()).toISOString()
  );
  const routes = report.routes.map(renderRoute).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; margin: 24px; line-height: 1.45; }
    h1, h2, h3 { margin: 0 0 8px; }
    .muted { color: #666; }
    .summary, .routes { margin-top: 20px; }
    .route { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 12px 0; }
    .route header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .badge { padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .badge.ok { background: #dcfce7; color: #166534; }
    .badge.fail { background: #fee2e2; color: #991b1b; }
    .issues { margin: 10px 0 0; padding-left: 16px; }
    .issues li { margin: 8px 0; display: grid; gap: 2px; }
    .sev { font-weight: 700; }
    .sev-error .sev { color: #991b1b; }
    .sev-warn .sev { color: #92400e; }
    code { background: #f5f5f5; padding: 1px 5px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="muted">Generated at ${generatedAt}</p>

  <section class="summary">
    <h2>Summary</h2>
    <ul>
      <li><strong>OK:</strong> ${report.ok}</li>
      <li><strong>Routes:</strong> ${report.summary.routes}</li>
      <li><strong>Errors:</strong> ${report.summary.errors}</li>
      <li><strong>Warnings:</strong> ${report.summary.warnings}</li>
      <li><strong>Score:</strong> ${report.summary.score}</li>
      ${renderCoverage(report)}
    </ul>
  </section>

  <section class="routes">
    <h2>Routes</h2>
    ${routes}
  </section>
</body>
</html>`;
};
