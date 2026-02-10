export const SCHEMA_CONTEXT = "https://schema.org" as const;

export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdObject
  | JsonLdValue[];

export type JsonLdObject = {
  [key: string]: JsonLdValue;
};

export type SchemaTypeName =
  | "Organization"
  | "Person"
  | "Place"
  | "LocalBusiness"
  | "WebSite"
  | "WebPage"
  | "Article"
  | "BlogPosting"
  | "Product"
  | "Event"
  | "Review"
  | "FAQPage"
  | "HowTo"
  | "BreadcrumbList";

export type SchemaNode = JsonLdObject & {
  "@context": typeof SCHEMA_CONTEXT;
  "@type": SchemaTypeName;
  "@id"?: string;
};

type BaseInput = {
  id?: string;
};

const withBase = <T extends JsonLdObject>(
  type: SchemaTypeName,
  input: T & BaseInput
): SchemaNode => {
  const base: SchemaNode = {
    "@context": SCHEMA_CONTEXT,
    "@type": type
  };

  if (input.id) {
    base["@id"] = input.id;
  }

  return {
    ...base,
    ...input
  };
};

export type OrganizationInput = BaseInput & {
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
};

export const Organization = (input: OrganizationInput): SchemaNode =>
  withBase("Organization", input);

export type PersonInput = BaseInput & {
  name: string;
  url?: string;
  sameAs?: string[];
  jobTitle?: string;
};

export const Person = (input: PersonInput): SchemaNode =>
  withBase("Person", input);

export type LocationInput = BaseInput & {
  name: string;
  address?: string;
  url?: string;
};

export const Location = (input: LocationInput): SchemaNode =>
  withBase("Place", input);

export type LocalBusinessInput = BaseInput & {
  name: string;
  address?: string;
  url?: string;
  telephone?: string;
  image?: string;
  priceRange?: string;
  sameAs?: string[];
  description?: string;
};

export const LocalBusiness = (input: LocalBusinessInput): SchemaNode =>
  withBase("LocalBusiness", input);

export type WebSiteInput = BaseInput & {
  name: string;
  url: string;
  description?: string;
};

export const WebSite = (input: WebSiteInput): SchemaNode =>
  withBase("WebSite", input);

export type WebPageInput = BaseInput & {
  name: string;
  url: string;
  description?: string;
  isPartOf?: SchemaNode;
};

export const WebPage = (input: WebPageInput): SchemaNode =>
  withBase("WebPage", input);

export type ArticleInput = BaseInput & {
  headline: string;
  authorName: string;
  datePublished: string;
  url: string;
  dateModified?: string;
  description?: string;
  image?: string;
};

export const Article = (input: ArticleInput): SchemaNode => {
  const { authorName, ...rest } = input;
  return withBase("Article", {
    ...rest,
    author: {
      "@type": "Person",
      name: authorName
    }
  });
};

export type BlogPostingInput = ArticleInput;

export const BlogPosting = (input: BlogPostingInput): SchemaNode => {
  const { authorName, ...rest } = input;
  return withBase("BlogPosting", {
    ...rest,
    author: {
      "@type": "Person",
      name: authorName
    }
  });
};

export type ProductInput = BaseInput & {
  name: string;
  description: string;
  url: string;
  image?: string;
  brandName?: string;
  sku?: string;
};

export const Product = (input: ProductInput): SchemaNode => {
  const { brandName, ...rest } = input;
  return withBase("Product", {
    ...rest,
    ...(brandName
      ? {
          brand: {
            "@type": "Brand",
            name: brandName
          }
        }
      : {})
  });
};

export type EventInput = BaseInput & {
  name: string;
  startDate: string;
  endDate?: string;
  url?: string;
  description?: string;
  locationName?: string;
  locationAddress?: string;
  locationUrl?: string;
  organizerName?: string;
};

export const Event = (input: EventInput): SchemaNode => {
  const {
    locationName,
    locationAddress,
    locationUrl,
    organizerName,
    ...rest
  } = input;

  return withBase("Event", {
    ...rest,
    ...(locationName || locationAddress || locationUrl
      ? {
          location: {
            "@type": "Place",
            ...(locationName ? { name: locationName } : {}),
            ...(locationAddress ? { address: locationAddress } : {}),
            ...(locationUrl ? { url: locationUrl } : {})
          }
        }
      : {}),
    ...(organizerName
      ? {
          organizer: {
            "@type": "Organization",
            name: organizerName
          }
        }
      : {})
  });
};

