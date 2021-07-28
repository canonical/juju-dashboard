import { AllWatcherDelta, ModelWatcherData } from "./types";

export function processDeltas(
  state: ModelWatcherData,
  deltas: AllWatcherDelta[]
) {
  if (!deltas) {
    return;
  }
  // console.log(deltas);
  deltas.forEach((delta) => {
    const modelUUID = delta[2]["model-uuid"];
    switch (delta[0]) {
      case "unit":
        switch (delta[1]) {
          case "change":
            // Handle unit change delta
            console.log(modelUUID); // temp quiet the linter for modelUUID :)
            break;
        }
        break;
    }
  });
}
