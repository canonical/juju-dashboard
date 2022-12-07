const { autoBind } = require("@canonical/jujulib/dist/api/utils.js");

/**
  pinger describes a resource that can be pinged and stopped.
*/
class JIMMV2 {
  constructor(transport, info) {
    this._transport = transport;
    this._info = info;
    this.version = 2;

    // Automatically bind all methods to instances.
    autoBind(this);
  }

  disableControllerUUIDMasking() {
    return new Promise((resolve, reject) => {
      const params = {};
      const req = {
        type: "JIMM",
        request: "DisableControllerUUIDMasking",
        version: 2,
        params: params,
      };
      this._transport.write(req, resolve, reject);
    });
  }

  listControllers() {
    return new Promise((resolve, reject) => {
      const params = {};
      const req = {
        type: "JIMM",
        request: "ListControllers",
        version: 2,
        params: params,
      };
      this._transport.write(req, resolve, reject);
    });
  }
}

JIMMV2.NAME = "JIMM";
JIMMV2.VERSION = 2;
export default JIMMV2;
