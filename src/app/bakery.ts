import { Bakery, BakeryStorage } from "@canonical/macaroon-bakery";

import { storeVisitURL } from "app/actions";
import reduxStore from "store/store";

const bakery = new Bakery({
  visitPage: (resp) => {
    reduxStore.dispatch(storeVisitURL(resp.Info.VisitURL));
  },
  storage: new BakeryStorage(localStorage, {}),
});

export default bakery;
