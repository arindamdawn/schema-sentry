import { mkdtemp, rm, writeFile, access, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROUTE_COUNT = 200;
const THRESHOLD_MS = 5000;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cliEntryPath = path.resolve(scriptDir, "../dist/index.js");

const ensureBuiltCli = async () => {
  try {
    await access(cliEntryPath);
  } catch {
    console.error(
      `Benchmark requires built CLI at ${cliEntryPath}. Run "pnpm --filter @schemasentry/cli build" first.`
    );
    process.exit(1);
  }
};

const buildFixtures = () => {
  const dataRoutes = {};
  const manifestRoutes = {};

  for (let i = 0; i < ROUTE_COUNT; i += 1) {
    const route = `/bench-${i}`;
    dataRoutes[route] = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: `Bench Org ${i}`,
        url: `https://example.com${route}`
      }
    ];
    manifestRoutes[route] = ["Organization"];
  }

  return {
    manifest: { routes: manifestRoutes },
    data: { routes: dataRoutes }
  };
};

const createSourceFiles = async (appDir) => {
  // Create a single page.tsx file with Schema component for benchmark
  // This prevents ghost route detection from failing
  const pageContent = `
import { Schema, Organization } from "@schemasentry/next";

const org = Organization({
  name: "Benchmark",
  url: "https://example.com"
});

export default function Page() {
  return <Schema data={[org]} />;
}
`;
  
  await mkdir(appDir, { recursive: true });
  await writeFile(path.join(appDir, "page.tsx"), pageContent, "utf8");
};

const run = async () => {
  await ensureBuiltCli();

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "schema-sentry-bench-"));
  const manifestPath = path.join(tempDir, "schema-sentry.manifest.json");
  const dataPath = path.join(tempDir, "schema-sentry.data.json");
  const appDir = path.join(tempDir, "app");

  try {
    const fixtures = buildFixtures();
    await writeFile(manifestPath, JSON.stringify(fixtures.manifest), "utf8");
    await writeFile(dataPath, JSON.stringify(fixtures.data), "utf8");
    
    // Create source files to prevent ghost route detection
    await createSourceFiles(appDir);

    const args = [
      cliEntryPath,
      "audit",
      "--manifest",
      manifestPath,
      "--data",
      dataPath,
      "--root",
      tempDir,
      "--app-dir",
      appDir,
      "--no-recommended"
    ];

    const start = performance.now();
    const result = spawnSync(process.execPath, args, { encoding: "utf8" });
    const durationMs = performance.now() - start;

    if (result.status !== 0) {
      console.error("Benchmark command failed.");
      if (result.stderr) {
        console.error(result.stderr.trim());
      }
      if (result.stdout) {
        console.error(result.stdout.trim());
      }
      process.exit(result.status ?? 1);
    }

    const rounded = Math.round(durationMs);
    const pass = durationMs < THRESHOLD_MS;
    console.log(
      `Performance benchmark: ${ROUTE_COUNT} routes in ${rounded}ms (threshold: ${THRESHOLD_MS}ms)`
    );
    if (result.stderr) {
      console.log(result.stderr.trim());
    }

    if (!pass) {
      console.error(
        `Performance regression detected: ${rounded}ms exceeded ${THRESHOLD_MS}ms`
      );
      process.exit(1);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
};

run();
