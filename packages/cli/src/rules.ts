import type { SchemaNode, SchemaTypeName, ValidationIssue, JsonLdObject } from "@schemasentry/core";

export type RulesetName = "google" | "ai-citation";

export type RulesetResult = {
  ok: boolean;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
  };
};

type Rule = {
  id: string;
  check: (node: SchemaNode, pathPrefix: string) => ValidationIssue[];
};

const GOOGLE_RICH_RESULT_RULES: Record<SchemaTypeName, Rule[]> = {
  Organization: [
    {
      id: "google.organization.logo",
      check: (node) => {
        const logo = (node as JsonLdObject).logo;
        return logo
          ? []
          : [{
              path: "logo",
              message: "Organization logo recommended for Google Knowledge Graph",
              severity: "warn" as const,
              ruleId: "google.organization.logo"
            }];
      }
    },
    {
      id: "google.organization.sameas",
      check: (node) => {
        const sameAs = (node as JsonLdObject).sameAs;
        const hasSameAs = Array.isArray(sameAs) && sameAs.length > 0;
        return hasSameAs
          ? []
          : [{
              path: "sameAs",
              message: "sameAs links recommended for Google Knowledge Graph verification",
              severity: "warn" as const,
              ruleId: "google.organization.sameas"
            }];
      }
    }
  ],
  LocalBusiness: [
    {
      id: "google.localbusiness.telephone",
      check: (node) => {
        const telephone = (node as JsonLdObject).telephone;
        return telephone
          ? []
          : [{
              path: "telephone",
              message: "telephone required for LocalBusiness rich results",
              severity: "error" as const,
              ruleId: "google.localbusiness.telephone"
            }];
      }
    },
    {
      id: "google.localbusiness.address",
      check: (node) => {
        const address = (node as JsonLdObject).address;
        return address
          ? []
          : [{
              path: "address",
              message: "address required for LocalBusiness rich results",
              severity: "error" as const,
              ruleId: "google.localbusiness.address"
            }];
      }
    },
    {
      id: "google.localbusiness.openinghours",
      check: (node) => {
        const openingHours = (node as JsonLdObject).openingHours;
        return openingHours
          ? []
          : [{
              path: "openingHours",
              message: "openingHours recommended for LocalBusiness rich results",
              severity: "warn" as const,
              ruleId: "google.localbusiness.openinghours"
            }];
      }
    }
  ],
  Product: [
    {
      id: "google.product.price",
      check: (node) => {
        const offers = (node as JsonLdObject).offers;
        if (!offers) {
          return [{
            path: "offers",
            message: "offers required for Product rich results",
            severity: "error" as const,
            ruleId: "google.product.offers"
          }];
        }
        const offersArray = Array.isArray(offers) ? offers : [offers];
        const hasPrice = offersArray.some((o) => o && typeof o === "object" && "price" in o);
        return hasPrice
          ? []
          : [{
              path: "offers.price",
              message: "price in offers required for Product rich results",
              severity: "error" as const,
              ruleId: "google.product.price"
            }];
      }
    },
    {
      id: "google.product.availability",
      check: (node) => {
        const offers = (node as JsonLdObject).offers;
        if (!offers) {
          return [];
        }
        const offersArray = Array.isArray(offers) ? offers : [offers];
        const hasAvailability = offersArray.some((o) => o && typeof o === "object" && "availability" in o);
        return hasAvailability
          ? []
          : [{
              path: "offers.availability",
              message: "availability recommended for Product rich results",
              severity: "warn" as const,
              ruleId: "google.product.availability"
            }];
      }
    },
    {
      id: "google.product.image",
      check: (node) => {
        const image = (node as JsonLdObject).image;
        return image
          ? []
          : [{
              path: "image",
              message: "image required for Product rich results",
              severity: "error" as const,
              ruleId: "google.product.image"
            }];
      }
    }
  ],
  Article: [
    {
      id: "google.article.image",
      check: (node) => {
        const image = (node as JsonLdObject).image;
        return image
          ? []
          : [{
              path: "image",
              message: "image required for Article rich results",
              severity: "error" as const,
              ruleId: "google.article.image"
            }];
      }
    },
    {
      id: "google.article.headline",
      check: (node) => {
        const headline = (node as JsonLdObject).headline;
        const len = typeof headline === "string" ? headline.length : 0;
        if (len === 0) {
          return [];
        }
        if (len < 10 || len > 110) {
          return [{
            path: "headline",
            message: `headline length (${len}) should be between 10-110 characters for optimal display`,
            severity: "warn" as const,
            ruleId: "google.article.headline"
          }];
        }
        return [];
      }
    },
    {
      id: "google.article.datepublished",
      check: (node) => {
        const datePublished = (node as JsonLdObject).datePublished;
        return datePublished
          ? []
          : [{
              path: "datePublished",
              message: "datePublished required for Article rich results",
              severity: "error" as const,
              ruleId: "google.article.datepublished"
            }];
      }
    }
  ],
  BlogPosting: [
    {
      id: "google.blogposting.image",
      check: (node) => {
        const image = (node as JsonLdObject).image;
        return image
          ? []
          : [{
              path: "image",
              message: "image required for BlogPosting rich results",
              severity: "error" as const,
              ruleId: "google.blogposting.image"
            }];
      }
    },
    {
      id: "google.blogposting.datepublished",
      check: (node) => {
        const datePublished = (node as JsonLdObject).datePublished;
        return datePublished
          ? []
          : [{
              path: "datePublished",
              message: "datePublished required for BlogPosting rich results",
              severity: "error" as const,
              ruleId: "google.blogposting.datepublished"
            }];
      }
    }
  ],
  VideoObject: [
    {
      id: "google.videoobject.thumbnailurl",
      check: (node) => {
        const thumbnailUrl = (node as JsonLdObject).thumbnailUrl;
        return thumbnailUrl
          ? []
          : [{
              path: "thumbnailUrl",
              message: "thumbnailUrl required for VideoObject rich results",
              severity: "error" as const,
              ruleId: "google.videoobject.thumbnailurl"
            }];
      }
    },
    {
      id: "google.videoobject.uploaddate",
      check: (node) => {
        const uploadDate = (node as JsonLdObject).uploadDate;
        return uploadDate
          ? []
          : [{
              path: "uploadDate",
              message: "uploadDate required for VideoObject rich results",
              severity: "error" as const,
              ruleId: "google.videoobject.uploaddate"
            }];
      }
    },
    {
      id: "google.videoobject.duration",
      check: (node) => {
        const duration = (node as JsonLdObject).duration;
        return duration
          ? []
          : [{
              path: "duration",
              message: "duration (ISO 8601 format) recommended for VideoObject rich results",
              severity: "warn" as const,
              ruleId: "google.videoobject.duration"
            }];
      }
    }
  ],
  Event: [
    {
      id: "google.event.startdate",
      check: (node) => {
        const startDate = (node as JsonLdObject).startDate;
        return startDate
          ? []
          : [{
              path: "startDate",
              message: "startDate required for Event rich results",
              severity: "error" as const,
              ruleId: "google.event.startdate"
            }];
      }
    },
    {
      id: "google.event.location",
      check: (node) => {
        const location = (node as JsonLdObject).location;
        return location
          ? []
          : [{
              path: "location",
              message: "location required for Event rich results",
              severity: "error" as const,
              ruleId: "google.event.location"
            }];
      }
    }
  ],
  FAQPage: [
    {
      id: "google.faq.mainentity",
      check: (node) => {
        const mainEntity = (node as JsonLdObject).mainEntity;
        if (!mainEntity || !Array.isArray(mainEntity) || mainEntity.length === 0) {
          return [];
        }
        const validQuestions = mainEntity.every(
          (q) => q && typeof q === "object" && "name" in q && "acceptedAnswer" in q
        );
        return validQuestions
          ? []
          : [{
              path: "mainEntity",
              message: "Each FAQ question should have name and acceptedAnswer for rich results",
              severity: "warn" as const,
              ruleId: "google.faq.mainentity"
            }];
      }
    }
  ],
  HowTo: [
    {
      id: "google.howto.supplies",
      check: (node) => {
        const supplies = (node as JsonLdObject).supplies;
        const tools = (node as JsonLdObject).tools;
        if (!supplies && !tools) {
          return [{
            path: "supplies",
            message: "supplies or tools recommended for HowTo rich results",
            severity: "warn" as const,
            ruleId: "google.howto.supplies"
          }];
        }
        return [];
      }
    }
  ],
  Review: [
    {
      id: "google.review.rating",
      check: (node) => {
        const reviewRating = (node as JsonLdObject).reviewRating;
        if (!reviewRating) {
          return [{
            path: "reviewRating",
            message: "reviewRating required for Review rich results",
            severity: "error" as const,
            ruleId: "google.review.rating"
          }];
        }
        const hasRatingValue = reviewRating && typeof reviewRating === "object" && "ratingValue" in reviewRating;
        return hasRatingValue
          ? []
          : [{
              path: "reviewRating.ratingValue",
              message: "ratingValue required in reviewRating for rich results",
              severity: "error" as const,
              ruleId: "google.review.ratingvalue"
            }];
      }
    }
  ],
  WebSite: [],
  WebPage: [],
  Person: [],
  Place: [],
  ImageObject: [],
  BreadcrumbList: []
};

