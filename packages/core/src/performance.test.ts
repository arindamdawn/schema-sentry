import { describe, expect, it } from "vitest";
import { Article, Organization, validateSchema } from "./index";

const ROUTE_COUNT = 200;
const MAX_DURATION_MS = 5000;

describe("performance", () => {
  it(`validates ${ROUTE_COUNT} routes in under ${MAX_DURATION_MS / 1000}s`, () => {
    const routes: Array<{ path: string; schemas: ReturnType<typeof Organization>[] }> = [];

    for (let i = 0; i < ROUTE_COUNT; i++) {
      routes.push({
        path: `/org-${i}`,
        schemas: [
          Organization({
            name: `Organization ${i}`,
            url: `https://example${i}.com`,
            description: `Organization description ${i}`,
            logo: `https://example${i}.com/logo.png`,
            sameAs: [
              `https://twitter.com/example${i}`,
              `https://github.com/example${i}`
            ]
          })
        ]
      });
    }

    const start = performance.now();

    for (const route of routes) {
      const result = validateSchema(route.schemas, { recommended: true });
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    }

    const duration = performance.now() - start;

    expect(duration).toBeLessThan(MAX_DURATION_MS);
  });

  it("handles large batch validation efficiently", () => {
    const schemas = Array.from({ length: ROUTE_COUNT }, (_, i) =>
      Organization({
        name: `Organization ${i}`,
        url: `https://example${i}.com`,
        description: `Description for org ${i}`,
        logo: `https://example${i}.com/logo.png`,
        sameAs: [`https://twitter.com/example${i}`]
      })
    );

    const start = performance.now();
    const result = validateSchema(schemas, { recommended: true });
    const duration = performance.now() - start;

    expect(result.ok).toBe(true);
    expect(duration).toBeLessThan(MAX_DURATION_MS / 2);
  });
});
