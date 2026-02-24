import blessed from "blessed";
import { spawn } from "node:child_process";
import chokidar, { FSWatcher } from "chokidar";
import path from "node:path";

export type TuiAction = "validate" | "audit" | "suggest";

export type TuiOptions = {
  action?: TuiAction;
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
  watchPaths?: string[];
};

type TuiState = {
  running: boolean;
  exitCode: number | null;
  lastDuration: number;
  watchEnabled: boolean;
  action: TuiAction;
  logs: string[];
};

const ACTIONS: { key: string; label: string; action: TuiAction }[] = [
  { key: "1", label: "Validate", action: "validate" },
  { key: "2", label: "Audit", action: "audit" },
  { key: "3", label: "Suggest", action: "suggest" }
];

const DEFAULT_WATCH = ["./app", "./pages", "schema-sentry.manifest.json"];

export async function runTui(options: TuiOptions): Promise<void> {
  const state: TuiState = {
    running: false,
    exitCode: 0,
    lastDuration: 0,
    watchEnabled: false,
    action: options.action || "validate",
    logs: []
  };

  const screen = blessed.screen({
    smartCSR: true,
    title: "Schema Sentry TUI"
  });

  const header = blessed.box({
    top: 0,
    left: 0,
    width: "100%",
    height: 3,
    content: `{bold}Schema Sentry TUI{/bold} - Press 1/2/3 to switch command, SPACE to run, W to toggle watch, Q to quit`,
    style: {
      fg: "white",
      bg: "blue"
    }
  });

  const statusBar = blessed.box({
    top: 3,
    left: 0,
    width: "100%",
    height: 3,
    content: getStatusContent(state),
    style: {
      fg: "white",
      bg: "black"
    }
  });

  const logsBox = blessed.log({
    top: 6,
    left: 0,
    width: "100%",
    height: "70%",
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      ch: "│"
    },
    style: {
      fg: "white",
      bg: "black"
    }
  });

  const helpBar = blessed.box({
    bottom: 0,
    left: 0,
    width: "100%",
    height: 3,
    content: `[1] Validate [2] Audit [3] Suggest [SPACE] Run [W] Watch [R] Re-run [Q] Quit`,
    style: {
      fg: "white",
      bg: "blue"
    }
  });

  screen.append(header);
  screen.append(statusBar);
  screen.append(logsBox);
  screen.append(helpBar);

  let watcher: FSWatcher | null = null;

  function getStatusContent(s: TuiState): string {
    const status = s.running ? "{yellow}Running...{/}" : s.exitCode === 0 ? "{green}Ready{/}" : "{red}Failed{/}";
    const watch = s.watchEnabled ? "{green}ON{/}" : "{gray}OFF{/}";
    return `Status: ${status} | Command: ${s.action} | Watch: ${watch} | Last: ${s.lastDuration}ms`;
  }

  function updateStatus() {
    statusBar.setContent(getStatusContent(state));
    screen.render();
  }

  function addLog(line: string) {
    state.logs.push(line);
    if (state.logs.length > 1000) {
      state.logs.shift();
    }
    logsBox.log(line);
  }

  async function runCommand(): Promise<number> {
    if (state.running) return 0;

    state.running = true;
    updateStatus();
    addLog(`\n-- Running ${state.action} --`);

    const start = Date.now();

    return new Promise((resolve) => {
      const args = buildArgs(state.action, options);

      const child = spawn(process.execPath, [process.argv[1], ...args, "--format", "json"], {
        stdio: ["ignore", "pipe", "pipe"]
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        state.running = false;
        state.exitCode = code ?? 1;
        state.lastDuration = Date.now() - start;

        if (stdout) {
          try {
            const result = JSON.parse(stdout);
            addLog(`Exit: ${code} | Duration: ${state.lastDuration}ms`);
            if (result.summary) {
              addLog(`Routes: ${result.summary.routes} | Errors: ${result.summary.errors} | Warnings: ${result.summary.warnings}`);
            }
          } catch {
            addLog(stdout.substring(0, 500));
          }
        }

        if (stderr) {
          addLog(`{red}${stderr.substring(0, 500)}{/}`);
        }

        updateStatus();
        resolve(code ?? 1);
      });
    });
  }

  function buildArgs(action: TuiAction, opts: TuiOptions): string[] {
    const args: string[] = [action];

    if (opts.manifest) args.push("--manifest", opts.manifest);
    if (opts.root) args.push("--root", opts.root);
    if (opts.appDir) args.push("--app-dir", opts.appDir);
    if (opts.build) args.push("--build");
    if (opts.buildCommand) args.push("--build-command", opts.buildCommand);
    if (opts.format) args.push("--format", opts.format);
    if (opts.rules) args.push("--rules", opts.rules);
    if (opts.annotations) args.push("--annotations", opts.annotations);
    if (opts.output) args.push("--output", opts.output);
    if (opts.recommended === false) args.push("--no-recommended");

    if (action === "audit") {
      if (opts.data) args.push("--data", opts.data);
      if (opts.scan) args.push("--scan");
      if (opts.sourceScan === false) args.push("--no-source-scan");
    }

    if (action === "suggest") {
      if (opts.provider) args.push("--provider", opts.provider);
      if (opts.apiKey) args.push("--api-key", opts.apiKey);
      if (opts.model) args.push("--model", opts.model);
      if (opts.write) args.push("--write");
      if (opts.force) args.push("--force");
    }

    return args;
  }

  function toggleWatch() {
    state.watchEnabled = !state.watchEnabled;

    if (state.watchEnabled && !watcher) {
      const watchPaths = options.watchPaths || DEFAULT_WATCH;
      watcher = chokidar.watch(watchPaths, {
        ignoreInitial: true,
        ignored: ["**/.git/**", "**/node_modules/**", "**/.next/**", "**/dist/**"]
      });

      watcher.on("all", (_event: string, filePath: string) => {
        const relative = path.relative(process.cwd(), filePath);
        addLog(`\n-- File changed: ${relative} --`);
        if (!state.running) {
          runCommand();
        }
      });

      addLog(`Watch enabled: ${watchPaths.join(", ")}`);
    } else if (!state.watchEnabled && watcher) {
      watcher.close();
      watcher = null;
      addLog("Watch disabled");
    }

    updateStatus();
  }

  screen.key("1", () => {
    state.action = "validate";
    updateStatus();
  });

  screen.key("2", () => {
    state.action = "audit";
    updateStatus();
  });

  screen.key("3", () => {
    state.action = "suggest";
    updateStatus();
  });

  screen.key("space", () => {
    if (!state.running) {
      runCommand();
    }
  });

  screen.key("w", () => {
    toggleWatch();
  });

  screen.key("r", () => {
    if (!state.running) {
      runCommand();
    }
  });

  screen.key("q", () => {
    if (watcher) {
      watcher.close();
    }
    process.exit(0);
  });

  screen.key("C-c", () => {
    if (watcher) {
      watcher.close();
    }
    process.exit(0);
  });

  addLog("Schema Sentry TUI initialized");
  addLog("Press 1/2/3 to select command, SPACE to run");
  updateStatus();
  screen.render();

  await runCommand();
}
