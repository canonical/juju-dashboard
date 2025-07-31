import { run } from "./main";

import { createCtx } from "@/lib";

void (async () => {
  const ctx = await createCtx();

  const output = await run(ctx);

  ctx.core.setOutput("changelog", output.changelog);
})();
