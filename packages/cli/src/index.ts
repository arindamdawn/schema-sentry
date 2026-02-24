#!/usr/bin/env node
import { Command } from "commander";
import { validateCommand } from "./commands/validate.js";
import { initCommand } from "./commands/init.js";
import { auditCommand } from "./commands/audit.js";
import { collectCommand } from "./commands/collect.js";
import { scaffoldCommand } from "./commands/scaffold.js";
import { botCommand } from "./commands/bot.js";
import { testCommand } from "./commands/test.js";
import { suggestCommand } from "./commands/suggest.js";
import { devCommand } from "./commands/dev.js";
import { tuiCommand } from "./commands/tui.js";
import { resolveCliVersion } from "./commands/utils.js";

export { performRealityCheck } from "./reality.js";
export { scanSourceFiles } from "./source.js";
export { collectSchemaData } from "./collect.js";
export { buildAuditReport } from "./audit.js";
export { scaffoldSchema, generateComponentCode, formatScaffoldPreview } from "./scaffold.js";

const program = new Command();

program
  .name("schemasentry")
  .description("Schema Sentry CLI - Type-safe JSON-LD structured data for Next.js")
  .version(resolveCliVersion());

// Register all commands
program.addCommand(initCommand);
program.addCommand(validateCommand);
program.addCommand(auditCommand);
program.addCommand(collectCommand);
program.addCommand(scaffoldCommand);
program.addCommand(botCommand);
program.addCommand(testCommand);
program.addCommand(suggestCommand);
program.addCommand(devCommand);
program.addCommand(tuiCommand);

program.parse();
