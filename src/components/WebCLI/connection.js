class Connection {
  constructor(options) {
    this._messageCallback = options.messageCallback;
    this.address = options.address;
    this.wsOnOpen = options.onopen;
    this.wsOnClose = options.onclose;
  }

  _messageBuffer = "";

  connect() {
    const ws = new WebSocket(this.address);
    ws.onopen = this._wsOnOpen;
    ws.onclose = this._wsOnClose;
    ws.onmessage = this._handleMessage.bind(this);
    this._ws = ws;
    return this;
  }

  send(message) {
    this._ws.send(message);
  }

  disconnect() {
    this._ws.close();
  }

  _handleMessage(e) {
    try {
      const data = JSON.parse(e.data);
      if (data["redirect-to"]) {
        // This is a JAAS controller and we need to instead
        // connect to the sub controller.
        this._ws.close();
        this.address = data["redirect-to"];
        this.connect();
      }

      if (data.done) {
        // This is the last message.
        return;
      }
      if (!data.output) {
        // This is the first message, an empty object and a newline.
        return;
      }
      this._pushToMessageBuffer(`\n${data?.output[0]}`);
    } catch (e) {
      console.log(e);
      // XXX handle the invalid data response
    }
  }

  _pushToMessageBuffer(message) {
    this._messageBuffer = this._messageBuffer + message;
    setTimeout(() => {
      /*
        The messageBuffer is required because the websocket returns messages
        much faster than React wants to update the component. Doing this allows
        us to store the messages in a buffer and then set the output every
        cycle.
      */
      this._messageCallback(this._messageBuffer);
      this._messageBuffer = "";
    });
  }
}

export default Connection;
