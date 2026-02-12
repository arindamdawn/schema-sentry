import { Command } from "commander";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "path";
import chalk from "chalk";
import { stableStringify } from "@schemasentry/core";
import { fileExists, getDefaultAnswers, writeInitFiles } from "../init.js";
import { scanRoutes } from "../routes.js";
import { printCliError } from "./utils.js";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export const initCommand = new Command("init")
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
  .option("--scan", "Scan the filesystem for routes and add WebPage entries")
  .option("--root <path>", "Project root for scanning", ".")
  .action(async (options: {
    manifest: string;
    data: string;
    yes?: boolean;
    force?: boolean;
    scan?: boolean;
    root?: string;
  }) => {
    const manifestPath = path.resolve(process.cwd(), options.manifest);
    const dataPath = path.resolve(process.cwd(), options.data);
    const force = options.force ?? false;
    const useDefaults = options.yes ?? false;
    const answers = useDefaults ? getDefaultAnswers() : await promptAnswers();
    const scannedRoutes = options.scan
      ? await scanRoutes({ rootDir: path.resolve(process.cwd(), options.root ?? ".") })
      : [];
    if (options.scan && scannedRoutes.length === 0) {
      console.error("No routes found during scan.");
    }

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
      answers,
      scannedRoutes
    });

    printInitSummary({ manifestPath, dataPath, result });
  });

async function promptAnswers(): Promise<{
  siteName: string;
  siteUrl: string;
  authorName: string;
}> {
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
}

async function ask(
  rl: ReturnType<typeof createInterface>,
  question: string,
  fallback: string
): Promise<string> {
  const answer = (await rl.question(`${question} (${fallback}): `)).trim();
  return answer.length > 0 ? answer : fallback;
}

async function resolveOverwrites(options: {
  manifestPath: string;
  dataPath: string;
  force: boolean;
  interactive: boolean;
}): Promise<[boolean, boolean]> {
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
}

async function confirm(
  rl: ReturnType<typeof createInterface>,
  question: string,
  defaultValue: boolean
): Promise<boolean> {
  const hint = defaultValue ? "Y/n" : "y/N";
  const answer = (await rl.question(`${question} (${hint}): `)).trim().toLowerCase();
  if (!answer) {
    return defaultValue;
  }
  return answer === "y" || answer === "yes";
}

function printInitSummary(options: {
  manifestPath: string;
  dataPath: string;
  result: Awaited<ReturnType<typeof writeInitFiles>>;
}): void {
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
}
