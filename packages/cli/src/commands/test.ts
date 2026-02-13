import { Command } from "commander";
import chalk from "chalk";
import { stableStringify, type SchemaNode, type SchemaTypeName } from "@schemasentry/core";
import { resolveCliVersion } from "./utils.js";
import { collectSchemaData } from "../collect.js";
import { readFile } from "node:fs/promises";
import path from "path";

export type TestAssertion = {
  id: string;
  description: string;
  schemaType?: SchemaTypeName;
  field: string;
  condition: "exists" | "not_exists" | "equals" | "not_equals" | "contains" | "matches";
  value?: string;
};

export type TestConfig = {
  assertions: TestAssertion[];
};

export type TestResult = {
  assertionId: string;
  passed: boolean;
  routes: string[];
  message: string;
};

export const testCommand = new Command()
  .name("test")
  .description("Run schema assertions/tests on your site")
  .version(resolveCliVersion())
  .option(
    "-c, --config <path>",
    "Path to test config JSON",
    "schema-sentry.test.json"
  )
  .option(
    "--root <path>",
    "Root directory containing built HTML output",
    ".next/server/app"
  )
  .option(
    "-d, --data <path>",
    "Path to schema data file (optional, will collect from root if not provided)"
  )
  .option(
    "--rules <rulesets>",
    "Run rulesets (google,ai-citation). Comma-separated for multiple."
  )
  .option(
    "--format <format>",
    "Output format (table|json)",
    "table"
  )
  .action(async (options: {
    config: string;
    root: string;
    data?: string;
    rules?: string;
    format: string;
  }) => {
    console.log(chalk.blue.bold("🧪 Schema Sentry Test"));
    console.log(chalk.gray("Running schema assertions\n"));

    const cwd = process.cwd();
    const configPath = path.resolve(cwd, options.config);

    let config: TestConfig;
    try {
      const raw = await readFile(configPath, "utf-8");
      config = JSON.parse(raw);
    } catch {
      console.error(chalk.red(`Config not found at ${configPath}`));
      console.error(chalk.gray(`\nExample config:`));
      console.log(JSON.stringify({
        assertions: [
          {
            id: "all-articles-have-author",
            description: "All Article schemas must have author",
            schemaType: "Article",
            field: "author",
            condition: "exists"
          },
          {
            id: "all-products-have-price",
            description: "All Product schemas must have offers with price",
            schemaType: "Product",
            field: "offers.price",
            condition: "exists"
          }
        ]
      }, null, 2));
      process.exit(1);
    }

    let schemaData: Record<string, SchemaNode[]>;
    
    if (options.data) {
      const dataPath = path.resolve(cwd, options.data);
      try {
        const raw = await readFile(dataPath, "utf-8");
        const parsed = JSON.parse(raw);
        schemaData = parsed.routes || {};
      } catch {
        console.error(chalk.red(`Data file not found at ${dataPath}`));
        process.exit(1);
      }
    } else {
      const builtOutputDir = path.resolve(cwd, options.root);
      const collected = await collectSchemaData({ rootDir: builtOutputDir });
      schemaData = collected.data.routes || {};
    }

    const results = runAssertions(config.assertions, schemaData);

    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed).length;

    if (options.format === "json") {
      console.log(stableStringify({
        ok: failedCount === 0,
        summary: {
          total: results.length,
          passed: passedCount,
          failed: failedCount
        },
        results
      }));
    } else {
      printTableResults(results);
    }

    if (failedCount > 0) {
      console.error(chalk.red(`\n❌ ${failedCount} assertion(s) failed`));
      process.exit(1);
    } else {
      console.log(chalk.green(`\n✅ All ${passedCount} assertion(s) passed`));
    }
  });

function runAssertions(
  assertions: TestAssertion[],
  schemaData: Record<string, SchemaNode[]>
): TestResult[] {
  const results: TestResult[] = [];

  for (const assertion of assertions) {
    const matchingRoutes: string[] = [];

    for (const [route, nodes] of Object.entries(schemaData)) {
      const matchingNodes = assertion.schemaType
        ? nodes.filter(n => n["@type"] === assertion.schemaType)
        : nodes;

      if (matchingNodes.length === 0) continue;

      for (const node of matchingNodes) {
        const fieldValue = getNestedValue(node, assertion.field);
        const passed = evaluateCondition(assertion.condition, fieldValue, assertion.value);

        if (!passed) {
          matchingRoutes.push(route);
          break;
        }
      }
    }

    const passed = matchingRoutes.length === 0;
    
    results.push({
      assertionId: assertion.id,
      passed,
      routes: matchingRoutes,
      message: passed
        ? `All ${assertion.schemaType || "schemas"} have ${assertion.field}`
        : `Failed on ${matchingRoutes.length} route(s): ${matchingRoutes.slice(0, 3).join(", ")}${matchingRoutes.length > 3 ? "..." : ""}`
    });
  }

  return results;
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function evaluateCondition(
  condition: TestAssertion["condition"],
  fieldValue: unknown,
  expectedValue?: string
): boolean {
  switch (condition) {
    case "exists":
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
    
    case "not_exists":
      return fieldValue === undefined || fieldValue === null || fieldValue === "";
    
    case "equals":
      return String(fieldValue) === expectedValue;
    
    case "not_equals":
      return String(fieldValue) !== expectedValue;
    
    case "contains":
      return String(fieldValue).includes(expectedValue || "");
    
    case "matches":
      if (!expectedValue) return false;
      try {
        const regex = new RegExp(expectedValue);
        return regex.test(String(fieldValue));
      } catch {
        return false;
      }
    
    default:
      return false;
  }
}

function printTableResults(results: TestResult[]): void {
  const header = [
    chalk.white("Assertion"),
    chalk.white("Status"),
    chalk.white("Message")
  ];
  console.log(header.join(" | "));
  console.log(chalk.gray("-".repeat(100)));

  for (const result of results) {
    const statusIcon = result.passed ? chalk.green("✓") : chalk.red("✗");
    const message = result.message.length > 60
      ? result.message.slice(0, 57) + "..."
      : result.message;

    console.log([
      chalk.white(result.assertionId),
      statusIcon,
      message
    ].join(" | "));
  }
}
