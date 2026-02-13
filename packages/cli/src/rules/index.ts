import type { SchemaNode, SchemaTypeName, ValidationIssue } from "@schemasentry/core";
import { GOOGLE_RULES, type RulesetRules } from "./google.js";
import { AI_CITATION_RULES } from "./ai-citation.js";

export type RulesetName = "google" | "ai-citation";

export type RulesetResult = {
  ok: boolean;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
  };
};

type Rule = {
  id: string;
  check: (node: SchemaNode, pathPrefix: string) => ValidationIssue[];
};

const RULESETS: Record<RulesetName, RulesetRules> = {
  "google": GOOGLE_RULES,
  "ai-citation": AI_CITATION_RULES
};

export const runRuleset = (
  rulesetName: RulesetName,
  nodes: SchemaNode[]
): RulesetResult => {
  const rulesByType = RULESETS[rulesetName];
  if (!rulesByType) {
    return {
      ok: true,
      issues: [],
      summary: { errors: 0, warnings: 0 }
    };
  }

  const allIssues: ValidationIssue[] = [];

  nodes.forEach((node, index) => {
    const type = node["@type"];
    if (!type || typeof type !== "string") {
      return;
    }

    const rules = rulesByType[type as SchemaTypeName] ?? [];
    const pathPrefix = `nodes[${index}]`;

    for (const rule of rules) {
      const issues = rule.check(node, pathPrefix);
      allIssues.push(...issues);
    }
  });

  const errorCount = allIssues.filter((i) => i.severity === "error").length;
  const warnCount = allIssues.filter((i) => i.severity === "warn").length;

  return {
    ok: errorCount === 0,
    issues: allIssues,
    summary: {
      errors: errorCount,
      warnings: warnCount
    }
  };
};

export const runMultipleRulesets = (
  rulesetNames: RulesetName[],
  nodes: SchemaNode[]
): RulesetResult => {
  const results = rulesetNames.map((name) => runRuleset(name, nodes));

  const allIssues = results.flatMap((r) => r.issues);
  const totalErrors = results.reduce((sum, r) => sum + r.summary.errors, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.summary.warnings, 0);

  return {
    ok: totalErrors === 0,
    issues: allIssues,
    summary: {
      errors: totalErrors,
      warnings: totalWarnings
    }
  };
};

export const parseRulesetNames = (input: string): RulesetName[] => {
  const parts = input.split(",").map((p) => p.trim().toLowerCase());
  const validNames: RulesetName[] = ["google", "ai-citation"];

  return parts
    .filter((p) => validNames.includes(p as RulesetName))
    .map((p) => p as RulesetName);
};
