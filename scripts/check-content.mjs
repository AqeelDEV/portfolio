// Release guard: fail the production build while lib/content.ts still holds
// unresolved {{FILL: ...}} placeholders — otherwise every visitor sees the
// amber TODO badges Todo.tsx renders for them. Override for a deliberate
// work-in-progress deploy with ALLOW_TODO_CONTENT=1.
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../lib/content.ts", import.meta.url), "utf8");
const count = (src.match(/\{\{FILL:/g) ?? []).length;

if (count > 0 && process.env.ALLOW_TODO_CONTENT !== "1") {
  console.error(
    `\n✖ lib/content.ts still contains ${count} unresolved {{FILL: ...}} placeholder(s).\n` +
      "  These render as visible amber TODO badges to real visitors.\n" +
      "  Fill them in, or deploy anyway with ALLOW_TODO_CONTENT=1.\n"
  );
  process.exit(1);
}
