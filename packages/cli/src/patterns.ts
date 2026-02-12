import type { SchemaTypeName } from "@schemasentry/core";

export type PatternRule = {
  pattern: string;
  schemaType: SchemaTypeName;
  priority?: number;
};

export type PatternConfig = {
  patterns?: PatternRule[];
};

export const DEFAULT_PATTERNS: PatternRule[] = [
  { pattern: "/blog/*", schemaType: "BlogPosting", priority: 10 },
  { pattern: "/blog", schemaType: "WebPage", priority: 5 },
  { pattern: "/products/*", schemaType: "Product", priority: 10 },
  { pattern: "/product/*", schemaType: "Product", priority: 10 },
  { pattern: "/faq", schemaType: "FAQPage", priority: 10 },
  { pattern: "/faqs", schemaType: "FAQPage", priority: 10 },
  { pattern: "/how-to/*", schemaType: "HowTo", priority: 10 },
  { pattern: "/howto/*", schemaType: "HowTo", priority: 10 },
  { pattern: "/events/*", schemaType: "Event", priority: 10 },
  { pattern: "/event/*", schemaType: "Event", priority: 10 },
  { pattern: "/reviews/*", schemaType: "Review", priority: 10 },
  { pattern: "/review/*", schemaType: "Review", priority: 10 },
  { pattern: "/videos/*", schemaType: "VideoObject", priority: 10 },
  { pattern: "/video/*", schemaType: "VideoObject", priority: 10 },
  { pattern: "/images/*", schemaType: "ImageObject", priority: 10 },
  { pattern: "/image/*", schemaType: "ImageObject", priority: 10 },
  { pattern: "/about", schemaType: "WebPage", priority: 10 },
  { pattern: "/contact", schemaType: "WebPage", priority: 10 },
  { pattern: "/", schemaType: "WebSite", priority: 1 }
];

export const matchRouteToPatterns = (
  route: string,
  patterns: PatternRule[] = DEFAULT_PATTERNS
): SchemaTypeName[] => {
  const matches: Array<{ type: SchemaTypeName; priority: number }> = [];

  for (const rule of patterns) {
    if (routeMatchesPattern(route, rule.pattern)) {
      matches.push({
        type: rule.schemaType,
        priority: rule.priority ?? 5
      });
    }
  }

  matches.sort((a, b) => b.priority - a.priority);

  return [...new Set(matches.map((m) => m.type))];
};

const routeMatchesPattern = (route: string, pattern: string): boolean => {
  if (pattern === route) {
    return true;
  }

  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -1);
    return route.startsWith(prefix);
  }

  const patternRegex = pattern
    .replace(/\*/g, "[^/]+")
    .replace(/\?/g, ".");
  
  const regex = new RegExp(`^${patternRegex}$`);
  return regex.test(route);
};

export const inferSchemaTypes = (
  routes: string[],
  customPatterns?: PatternRule[]
): Map<string, SchemaTypeName[]> => {
  const patterns = customPatterns ?? DEFAULT_PATTERNS;
  const result = new Map<string, SchemaTypeName[]>();

  for (const route of routes) {
    const types = matchRouteToPatterns(route, patterns);
    if (types.length > 0) {
      result.set(route, types);
    }
  }

  return result;
};

export const generateManifestEntries = (
  routes: string[],
  customPatterns?: PatternRule[]
): Record<string, SchemaTypeName[]> => {
  const inferred = inferSchemaTypes(routes, customPatterns);
  const entries: Record<string, SchemaTypeName[]> = {};

  for (const [route, types] of inferred) {
    entries[route] = types;
  }

  return entries;
};
