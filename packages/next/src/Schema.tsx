import * as React from "react";
import type { SchemaNode } from "@schemasentry/core";
import { stableStringify } from "@schemasentry/core";

type SchemaProps = {
  data: SchemaNode | SchemaNode[];
  id?: string;
  nonce?: string;
};

export const Schema = ({ data, id, nonce }: SchemaProps) => {
  const blocks = Array.isArray(data) ? data : [data];
  const payload = blocks.length === 1 ? blocks[0] : blocks;
  const json = stableStringify(payload);

  return (
    <script
      id={id}
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
};
