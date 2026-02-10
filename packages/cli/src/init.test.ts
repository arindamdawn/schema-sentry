import { describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { buildData, buildManifest, getDefaultAnswers, writeInitFiles } from "./init";

const makeTempDir = async (): Promise<string> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "schema-sentry-"));
  return dir;
};

describe("init helpers", () => {
  it("builds the default manifest shape", () => {
    const manifest = buildManifest();
    expect(manifest).toEqual({
      routes: {
        "/": ["Organization", "WebSite"],
        "/blog/[slug]": ["Article"]
      }
    });
  });

  it("builds data using provided answers", () => {
    const answers = getDefaultAnswers();
    const data = buildData(answers, {
      today: new Date("2026-02-10T00:00:00.000Z")
    });
    const home = data.routes["/"] ?? [];
    const blog = data.routes["/blog/[slug]"] ?? [];

    expect(home.length).toBe(2);
    expect(home[0]?.["@type"]).toBe("Organization");
    expect(home[1]?.["@type"]).toBe("WebSite");

    expect(blog.length).toBe(1);
    expect(blog[0]?.["@type"]).toBe("Article");
    expect(blog[0]?.datePublished).toBe("2026-02-10");
  });

  it("writes init files and respects overwrite flags", async () => {
    const dir = await makeTempDir();
    const manifestPath = path.join(dir, "schema-sentry.manifest.json");
    const dataPath = path.join(dir, "schema-sentry.data.json");

    const first = await writeInitFiles({
      manifestPath,
      dataPath,
      overwriteManifest: false,
      overwriteData: false,
      answers: getDefaultAnswers(),
      today: new Date("2026-02-10T00:00:00.000Z")
    });

    expect(first.manifest).toBe("created");
    expect(first.data).toBe("created");

    const second = await writeInitFiles({
      manifestPath,
      dataPath,
      overwriteManifest: false,
      overwriteData: false,
      answers: getDefaultAnswers(),
      today: new Date("2026-02-10T00:00:00.000Z")
    });

    expect(second.manifest).toBe("skipped");
    expect(second.data).toBe("skipped");

    const third = await writeInitFiles({
      manifestPath,
      dataPath,
      overwriteManifest: true,
      overwriteData: true,
      answers: getDefaultAnswers(),
      today: new Date("2026-02-10T00:00:00.000Z")
    });

    expect(third.manifest).toBe("overwritten");
    expect(third.data).toBe("overwritten");
  });
});
