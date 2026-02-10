import { describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { scanRoutes } from "./routes";

const makeTempDir = async (): Promise<string> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "schema-sentry-routes-"));
  return dir;
};

const writeFile = async (root: string, filePath: string) => {
  const fullPath = path.join(root, filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, "// test", "utf8");
};

describe("scanRoutes", () => {
  it("collects app and pages routes", async () => {
    const root = await makeTempDir();

    await writeFile(root, "app/page.tsx");
    await writeFile(root, "app/blog/[slug]/page.tsx");
    await writeFile(root, "app/(marketing)/pricing/page.tsx");
    await writeFile(root, "pages/docs/index.tsx");
    await writeFile(root, "pages/api/health.ts");

    const routes = await scanRoutes({ rootDir: root });
    expect(routes).toEqual(["/", "/blog/[slug]", "/docs", "/pricing"]);
  });
});
