import { DestroyBlockedReason } from "store/juju/types";
import { applicationOfferStatusFactory } from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import { modelDataFactory } from "testing/factories/juju/juju";

import { getDestroyBlockedReason } from "./utils";

describe("getDestroyBlockedReason", () => {
  it("returns IS_CONTROLLER when the model is a controller model", () => {
    const data = modelDataFactory.build({
      info: modelInfoFactory.build({ "is-controller": true }),
    });
    expect(getDestroyBlockedReason(data, true)).toBe(
      DestroyBlockedReason.IS_CONTROLLER,
    );
  });

  it("returns NO_ACCESS when canConfigure is false", () => {
    const data = modelDataFactory.build({
      info: modelInfoFactory.build({ "is-controller": false }),
    });
    expect(getDestroyBlockedReason(data, false)).toBe(
      DestroyBlockedReason.NO_ACCESS,
    );
  });

  it("returns NO_ACCESS when canConfigure is undefined", () => {
    const data = modelDataFactory.build({
      info: modelInfoFactory.build({ "is-controller": false }),
    });
    expect(getDestroyBlockedReason(data)).toBe(DestroyBlockedReason.NO_ACCESS);
  });

  it("returns CONNECTED_OFFERS when model has cross model relations", () => {
    const data = modelDataFactory.build({
      info: modelInfoFactory.build({ "is-controller": false }),
      offers: {
        db: applicationOfferStatusFactory.build({ "total-connected-count": 1 }),
      },
    });
    expect(getDestroyBlockedReason(data, true)).toBe(
      DestroyBlockedReason.CONNECTED_OFFERS,
    );
  });

  it("returns null when no blocking conditions are met", () => {
    const data = modelDataFactory.build({
      info: modelInfoFactory.build({ "is-controller": false }),
      offers: {
        db: applicationOfferStatusFactory.build({ "total-connected-count": 0 }),
      },
    });
    expect(getDestroyBlockedReason(data, true)).toBeNull();
  });
});
