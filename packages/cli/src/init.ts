import { promises as fs } from "fs";
import path from "path";
import { SCHEMA_CONTEXT, type SchemaNode } from "@schemasentry/core";

export type InitAnswers = {
  siteName: string;
  siteUrl: string;
  authorName: string;
};

export type InitWriteResult = {
  manifest: "created" | "overwritten" | "skipped";
  data: "created" | "overwritten" | "skipped";
};

export type InitWriteOptions = {
  manifestPath: string;
  dataPath: string;
  overwriteManifest: boolean;
  overwriteData: boolean;
  answers: InitAnswers;
  scannedRoutes?: string[];
  today?: Date;
};

const DEFAULT_ANSWERS: InitAnswers = {
  siteName: "Acme Corp",
  siteUrl: "https://acme.com",
  authorName: "Jane Doe"
};

export const getDefaultAnswers = (): InitAnswers => ({ ...DEFAULT_ANSWERS });

export const buildManifest = (scannedRoutes: string[] = []) => {
  const routes: Record<string, string[]> = {
    "/": ["Organization", "WebSite"],
    "/blog/[slug]": ["Article"]
  };

  for (const route of scannedRoutes) {
    if (!routes[route]) {
      routes[route] = ["WebPage"];
    }
  }

  return { routes };
};

const formatDate = (value: Date): string => value.toISOString().slice(0, 10);

export const buildData = (
  answers: InitAnswers,
  options: { today?: Date; scannedRoutes?: string[] } = {}
): { routes: Record<string, SchemaNode[]> } => {
  const { siteName, siteUrl, authorName } = answers;
  const normalizedSiteUrl = normalizeUrl(siteUrl);
  const today = options.today ?? new Date();
  const date = formatDate(today);
  const logoUrl = new URL("/logo.png", normalizedSiteUrl).toString();
  const articleUrl = new URL("/blog/hello-world", normalizedSiteUrl).toString();
  const imageUrl = new URL("/blog/hello-world.png", normalizedSiteUrl).toString();

  const routes: Record<string, SchemaNode[]> = {
    "/": [
      {
        "@context": SCHEMA_CONTEXT,
        "@type": "Organization",
        name: siteName,
        url: normalizedSiteUrl,
        logo: logoUrl,
        description: `Official website of ${siteName}`
      },
      {
        "@context": SCHEMA_CONTEXT,
        "@type": "WebSite",
        name: siteName,
        url: normalizedSiteUrl,
        description: `Learn more about ${siteName}`
      }
    ],
    "/blog/[slug]": [
      {
        "@context": SCHEMA_CONTEXT,
        "@type": "Article",
        headline: "Hello World",
        author: {
          "@type": "Person",
          name: authorName
        },
        datePublished: date,
        dateModified: date,
        description: `An introduction to ${siteName}`,
        image: imageUrl,
        url: articleUrl
      }
    ]
  };

  for (const route of options.scannedRoutes ?? []) {
    if (routes[route]) {
      continue;
    }

    routes[route] = [
      {
        "@context": SCHEMA_CONTEXT,
        "@type": "WebPage",
        name: routeToName(route),
        url: new URL(route, normalizedSiteUrl).toString()
      }
    ];
  }

  return { routes };
};

export const writeInitFiles = async (
  options: InitWriteOptions
): Promise<InitWriteResult> => {
  const {
    manifestPath,
    dataPath,
    overwriteManifest,
    overwriteData,
    answers,
    today,
    scannedRoutes
  } = options;
  const manifest = buildManifest(scannedRoutes ?? []);
  const data = buildData(answers, { today, scannedRoutes });

  const manifestResult = await writeJsonFile(
    manifestPath,
    manifest,
    overwriteManifest
  );
  const dataResult = await writeJsonFile(dataPath, data, overwriteData);

  return {
    manifest: manifestResult,
    data: dataResult
  };
};

const writeJsonFile = async (
  filePath: string,
  payload: unknown,
  overwrite: boolean
): Promise<"created" | "overwritten" | "skipped"> => {
  const exists = await fileExists(filePath);
  if (exists && !overwrite) {
    return "skipped";
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const json = JSON.stringify(payload, null, 2);
  await fs.writeFile(filePath, `${json}\n`, "utf8");
  return exists ? "overwritten" : "created";
};

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const normalizeUrl = (value: string): string => {
  try {
    return new URL(value).toString();
  } catch {
    return new URL(`https://${value}`).toString();
  }
};

const routeToName = (route: string): string => {
  if (route === "/") {
    return "Home";
  }

  const cleaned = route
    .replace(/\[|\]/g, "")
    .split("/")
    .filter(Boolean)
    .join(" ");

  return cleaned
    .split(/\s+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};