export type ReviewInput = BaseInput & {
  itemName: string;
  authorName: string;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  reviewBody?: string;
  datePublished?: string;
  url?: string;
};

export const Review = (input: ReviewInput): SchemaNode => {
  const {
    itemName,
    authorName,
    ratingValue,
    bestRating,
    worstRating,
    ...rest
  } = input;

  return withBase("Review", {
    ...rest,
    itemReviewed: {
      "@type": "Thing",
      name: itemName
    },
    author: {
      "@type": "Person",
      name: authorName
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue,
      ...(bestRating !== undefined ? { bestRating } : {}),
      ...(worstRating !== undefined ? { worstRating } : {})
    }
  });
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQPageInput = BaseInput & {
  questions: FAQItem[];
};

export const FAQPage = (input: FAQPageInput): SchemaNode =>
  withBase("FAQPage", {
    mainEntity: input.questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  });

export type HowToStep = {
  name?: string;
  text: string;
};

export type HowToInput = BaseInput & {
  name: string;
  steps: HowToStep[];
};

export const HowTo = (input: HowToInput): SchemaNode =>
  withBase("HowTo", {
    name: input.name,
    step: input.steps.map((step) => ({
      "@type": "HowToStep",
      ...(step.name ? { name: step.name } : {}),
      text: step.text
    }))
  });

export type BreadcrumbItem = {
  name: string;
  url: string;
  useItemObject?: boolean;
};

export type BreadcrumbListInput = BaseInput & {
  items: BreadcrumbItem[];
};

export const BreadcrumbList = (input: BreadcrumbListInput): SchemaNode =>
  withBase("BreadcrumbList", {
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.useItemObject ? { "@id": item.url, name: item.name } : item.url
    }))
  });

export type Manifest = {
  routes: Record<string, SchemaTypeName[]>;
};

export type ValidationSeverity = "error" | "warn";

export type ValidationIssue = {
  path: string;
  message: string;
  severity: ValidationSeverity;
  ruleId: string;
};

export type ValidationResult = {
  ok: boolean;
  score: number;
  issues: ValidationIssue[];
};

export const validateSchema = (nodes: SchemaNode[]): ValidationResult => {
  const issues: ValidationIssue[] = [];

  if (!nodes.length) {
    issues.push({
      path: "root",
      message: "No schema blocks provided",
      severity: "error",
      ruleId: "schema.empty"
    });
  }

  nodes.forEach((node, index) => {
    const pathPrefix = `nodes[${index}]`;

    if (node["@context"] !== SCHEMA_CONTEXT) {
      issues.push({
        path: `${pathPrefix}.@context`,
        message: "Invalid or missing @context",
        severity: "error",
        ruleId: "schema.context"
      });
    }

    const type = node["@type"];
    if (!isSchemaType(type)) {
      issues.push({
        path: `${pathPrefix}.@type`,
        message: "Unknown or missing @type",
        severity: "error",
        ruleId: "schema.type"
      });
      return;
    }

    const requiredFields = REQUIRED_FIELDS[type] ?? [];
    for (const field of requiredFields) {
      if (field === "author") {
        if (!hasAuthor(node)) {
          issues.push({
            path: `${pathPrefix}.author`,
            message: "Missing required field 'author'",
            severity: "error",
            ruleId: "schema.required.author"
          });
        }
        continue;
      }

      if (field === "mainEntity") {
        const value = (node as JsonLdObject)[field];
        const ok = Array.isArray(value) && value.length > 0;
        if (!ok) {
          issues.push({
            path: `${pathPrefix}.mainEntity`,
            message: "FAQPage must include at least one Question",
            severity: "error",
            ruleId: "schema.required.mainEntity"
          });
        }
        continue;
      }

      if (field === "step") {
        const value = (node as JsonLdObject)[field];
        const ok = Array.isArray(value) && value.length > 0;
        if (!ok) {
          issues.push({
            path: `${pathPrefix}.step`,
            message: "HowTo must include at least one step",
            severity: "error",
            ruleId: "schema.required.step"
          });
        }
        continue;
      }

      if (field === "itemListElement") {
        const value = (node as JsonLdObject)[field];
        const ok = Array.isArray(value) && value.length > 0;
        if (!ok) {
          issues.push({
            path: `${pathPrefix}.itemListElement`,
            message: "BreadcrumbList must include at least one breadcrumb item",
            severity: "error",
            ruleId: "schema.required.itemListElement"
          });
        }
        continue;
      }

      const value = (node as JsonLdObject)[field];
      if (isEmpty(value)) {
        issues.push({
          path: `${pathPrefix}.${field}`,
          message: `Missing required field '${field}'`,
          severity: "error",
          ruleId: `schema.required.${field}`
        });
      }
    }

    if (type === "BreadcrumbList") {
      validateBreadcrumbList(node, pathPrefix, issues);
    }
  });

  const errorCount = issues.filter((issue) => issue.severity === "error")
    .length;
  const warnCount = issues.filter((issue) => issue.severity === "warn").length;
  const score = Math.max(0, 100 - errorCount * 10 - warnCount * 2);

  return {
    ok: errorCount === 0,
    score,
    issues
  };
};

