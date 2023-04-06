type Options = {
  address: string;
  messageCallback: (message: string) => void;
  onclose: () => void;
  onopen: () => void;
};

class Connection {
  address: string;
  _messageBuffer = "";
  _timeout: number | null = null;
  _messageCallback: (message: string) => void;
  _wsOnOpen: () => void;
  _wsOnClose: () => void;
  _ws: WebSocket | null = null;

  constructor(options: Options) {
    this._messageCallback = options.messageCallback;
    this.address = options.address;
    this._wsOnOpen = options.onopen;
    this._wsOnClose = options.onclose;
  }

  connect() {
    const ws = new WebSocket(this.address);
    ws.onopen = this._wsOnOpen;
    ws.onclose = this._wsOnClose;
    ws.onmessage = this._handleMessage.bind(this);
    this._ws = ws;
    return this;
  }

  send(message: string) {
    this._ws?.send(message);
  }

  disconnect() {
    this._ws?.close();
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  _handleMessage(e: MessageEvent) {
    try {
      const data = JSON.parse(e.data);
      if (data["redirect-to"]) {
        // This is a JAAS controller and we need to instead
        // connect to the sub controller.
        this._ws?.close();
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

  _pushToMessageBuffer(message: string) {
    const bufferEmpty = !!this._messageBuffer;
    this._messageBuffer = this._messageBuffer + message;
    if (bufferEmpty) {
      this._timeout = window.setTimeout(() => {
        /*
        The messageBuffer is required because the websocket returns messages
        much faster than React wants to update the component. Doing this allows
        us to store the messages in a buffer and then set the output every
        cycle.
      */
        this._messageCallback(this._messageBuffer);
        this._messageBuffer = "";
        this._timeout = null;
      });
    }
  }
}

export default Connection;
