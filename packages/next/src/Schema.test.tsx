import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Schema } from "./Schema";
import { Organization, SCHEMA_CONTEXT, stableStringify } from "@schemasentry/core";

describe("Schema", () => {
  it("renders a JSON-LD script tag", () => {
    const org = Organization({ name: "Acme" });
    const html = renderToStaticMarkup(<Schema data={org} />);

    expect(html).toContain("type=\"application/ld+json\"");
    expect(html).toContain(stableStringify(org));
  });

  it("renders multiple schema blocks as an array", () => {
    const org = Organization({ name: "Acme" });
    const org2 = {
      "@context": SCHEMA_CONTEXT,
      "@type": "Organization",
      name: "Beta"
    } as const;

    const html = renderToStaticMarkup(<Schema data={[org, org2]} />);
    const expected = stableStringify([org, org2]);

    expect(html).toContain(expected);
  });
});