const REQUIRED_FIELDS: Record<SchemaTypeName, string[]> = {
  Organization: ["name"],
  Person: ["name"],
  Place: ["name"],
  LocalBusiness: ["name"],
  WebSite: ["name", "url"],
  WebPage: ["name", "url"],
  Article: ["headline", "author", "datePublished", "url"],
  BlogPosting: ["headline", "author", "datePublished", "url"],
  Product: ["name", "description", "url"],
  Event: ["name", "startDate"],
  Review: ["itemReviewed", "reviewRating", "author"],
  FAQPage: ["mainEntity"],
  HowTo: ["name", "step"],
  BreadcrumbList: ["itemListElement"]
};

const isSchemaType = (value: unknown): value is SchemaTypeName =>
  typeof value === "string" && value in REQUIRED_FIELDS;

const isEmpty = (value: JsonLdValue | undefined): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
};

const hasAuthor = (node: SchemaNode): boolean => {
  const author = (node as JsonLdObject).author;
  if (!author) {
    return false;
  }

  if (typeof author === "string") {
    return author.trim().length > 0;
  }

  if (typeof author === "object") {
    const name = (author as JsonLdObject).name;
    return typeof name === "string" && name.trim().length > 0;
  }

  return false;
};

const validateBreadcrumbList = (
  node: SchemaNode,
  pathPrefix: string,
  issues: ValidationIssue[]
): void => {
  const itemListElement = (node as JsonLdObject).itemListElement;
  if (!Array.isArray(itemListElement)) {
    return;
  }

  itemListElement.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") {
      issues.push({
        path: `${pathPrefix}.itemListElement[${index}]`,
        message: "BreadcrumbList items must be objects",
        severity: "error",
        ruleId: "schema.breadcrumb.item"
      });
      return;
    }

    const listItem = entry as JsonLdObject;
    const position = listItem.position;
    if (typeof position !== "number" || !Number.isFinite(position) || position <= 0) {
      issues.push({
        path: `${pathPrefix}.itemListElement[${index}].position`,
        message: "ListItem.position must be a positive number",
        severity: "error",
        ruleId: "schema.breadcrumb.position"
      });
    }

    const item = listItem.item;
    if (typeof item === "string") {
      if (!isValidUrl(item)) {
        issues.push({
          path: `${pathPrefix}.itemListElement[${index}].item`,
          message: "ListItem.item must be a valid URL",
          severity: "error",
          ruleId: "schema.breadcrumb.item.url"
        });
      }
      return;
    }

    if (item && typeof item === "object") {
      const itemObject = item as JsonLdObject;
      const id = itemObject["@id"] ?? itemObject.url;
      if (typeof id !== "string" || !isValidUrl(id)) {
        issues.push({
          path: `${pathPrefix}.itemListElement[${index}].item`,
          message: "ListItem.item must include a valid @id or url",
          severity: "error",
          ruleId: "schema.breadcrumb.item.url"
        });
      }
      return;
    }

    issues.push({
      path: `${pathPrefix}.itemListElement[${index}].item`,
      message: "ListItem.item is required",
      severity: "error",
      ruleId: "schema.breadcrumb.item"
    });
  });
};

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const sortKeys = (value: JsonLdValue): JsonLdValue => {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  if (value && typeof value === "object") {
    const obj = value as JsonLdObject;
    const sorted: JsonLdObject = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys(obj[key]);
    }
    return sorted;
  }

  return value;
};

export const stableStringify = (value: JsonLdValue): string =>
  JSON.stringify(sortKeys(value));
