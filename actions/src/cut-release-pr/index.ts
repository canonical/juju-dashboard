import { run } from "./main";

import { createCtx } from "@/lib";
import { isSeverity } from "@/lib/versioning/severity";

void (async () => {
  const ctx = await createCtx();

  const severity = ctx.core.getInput("severity");
  if (!isSeverity(severity)) {
    throw new Error(
      `unknown severity, expected 'minor' or 'major': ${severity}`,
    );
  }

  const output = await run(ctx, { severity });

  ctx.core.setOutput("cut-pr-number", output.cutPrNumber);
  ctx.core.setOutput("cut-branch", output.cutBranch);
})();
