import { createCtx } from "@/lib";

import { run } from "./main";

void (async (): Promise<void> => {
  const ctx = await createCtx();

  const output = await run(ctx);

  ctx.core.setOutput("cut-pr-number", output.cutPrNumber);
  ctx.core.setOutput("cut-branch", output.cutBranch);
})();
