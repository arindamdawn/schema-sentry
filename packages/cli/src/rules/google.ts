import type { SchemaNode, SchemaTypeName, ValidationIssue, JsonLdObject } from "@schemasentry/core";

type Rule = {
  id: string;
  check: (node: SchemaNode, pathPrefix: string) => ValidationIssue[];
};

export type RulesetRules = Record<SchemaTypeName, Rule[]>;

export const GOOGLE_RULES: RulesetRules = {
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
