import { Bakery, BakeryStorage } from "@canonical/macaroon-bakery";

import { actions as generalActions } from "store/general";

const bakery = new Bakery({
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  visitPage: async (resp): Promise<void> => {
    // Dynamically import store to prevent circular imports.
    const { default: reduxStore } = await import("store/store");
    reduxStore.dispatch(generalActions.storeVisitURL(resp.Info.VisitURL));
    reduxStore.dispatch(generalActions.updateLoginLoading(false));
  },
  storage: new BakeryStorage(localStorage, {}),
});

export default bakery;
