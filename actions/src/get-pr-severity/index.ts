import { run } from "./main";

import { createCtx } from "@/lib";

void (async () => {
  const ctx = await createCtx({ pullRequestInput: "pr-number" });

  const output = await run(ctx);

  ctx.core.setOutput("severity", output.severity);
})();
