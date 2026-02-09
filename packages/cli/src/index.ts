#!/usr/bin/env node
import { Command } from "commander";
import { readFile } from "fs/promises";
import path from "path";
import type { Manifest } from "@schemasentry/core";

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
  .action(async (options: { manifest: string }) => {
    const manifestPath = path.resolve(process.cwd(), options.manifest);
    let raw: string;

    try {
      raw = await readFile(manifestPath, "utf8");
    } catch (error) {
      console.error(
        JSON.stringify(
          {
            ok: false,
            errors: [
              {
                code: "manifest.not_found",
                message: `Manifest not found at ${manifestPath}`
              }
            ]
          },
          null,
          2
        )
      );
      process.exit(1);
      return;
    }

    let manifest: Manifest;
    try {
      manifest = JSON.parse(raw) as Manifest;
    } catch (error) {
      console.error(
        JSON.stringify(
          {
            ok: false,
            errors: [
              {
                code: "manifest.invalid_json",
                message: "Manifest is not valid JSON"
              }
            ]
          },
          null,
          2
        )
      );
      process.exit(1);
      return;
    }

    if (!manifest.routes || typeof manifest.routes !== "object") {
      console.error(
        JSON.stringify(
          {
            ok: false,
            errors: [
              {
                code: "manifest.invalid_shape",
                message: "Manifest must contain a 'routes' object"
              }
            ]
          },
          null,
          2
        )
      );
      process.exit(1);
      return;
    }

    const routeCount = Object.keys(manifest.routes).length;

    console.log(
      JSON.stringify(
        {
          ok: true,
          routes: routeCount,
          warnings: [
            {
              code: "validation.stub",
              message:
                "Validation rules are not implemented yet. This is a scaffolded CLI output."
            }
          ]
        },
        null,
        2
      )
    );
  });

program.parse();
