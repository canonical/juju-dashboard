import jujulib from "@canonical/jujulib";
import modelManager from "@canonical/jujulib/api/facades/model-manager-v5";
import { Bakery } from "@canonical/macaroon-bakery";

const options = {
  debug: true,
  facades: [modelManager],
  bakery: new Bakery({
    visitPage: resp => {
      // XXX Surface message to UI.
      console.log("visit this URL to login:", resp.Info.VisitURL); // eslint-disable-line no-console
    }
  })
};

const controllerURL = process.env.REACT_APP_CONTROLLER_URL;

async function loginWithBakery() {
  try {
    const juju = await jujulib.connect(controllerURL, options);
    const conn = await juju.login({});
    const modelManagerFacades = conn.facades.modelManager;
    const models = await modelManagerFacades.listModels({ tag: conn.info.identity });
    console.log("models", models); // eslint-disable-line no-console
  } catch (error) {
    // XXX Surface error to UI.
    console.log("unable to connect:", error); // eslint-disable-line no-console
  }
}

export default loginWithBakery;
