#!/usr/bin/env node
import { Command } from "commander";
import { readFile } from "fs/promises";
import path from "path";
import { stableStringify, type Manifest } from "@schemasentry/core";
import { buildReport, type SchemaDataFile } from "./report";

const program = new Command();

program
  .name("schemasentry")
  .description("Schema Sentry CLI")
  .version("0.1.0");

program
  .command("validate")
  .description("Validate schema coverage and rules")
  .option(
    "-m, --manifest <path>",
    "Path to manifest JSON",
    "schema-sentry.manifest.json"
  )
  .option(
    "-d, --data <path>",
    "Path to schema data JSON",
    "schema-sentry.data.json"
  )
  .action(async (options: { manifest: string; data: string }) => {
    const manifestPath = path.resolve(process.cwd(), options.manifest);
    const dataPath = path.resolve(process.cwd(), options.data);
    let raw: string;

    try {
      raw = await readFile(manifestPath, "utf8");
    } catch (error) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "manifest.not_found",
              message: `Manifest not found at ${manifestPath}`
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    let manifest: Manifest;
    try {
      manifest = JSON.parse(raw) as Manifest;
    } catch (error) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "manifest.invalid_json",
              message: "Manifest is not valid JSON"
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    if (!isManifest(manifest)) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "manifest.invalid_shape",
              message:
                "Manifest must contain a 'routes' object with string array values"
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    let dataRaw: string;
    try {
      dataRaw = await readFile(dataPath, "utf8");
    } catch (error) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "data.not_found",
              message: `Schema data not found at ${dataPath}`
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    let data: SchemaDataFile;
    try {
      data = JSON.parse(dataRaw) as SchemaDataFile;
    } catch (error) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "data.invalid_json",
              message: "Schema data is not valid JSON"
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    if (!isSchemaData(data)) {
      console.error(
        stableStringify({
          ok: false,
          errors: [
            {
              code: "data.invalid_shape",
              message:
                "Schema data must contain a 'routes' object with array values"
            }
          ]
        })
      );
      process.exit(1);
      return;
    }

    const report = buildReport(manifest, data);
    console.log(formatReportOutput(report));
    process.exit(report.ok ? 0 : 1);
  });

program.parse();

const isManifest = (value: unknown): value is Manifest => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const manifest = value as Manifest;
  if (!manifest.routes || typeof manifest.routes !== "object") {
    return false;
  }

  for (const entry of Object.values(manifest.routes)) {
    if (!Array.isArray(entry) || entry.some((item) => typeof item !== "string")) {
      return false;
    }
  }

  return true;
};

const isSchemaData = (value: unknown): value is SchemaDataFile => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as SchemaDataFile;
  if (!data.routes || typeof data.routes !== "object") {
    return false;
  }

  for (const entry of Object.values(data.routes)) {
    if (!Array.isArray(entry)) {
      return false;
    }
  }

  return true;
};

const formatReportOutput = (report: ReturnType<typeof buildReport>): string =>
  stableStringify(report);
