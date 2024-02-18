type Options = {
  address: string;
  messageCallback: (message: string) => void;
  onclose: () => void;
  onopen: () => void;
  onerror: (error: Event | string) => void;
};

class Connection {
  #address: string;
  #messageBuffer = "";
  #timeout: number | null = null;
  #messageCallback: (message: string) => void;
  #wsOnOpen: () => void;
  #wsOnClose: () => void;
  #wsOnError: (error: Event | string) => void;
  #ws: WebSocket | null = null;

  constructor(options: Options) {
    this.#messageCallback = options.messageCallback;
    this.#address = options.address;
    this.#wsOnOpen = options.onopen;
    this.#wsOnClose = options.onclose;
    this.#wsOnError = options.onerror;
  }

  getAddress() {
    return this.#address;
  }

  connect() {
    const ws = new WebSocket(this.#address);
    ws.onopen = this.#wsOnOpen;
    ws.onclose = this.#wsOnClose;
    ws.onmessage = this.#handleMessage.bind(this);
    ws.onerror = this.#wsOnError;
    this.#ws = ws;
    return this;
  }

  send(message: string) {
    this.#ws?.send(message);
  }

  disconnect() {
    this.#ws?.close();
    if (this.#timeout) {
      clearTimeout(this.#timeout);
    }
  }

  isOpen() {
    return this.#ws?.readyState === WebSocket.OPEN;
  }

  #handleMessage(messageEvent: MessageEvent) {
    try {
      let data: unknown;
      try {
        data = JSON.parse(messageEvent.data);
      } catch (e) {
        throw new Error("Incorrect data.");
      }
      if (!data || typeof data !== "object") {
        throw new Error("Incorrect data.");
      }
      if (
        "redirect-to" in data &&
        data["redirect-to"] &&
        typeof data["redirect-to"] === "string"
      ) {
        try {
          // This is a JAAS controller and we need to instead
          // connect to the sub controller.
          this.disconnect();
          this.#address = data["redirect-to"];
          this.connect();
        } catch (e) {
          throw new Error("Unable to connect to JAAS controller.");
        }
      }
      if ("done" in data && data.done) {
        // This is the last message.
        return;
      }
      if (!("output" in data) || !data.output) {
        // This is the first message, an empty object and a newline.
        return;
      }
      if (!Array.isArray(data.output)) {
        throw new Error("Incorrect data.");
      }
      this.#pushToMessageBuffer(`\n${data.output[0]}`);
    } catch (error) {
      this.#wsOnError(
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown error.",
      );
    }
  }

  #pushToMessageBuffer(message: string) {
    const bufferEmpty = !!this.#messageBuffer;
    this.#messageBuffer = this.#messageBuffer + message;
    if (bufferEmpty) {
      this.#timeout = window.setTimeout(() => {
        /*
        The messageBuffer is required because the websocket returns messages
        much faster than React wants to update the component. Doing this allows
        us to store the messages in a buffer and then set the output every
        cycle.
      */
        this.#messageCallback(this.#messageBuffer);
        this.#messageBuffer = "";
        this.#timeout = null;
      });
    }
  }
}

export default Connection;
