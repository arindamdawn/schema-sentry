import { Command } from "commander";
import { runTui, TuiOptions } from "../tui.js";

export const tuiCommand = new Command("tui")
  .description("Interactive full-screen TUI with command picker, status panel, and watch mode")
  .option("--action <action>", "validate|audit|suggest", "validate")
  .option("-m, --manifest <path>", "Path to manifest JSON", "schema-sentry.manifest.json")
  .option("--root <path>", "Root directory for validate/audit")
  .option("--app-dir <path>", "Path to Next.js app directory", "./app")
  .option("--build", "Run build before validation")
  .option("--build-command <command>", "Build command used with --build")
  .option("--format <format>", "Output format")
  .option("--rules <rulesets>", "Rulesets for validate")
  .option("--annotations <provider>", "Emit CI annotations")
  .option("--recommended", "Enable recommended field checks")
  .option("--no-recommended", "Disable recommended field checks")
  .option("-o, --output <path>", "Write output to file")
  .option("-d, --data <path>", "Path to schema data JSON (audit)", "schema-sentry.data.json")
  .option("--scan", "Scan filesystem for routes (audit)")
  .option("--no-source-scan", "Disable source file scanning (audit)")
  .option("-p, --provider <provider>", "AI provider for suggest")
  .option("-k, --api-key <key>", "API key for suggest")
  .option("--model <model>", "Model for suggest")
  .option("--write", "Apply suggestions to manifest (suggest)")
  .option("--force", "Skip confirmation prompts")
  .option("--watch <paths...>", "Paths to watch")
  .action(async (options: TuiOptions) => {
    await runTui(options);
  });
