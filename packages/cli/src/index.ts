#!/usr/bin/env node
import { Command } from "commander";
import { readFile } from "fs/promises";
import path from "path";
import { stableStringify, type Manifest } from "@schemasentry/core";
import { buildReport, type SchemaDataFile } from "./report";
import { fileExists, getDefaultAnswers, writeInitFiles } from "./init";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";

const program = new Command();

program
  .name("schemasentry")
  .description("Schema Sentry CLI")
  .version("0.1.0");

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
  .option("--no-recommended", "Disable recommended field checks")
  .action(
    async (options: { manifest: string; data: string; recommended: boolean }) => {
    const manifestPath = path.resolve(process.cwd(), options.manifest);
    const dataPath = path.resolve(process.cwd(), options.data);
    let raw: string;

    try {
      raw = await readFile(manifestPath, "utf8");
    } catch (error) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "manifest.not_found",
              message: `Manifest not found at ${manifestPath}`
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    let manifest: Manifest;
    try {
      manifest = JSON.parse(raw) as Manifest;
    } catch (error) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "manifest.invalid_json",
              message: "Manifest is not valid JSON"
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    if (!isManifest(manifest)) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "manifest.invalid_shape",
              message:
                "Manifest must contain a 'routes' object with string array values"
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    let dataRaw: string;
    try {
      dataRaw = await readFile(dataPath, "utf8");
    } catch (error) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "data.not_found",
              message: `Schema data not found at ${dataPath}`
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    let data: SchemaDataFile;
    try {
      data = JSON.parse(dataRaw) as SchemaDataFile;
    } catch (error) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "data.invalid_json",
              message: "Schema data is not valid JSON"
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    if (!isSchemaData(data)) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "data.invalid_shape",
              message:
                "Schema data must contain a 'routes' object with array values"
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    const report = buildReport(manifest, data, {
      recommended: options.recommended
    });
    console.log(formatReportOutput(report));
    process.exit(report.ok ? 0 : 1);
  }
  );

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
  .action(
    async (options: { manifest: string; data: string; yes?: boolean; force?: boolean }) => {
      const manifestPath = path.resolve(process.cwd(), options.manifest);
      const dataPath = path.resolve(process.cwd(), options.data);
      const force = options.force ?? false;
      const useDefaults = options.yes ?? false;
      const answers = useDefaults ? getDefaultAnswers() : await promptAnswers();

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
        answers
      });

      printInitSummary({ manifestPath, dataPath, result });
    }
  );

program.parse();

const isManifest = (value: unknown): value is Manifest => {
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
};

const isSchemaData = (value: unknown): value is SchemaDataFile => {
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
};

const formatReportOutput = (report: ReturnType<typeof buildReport>): string =>
  stableStringify(report);

const promptAnswers = async () => {
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
};

const ask = async (
  rl: ReturnType<typeof createInterface>,
  question: string,
  fallback: string
) => {
  const answer = (await rl.question(`${question} (${fallback}): `)).trim();
  return answer.length > 0 ? answer : fallback;
};

const resolveOverwrites = async (options: {
  manifestPath: string;
  dataPath: string;
  force: boolean;
  interactive: boolean;
}): Promise<[boolean, boolean]> => {
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
};

const confirm = async (
  rl: ReturnType<typeof createInterface>,
  question: string,
  defaultValue: boolean
) => {
  const hint = defaultValue ? "Y/n" : "y/N";
  const answer = (await rl.question(`${question} (${hint}): `)).trim().toLowerCase();
  if (!answer) {
    return defaultValue;
  }
  return answer === "y" || answer === "yes";
};

const printInitSummary = (options: {
  manifestPath: string;
  dataPath: string;
  result: Awaited<ReturnType<typeof writeInitFiles>>;
}) => {
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
};
