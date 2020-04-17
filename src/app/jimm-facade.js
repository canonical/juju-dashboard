const {
  autoBind,
  createAsyncHandler,
} = require("@canonical/jujulib/api/transform.js");

/**
  pinger describes a resource that can be pinged and stopped.
*/
class JIMMV1 {
  constructor(transport, info) {
    this._transport = transport;
    this._info = info;
    this.version = 2;

    // Automatically bind all methods to instances.
    autoBind(this);
  }

  disableControllerUUIDMasking(callback) {
    return new Promise((resolve, reject) => {
      const params = {};
      const req = {
        type: "JIMM",
        request: "DisableControllerUUIDMasking",
        version: 2,
        params: params,
      };
      // Define a transform method if necessary.
      let transform = null;

      const handler = createAsyncHandler(callback, resolve, reject, transform);
      // Send the request to the server.
      this._transport.write(req, handler);
    });
  }

  listControllers(callback) {
    return new Promise((resolve, reject) => {
      const params = {};
      const req = {
        type: "JIMM",
        request: "ListControllers",
        version: 2,
        params: params,
      };
      // Define a transform method if necessary.
      let transform = null;

      const handler = createAsyncHandler(callback, resolve, reject, transform);
      // Send the request to the server.
      this._transport.write(req, handler);
    });
  }
}

module.exports = JIMMV1;
