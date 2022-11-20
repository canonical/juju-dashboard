import { Bakery, BakeryStorage } from "@canonical/macaroon-bakery";

import { storeVisitURL } from "app/actions";
import reduxStore from "store/store";

// This type can be remove once bakeryjs has been migrated to typescript.
export type VisitPageInfo = {
  WaitURL: string;
  VisitURL: string;
};

const bakery = new Bakery({
  visitPage: (resp: { Info: VisitPageInfo }) => {
    reduxStore.dispatch(storeVisitURL(resp.Info.VisitURL));
  },
  storage: new BakeryStorage(localStorage, {}),
});

export default bakery;
