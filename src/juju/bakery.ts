import { Bakery, BakeryStorage } from "@canonical/macaroon-bakery";

import { actions as generalActions } from "store/general";
import reduxStore from "store/store";

const bakery = new Bakery({
  visitPage: (resp) => {
    reduxStore.dispatch(generalActions.storeVisitURL(resp.Info.VisitURL));
  },
  storage: new BakeryStorage(localStorage, {}),
});

export default bakery;
