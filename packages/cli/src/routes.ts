import { promises as fs } from "fs";
import path from "path";

export type RouteScanOptions = {
  rootDir: string;
  includeApp?: boolean;
  includePages?: boolean;
};

export const scanRoutes = async (options: RouteScanOptions): Promise<string[]> => {
  const rootDir = options.rootDir;
  const routes = new Set<string>();

  if (options.includeApp !== false) {
    const appDir = path.join(rootDir, "app");
    if (await dirExists(appDir)) {
      const files = await walkDir(appDir);
      for (const file of files) {
        if (!isAppPageFile(file)) {
          continue;
        }
        const route = toAppRoute(appDir, file);
        if (route) {
          routes.add(route);
        }
      }
    }
  }

  if (options.includePages !== false) {
    const pagesDir = path.join(rootDir, "pages");
    if (await dirExists(pagesDir)) {
      const files = await walkDir(pagesDir);
      for (const file of files) {
        if (!isPagesFile(file)) {
          continue;
        }
        const route = toPagesRoute(pagesDir, file);
        if (route) {
          routes.add(route);
        }
      }
    }
  }

  return Array.from(routes).sort();
};

const isAppPageFile = (filePath: string): boolean =>
  /\/page\.(t|j)sx?$/.test(filePath) || /\/page\.mdx$/.test(filePath);

const isPagesFile = (filePath: string): boolean =>
  /\.(t|j)sx?$/.test(filePath) || /\.mdx$/.test(filePath);

const toAppRoute = (appDir: string, filePath: string): string | null => {
  const relative = path.relative(appDir, filePath);
  const segments = relative.split(path.sep);
  if (segments.length === 0) {
    return null;
  }

  segments.pop();
  const routeSegments = segments
    .filter((segment) => segment.length > 0)
    .filter((segment) => !isGroupSegment(segment))
    .filter((segment) => !isParallelSegment(segment));

  if (routeSegments.length === 0) {
    return "/";
  }

  return `/${routeSegments.join("/")}`;
};

const toPagesRoute = (pagesDir: string, filePath: string): string | null => {
  const relative = path.relative(pagesDir, filePath);
  const segments = relative.split(path.sep);
  if (segments.length === 0) {
    return null;
  }

  if (segments[0] === "api") {
    return null;
  }

  const fileName = segments.pop();
  if (!fileName) {
    return null;
  }

  const baseName = fileName.replace(/\.[^/.]+$/, "");
  if (baseName.startsWith("_")) {
    return null;
  }

  const filtered = segments.filter((segment) => segment.length > 0);
  if (baseName !== "index") {
    filtered.push(baseName);
  }

  if (filtered.length === 0) {
    return "/";
  }

  return `/${filtered.join("/")}`;
};

const isGroupSegment = (segment: string): boolean =>
  segment.startsWith("(") && segment.endsWith(")");

const isParallelSegment = (segment: string): boolean => segment.startsWith("@");

const dirExists = async (dirPath: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
};

const walkDir = async (dirPath: string): Promise<string[]> => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const resolved = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(resolved)));
    } else if (entry.isFile()) {
      files.push(resolved);
    }
  }

  return files;
};
