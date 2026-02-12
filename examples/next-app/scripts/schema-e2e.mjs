import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const workDir = path.join(projectDir, ".schema-sentry-e2e");

const initManifestPath = path.join(workDir, "schema-sentry.manifest.init.json");
const initDataPath = path.join(workDir, "schema-sentry.data.init.json");
const collectedDataPath = path.join(workDir, "schema-sentry.data.collected.json");
const collectedManifestPath = path.join(
  workDir,
  "schema-sentry.manifest.collected.json"
);

const runPnpm = (args) => {
  const command = `pnpm ${args.join(" ")}`;
  console.log(`\n$ ${command}`);
  const result = spawnSync("pnpm", args, {
    cwd: projectDir,
    stdio: "inherit",
    env: process.env
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const toCollectedManifest = (data) => {
  const inputRoutes = data?.routes ?? {};
  const outputRoutes = {};

  for (const route of Object.keys(inputRoutes).sort()) {
    const nodes = Array.isArray(inputRoutes[route]) ? inputRoutes[route] : [];
    const types = Array.from(
      new Set(
        nodes
          .map((node) => node?.["@type"])
          .filter((type) => typeof type === "string" && type.length > 0)
      )
    ).sort();
    outputRoutes[route] = types;
  }

  return { routes: outputRoutes };
};

const run = async () => {
  await rm(workDir, { recursive: true, force: true });
  await mkdir(workDir, { recursive: true });

  runPnpm([
    "schemasentry",
    "init",
    "--yes",
    "--manifest",
    initManifestPath,
    "--data",
    initDataPath
  ]);

  runPnpm(["build"]);

  runPnpm([
    "schemasentry",
    "collect",
    "--root",
    "./.next/server/app",
    "--output",
    collectedDataPath
  ]);

  const collectedData = JSON.parse(await readFile(collectedDataPath, "utf8"));
  const collectedManifest = toCollectedManifest(collectedData);
  await writeFile(
    collectedManifestPath,
    `${JSON.stringify(collectedManifest, null, 2)}\n`,
    "utf8"
  );

  runPnpm([
    "schemasentry",
    "validate",
    "--manifest",
    collectedManifestPath,
    "--data",
    collectedDataPath
  ]);

  console.log(`\nSchema e2e workflow complete.`);
  console.log(`Artifacts: ${workDir}`);
};

run().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Schema e2e workflow failed: ${message}`);
  process.exit(1);
});
