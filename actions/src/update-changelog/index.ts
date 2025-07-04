import { run } from "./main";

import { createCtx } from "@/lib";

void (async () => {
  const ctx = await createCtx({ pullRequestInput: "pr-number" });

  const cutPrNumber = Number(
    ctx.core.getInput("cut-pr-number", { required: true }),
  );
  if (isNaN(cutPrNumber)) {
    throw new Error("`cut-pr-number` must be provided.");
  }

  await run(ctx, { cutPrNumber });
})();
