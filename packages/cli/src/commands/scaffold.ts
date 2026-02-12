import { Command } from "commander";
import path from "path";
import chalk from "chalk";
import {
  scaffoldSchema,
  formatScaffoldPreview,
  applyScaffold
} from "../scaffold.js";

export const scaffoldCommand = new Command("scaffold")
  .description("Generate schema stubs for routes without schema (dry-run by default)")
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
  .option("--root <path>", "Project root for scanning", ".")
  .option("--write", "Apply changes (default is dry-run)")
  .option("-f, --force", "Skip confirmation prompts")
  .action(async (options: {
    manifest: string;
    data: string;
    root?: string;
    write?: boolean;
    force?: boolean;
  }) => {
    const start = Date.now();
    const manifestPath = path.resolve(process.cwd(), options.manifest);
    const dataPath = path.resolve(process.cwd(), options.data);
    const rootDir = path.resolve(process.cwd(), options.root ?? ".");
    const dryRun = !(options.write ?? false);
    const force = options.force ?? false;

    console.error(chalk.blue.bold("🏗️  Schema Sentry Scaffold\n"));
    console.error(chalk.gray("Scanning for routes that need schema...\n"));

    const result = await scaffoldSchema({
      manifestPath,
      dataPath,
      rootDir,
      dryRun,
      force
    });

    console.error(formatScaffoldPreview(result));

    if (!result.wouldUpdate) {
      console.error(chalk.green("\n✅ All routes have schema!"));
      process.exit(0);
      return;
    }

    if (dryRun) {
      console.error(chalk.yellow("\n⚠️  Dry run complete."));
      console.error("Use --write to update JSON files (does NOT modify source code).\n");
      process.exit(0);
      return;
    }

    if (!force) {
      console.error(chalk.yellow("\n⚠️  Scaffolding will update:"));
      console.error(`   - ${manifestPath}`);
      console.error(`   - ${dataPath}`);
      console.error("\nUse --force to skip this confirmation.");
    }

    try {
      await applyScaffold(result, {
        manifestPath,
        dataPath,
        rootDir,
        dryRun,
        force
      });
      console.error(chalk.green(`\n✓ Scaffold complete in ${Date.now() - start}ms`));
      console.error(chalk.gray("\nRemember: You still need to add the Schema components to your source files!"));
      process.exit(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(chalk.red(`\n❌ Failed to apply scaffold: ${message}`));
      console.error("Check file permissions or disk space.");
      process.exit(1);
    }
  });
