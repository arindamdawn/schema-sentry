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
  | "WebSite"
  | "WebPage"
  | "Article"
  | "BlogPosting"
  | "Product"
  | "FAQPage"
  | "HowTo";

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
  if (!nodes.length) {
    return {
      ok: false,
      score: 0,
      issues: [
        {
          path: "root",
          message: "No schema blocks provided",
          severity: "error",
          ruleId: "schema.empty"
        }
      ]
    };
  }

  return {
    ok: true,
    score: 100,
    issues: []
  };
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
