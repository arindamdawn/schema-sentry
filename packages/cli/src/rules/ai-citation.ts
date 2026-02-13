import type { SchemaNode, SchemaTypeName, ValidationIssue, JsonLdObject } from "@schemasentry/core";

type Rule = {
  id: string;
  check: (node: SchemaNode, pathPrefix: string) => ValidationIssue[];
};

export type RulesetRules = Record<SchemaTypeName, Rule[]>;

export const AI_CITATION_RULES: RulesetRules = {
  Article: [
    {
      id: "ai.article.author",
      check: (node) => {
        const author = (node as JsonLdObject).author;
        if (!author) {
          return [{
            path: "author",
            message: "author required for AI citation and attribution",
            severity: "error" as const,
            ruleId: "ai.article.author"
          }];
        }
        const hasAuthorName = author && typeof author === "object" && "name" in author;
        return hasAuthorName
          ? []
          : [{
              path: "author.name",
              message: "author.name required for AI citation",
              severity: "error" as const,
              ruleId: "ai.article.author.name"
            }];
      }
    },
    {
      id: "ai.article.datepublished",
      check: (node) => {
        const datePublished = (node as JsonLdObject).datePublished;
        return datePublished
          ? []
          : [{
              path: "datePublished",
              message: "datePublished required for AI to understand content freshness",
              severity: "error" as const,
              ruleId: "ai.article.datepublished"
            }];
      }
    },
    {
      id: "ai.article.description",
      check: (node) => {
        const description = (node as JsonLdObject).description;
        return description
          ? []
          : [{
              path: "description",
              message: "description recommended for better AI context understanding",
              severity: "warn" as const,
              ruleId: "ai.article.description"
            }];
      }
    }
  ],
  BlogPosting: [
    {
      id: "ai.blogposting.author",
      check: (node) => {
        const author = (node as JsonLdObject).author;
        if (!author) {
          return [{
            path: "author",
            message: "author required for AI citation and attribution",
            severity: "error" as const,
            ruleId: "ai.blogposting.author"
          }];
        }
        const hasAuthorName = author && typeof author === "object" && "name" in author;
        return hasAuthorName
          ? []
          : [{
              path: "author.name",
              message: "author.name required for AI citation",
              severity: "error" as const,
              ruleId: "ai.blogposting.author.name"
            }];
      }
    },
    {
      id: "ai.blogposting.datepublished",
      check: (node) => {
        const datePublished = (node as JsonLdObject).datePublished;
        return datePublished
          ? []
          : [{
              path: "datePublished",
              message: "datePublished required for AI to understand content freshness",
              severity: "error" as const,
              ruleId: "ai.blogposting.datepublished"
            }];
      }
    },
    {
      id: "ai.blogposting.description",
      check: (node) => {
        const description = (node as JsonLdObject).description;
        return description
          ? []
          : [{
              path: "description",
              message: "description recommended for better AI context understanding",
              severity: "warn" as const,
              ruleId: "ai.blogposting.description"
            }];
      }
    }
  ],
  Organization: [
    {
      id: "ai.organization.description",
      check: (node) => {
        const description = (node as JsonLdObject).description;
        return description
          ? []
          : [{
              path: "description",
              message: "description recommended for AI to understand organization",
              severity: "warn" as const,
              ruleId: "ai.organization.description"
            }];
      }
    },
    {
      id: "ai.organization.url",
      check: (node) => {
        const url = (node as JsonLdObject).url;
        return url
          ? []
          : [{
              path: "url",
              message: "url required for AI to link to organization",
              severity: "error" as const,
              ruleId: "ai.organization.url"
            }];
      }
    }
  ],
  Product: [
    {
      id: "ai.product.description",
      check: (node) => {
        const description = (node as JsonLdObject).description;
        return description
          ? []
          : [{
              path: "description",
              message: "description required for AI to understand product",
              severity: "error" as const,
              ruleId: "ai.product.description"
            }];
      }
    },
    {
      id: "ai.product.offers",
      check: (node) => {
        const offers = (node as JsonLdObject).offers;
        return offers
          ? []
          : [{
              path: "offers",
              message: "offers recommended for AI to understand pricing and availability",
              severity: "warn" as const,
              ruleId: "ai.product.offers"
            }];
      }
    }
  ],
  FAQPage: [
    {
      id: "ai.faq.mainentity",
      check: (node) => {
        const mainEntity = (node as JsonLdObject).mainEntity;
        if (!mainEntity || !Array.isArray(mainEntity)) {
          return [{
            path: "mainEntity",
            message: "mainEntity required for AI to extract Q&A content",
            severity: "error" as const,
            ruleId: "ai.faq.mainentity"
          }];
        }
        const hasValidQA = mainEntity.every(
          (q) => q && typeof q === "object" && "name" in q && "acceptedAnswer" in q
        );
        return hasValidQA
          ? []
          : [{
              path: "mainEntity",
              message: "Each FAQ should have question (name) and answer (acceptedAnswer)",
              severity: "warn" as const,
              ruleId: "ai.faq.qaformat"
            }];
      }
    }
  ],
  HowTo: [
    {
      id: "ai.howto.step",
      check: (node) => {
        const step = (node as JsonLdObject).step;
        if (!step || !Array.isArray(step) || step.length === 0) {
          return [{
            path: "step",
            message: "step required for AI to extract procedural content",
            severity: "error" as const,
            ruleId: "ai.howto.step"
          }];
        }
        const hasValidSteps = step.every(
          (s) => s && typeof s === "object" && "text" in s
        );
        return hasValidSteps
          ? []
          : [{
              path: "step",
              message: "Each step should have 'text' for AI extraction",
              severity: "warn" as const,
              ruleId: "ai.howto.steptxt"
            }];
      }
    }
  ],
  VideoObject: [
    {
      id: "ai.video.description",
      check: (node) => {
        const description = (node as JsonLdObject).description;
        return description
          ? []
          : [{
              path: "description",
              message: "description required for AI to understand video content",
              severity: "error" as const,
              ruleId: "ai.video.description"
            }];
      }
    },
    {
      id: "ai.video.uploaddate",
      check: (node) => {
        const uploadDate = (node as JsonLdObject).uploadDate;
        return uploadDate
          ? []
          : [{
              path: "uploadDate",
              message: "uploadDate recommended for AI to understand video recency",
              severity: "warn" as const,
              ruleId: "ai.video.uploaddate"
            }];
      }
    }
  ],
  Event: [
    {
      id: "ai.event.startdate",
      check: (node) => {
        const startDate = (node as JsonLdObject).startDate;
        return startDate
          ? []
          : [{
              path: "startDate",
              message: "startDate required for AI to understand event timing",
              severity: "error" as const,
              ruleId: "ai.event.startdate"
            }];
      }
    },
    {
      id: "ai.event.location",
      check: (node) => {
        const location = (node as JsonLdObject).location;
        return location
          ? []
          : [{
              path: "location",
              message: "location required for AI to understand event venue",
              severity: "error" as const,
              ruleId: "ai.event.location"
            }];
      }
    }
  ],
  LocalBusiness: [
    {
      id: "ai.localbusiness.geo",
      check: (node) => {
        const geo = (node as JsonLdObject).geo;
        return geo
          ? []
          : [{
              path: "geo",
              message: "geo (latitude/longitude) recommended for AI location features",
              severity: "warn" as const,
              ruleId: "ai.localbusiness.geo"
            }];
      }
    },
    {
      id: "ai.localbusiness.openinghours",
      check: (node) => {
        const openingHours = (node as JsonLdObject).openingHours;
        return openingHours
          ? []
          : [{
              path: "openingHours",
              message: "openingHours recommended for AI to provide business hours",
              severity: "warn" as const,
              ruleId: "ai.localbusiness.openinghours"
            }];
      }
    }
  ],
  WebSite: [
    {
      id: "ai.website.url",
      check: (node) => {
        const url = (node as JsonLdObject).url;
        return url
          ? []
          : [{
              path: "url",
              message: "url required for AI to identify the website",
              severity: "error" as const,
              ruleId: "ai.website.url"
            }];
      }
    }
  ],
  WebPage: [
    {
      id: "ai.webpage.datepublished",
      check: (node) => {
        const datePublished = (node as JsonLdObject).datePublished;
        return datePublished
          ? []
          : [{
              path: "datePublished",
              message: "datePublished recommended for AI to understand page freshness",
              severity: "warn" as const,
              ruleId: "ai.webpage.datepublished"
            }];
      }
    }
  ],
  Person: [
    {
      id: "ai.person.url",
      check: (node) => {
        const url = (node as JsonLdObject).url;
        return url
          ? []
          : [{
              path: "url",
              message: "url recommended for AI to link to person profile",
              severity: "warn" as const,
              ruleId: "ai.person.url"
            }];
      }
    }
  ],
  Place: [],
  ImageObject: [],
  Review: [],
  BreadcrumbList: []
};
