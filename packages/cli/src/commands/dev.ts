import { Command } from "commander";
import { confirm, input, select } from "@inquirer/prompts";
import chokidar from "chokidar";
import { spawn } from "node:child_process";
import path from "path";
import chalk from "chalk";

type DevAction = "validate" | "audit" | "suggest";

type DevOptions = {
  action?: DevAction;
  once?: boolean;
  manifest?: string;
  root?: string;
  appDir?: string;
  build?: boolean;
  buildCommand?: string;
  format?: string;
  rules?: string;
  recommended?: boolean;
  annotations?: string;
  output?: string;
  data?: string;
  scan?: boolean;
  sourceScan?: boolean;
  provider?: string;
  apiKey?: string;
  model?: string;
  write?: boolean;
  force?: boolean;
  watch?: string[];
};

const DEFAULT_WATCH_PATHS = [
  "./app",
  "./pages",
  "schema-sentry.manifest.json",
  "schema-sentry.config.json"
];

const ACTION_LABELS: Record<DevAction, string> = {
  validate: "Validate (reality check)",
  audit: "Audit (ghost routes + health)",
  suggest: "Suggest (AI recommendations)"
};

const PROVIDER_OPTIONS = [
  { value: "", name: "Auto-detect (env vars)" },
  { value: "openai", name: "OpenAI" },
  { value: "anthropic", name: "Anthropic" },
  { value: "google", name: "Google Gemini" },
  { value: "nvidia", name: "NVIDIA NIM" },
  { value: "openrouter", name: "OpenRouter" }
];

const resolveCliScript = (): string => {
  const script = process.argv[1];
  if (!script) {
    throw new Error("Unable to resolve CLI entry point");
  }
  return script;
};

export const buildDevArgs = (action: DevAction, options: DevOptions): string[] => {
  const args: string[] = [action];

  if (options.manifest) {
    args.push("--manifest", options.manifest);
  }

  if (action === "validate") {
    if (options.root) args.push("--root", options.root);
    if (options.appDir) args.push("--app-dir", options.appDir);
    if (options.build) args.push("--build");
    if (options.buildCommand) args.push("--build-command", options.buildCommand);
    if (options.format) args.push("--format", options.format);
    if (options.rules) args.push("--rules", options.rules);
    if (options.annotations) args.push("--annotations", options.annotations);
    if (options.output) args.push("--output", options.output);
    if (options.recommended === true) args.push("--recommended");
    if (options.recommended === false) args.push("--no-recommended");
  }

  if (action === "audit") {
    if (options.data) args.push("--data", options.data);
    if (options.root) args.push("--root", options.root);
    if (options.scan) args.push("--scan");
    if (options.appDir) args.push("--app-dir", options.appDir);
    if (options.sourceScan === false) args.push("--no-source-scan");
    if (options.format) args.push("--format", options.format);
    if (options.annotations) args.push("--annotations", options.annotations);
    if (options.output) args.push("--output", options.output);
    if (options.recommended === true) args.push("--recommended");
    if (options.recommended === false) args.push("--no-recommended");
  }

  if (action === "suggest") {
    if (options.provider) args.push("--provider", options.provider);
    if (options.apiKey) args.push("--api-key", options.apiKey);
    if (options.model) args.push("--model", options.model);
    if (options.format) args.push("--format", options.format);
    if (options.output) args.push("--output", options.output);
    if (options.write) args.push("--write");
    if (options.force) args.push("--force");
  }

  return args;
};

const runCommand = (action: DevAction, options: DevOptions): Promise<number> =>
  new Promise((resolve, reject) => {
    const script = resolveCliScript();
    const args = [script, ...buildDevArgs(action, options)];
    const child = spawn(process.execPath, args, { stdio: "inherit" });

    child.on("error", (error) => reject(error));
    child.on("exit", (code) => resolve(code ?? 1));
  });

export const devCommand = new Command("dev")
  .description("Interactive mode with prompts and watch mode")
  .option("--action <action>", "validate|audit|suggest")
  .option("--once", "Run once and exit")
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
  .option("--watch <paths...>", "Paths to watch", DEFAULT_WATCH_PATHS)
  .action(async (options: DevOptions) => {
    const action = (options.action ?? await select({
      message: "Choose a command to run",
      choices: Object.entries(ACTION_LABELS).map(([value, name]) => ({ value, name }))
    })) as DevAction;

    if (action === "suggest" && !options.provider) {
      const provider = await select({
        message: "Select AI provider",
        choices: PROVIDER_OPTIONS.map((entry) => ({ value: entry.value, name: entry.name }))
      });
      options.provider = provider || undefined;
    }

    if (action === "suggest" && !options.write) {
      const apply = await confirm({
        message: "Apply suggestions to manifest?",
        default: false
      });
      options.write = apply;
      if (apply && !options.force) {
        const skipConfirm = await confirm({
          message: "Skip confirmation prompts?",
          default: false
        });
        options.force = skipConfirm;
      }
    }

    const runOnce = options.once ?? false;
    const watchPaths = (options.watch && options.watch.length > 0)
      ? options.watch
      : DEFAULT_WATCH_PATHS;

    const label = ACTION_LABELS[action];
    console.error(chalk.blue.bold(`\nSchema Sentry Dev - ${label}`));

    if (runOnce) {
      await runCommand(action, options);
      return;
    }

    console.error(chalk.gray(`Watching: ${watchPaths.join(", ")}`));

    let running = false;
    let pending = false;

    const execute = async () => {
      if (running) {
        pending = true;
        return;
      }
      running = true;
      pending = false;
      const exitCode = await runCommand(action, options);
      if (exitCode !== 0) {
        console.error(chalk.red(`Command exited with code ${exitCode}`));
      }
      running = false;
      if (pending) {
        await execute();
      }
    };

    await execute();

    const watcher = chokidar.watch(watchPaths, {
      ignoreInitial: true,
      ignored: ["**/.git/**", "**/node_modules/**", "**/.next/**", "**/dist/**"]
    });

    watcher.on("all", async (_event, filePath) => {
      const relative = path.relative(process.cwd(), filePath);
      console.error(chalk.gray(`Change detected: ${relative}`));
      await execute();
    });
  });
