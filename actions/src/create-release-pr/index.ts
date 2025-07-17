import { run } from "./main";

import { createCtx } from "@/lib";

void (async () => {
  const ctx = await createCtx();

  const output = await run(ctx);

  ctx.core.setOutput("release-pr-number", output.releasePrNumber);
  ctx.core.setOutput("release-pr-head", output.releasePrHead);
  ctx.core.setOutput("release-version", output.releaseVersion);
})();