const AI_CITATION_RULES: Record<SchemaTypeName, Rule[]> = {
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

const RULESETS: Record<RulesetName, Record<SchemaTypeName, Rule[]>> = {
  "google": GOOGLE_RICH_RESULT_RULES,
  "ai-citation": AI_CITATION_RULES
};

export const runRuleset = (
  rulesetName: RulesetName,
  nodes: SchemaNode[]
): RulesetResult => {
  const rulesByType = RULESETS[rulesetName];
  if (!rulesByType) {
    return {
      ok: true,
      issues: [],
      summary: { errors: 0, warnings: 0 }
    };
  }

  const allIssues: ValidationIssue[] = [];

  nodes.forEach((node, index) => {
    const type = node["@type"];
    if (!type || typeof type !== "string") {
      return;
    }

    const rules = rulesByType[type as SchemaTypeName] ?? [];
    const pathPrefix = `nodes[${index}]`;

    for (const rule of rules) {
      const issues = rule.check(node, pathPrefix);
      allIssues.push(...issues);
    }
  });

  const errorCount = allIssues.filter((i) => i.severity === "error").length;
  const warnCount = allIssues.filter((i) => i.severity === "warn").length;

  return {
    ok: errorCount === 0,
    issues: allIssues,
    summary: {
      errors: errorCount,
      warnings: warnCount
    }
  };
};

export const runMultipleRulesets = (
  rulesetNames: RulesetName[],
  nodes: SchemaNode[]
): RulesetResult => {
  const results = rulesetNames.map((name) => runRuleset(name, nodes));

  const allIssues = results.flatMap((r) => r.issues);
  const totalErrors = results.reduce((sum, r) => sum + r.summary.errors, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.summary.warnings, 0);

  return {
    ok: totalErrors === 0,
    issues: allIssues,
    summary: {
      errors: totalErrors,
      warnings: totalWarnings
    }
  };
};

export const parseRulesetNames = (input: string): RulesetName[] => {
  const parts = input.split(",").map((p) => p.trim().toLowerCase());
  const validNames: RulesetName[] = ["google", "ai-citation"];

  return parts
    .filter((p) => validNames.includes(p as RulesetName))
    .map((p) => p as RulesetName);
};
