import { toErrorString } from "utils";

export enum Label {
  INCORRECT_DATA_ERROR = "Invalid response from the server.",
}

type Options = {
  address: string;
  messageCallback: (messages: string[]) => void;
  onclose: () => void;
  onopen: () => void;
  onerror: (error: Event | string) => void;
  setLoading: (loading: boolean) => void;
};

class Connection {
  #address: string;
  #messageBuffer: string[] = [];
  #messageCallback: (messages: string[]) => void;
  #setLoading: Options["setLoading"];
  #wsOnOpen: () => void;
  #wsOnClose: () => void;
  #wsOnError: (error: Event | string) => void;
  #ws: null | WebSocket = null;

  constructor(options: Options) {
    this.#messageCallback = options.messageCallback;
    this.#address = options.address;
    this.#setLoading = options.setLoading;
    this.#wsOnOpen = options.onopen;
    this.#wsOnClose = options.onclose;
    this.#wsOnError = options.onerror;
  }

  get address(): string {
    return this.#address;
  }

  connect(onOpen?: () => void, onError?: (event: Event) => void): this {
    const ws = new WebSocket(this.#address);
    ws.onopen = (): void => {
      this.#wsOnOpen();
      onOpen?.();
    };
    ws.onclose = this.#wsOnClose;
    ws.onmessage = this.#handleMessage.bind(this);
    ws.onerror = (event): void => {
      this.#wsOnError(event);
      onError?.(event);
    };
    this.#ws = ws;
    return this;
  }

  send(message: string): void {
    this.#setLoading(true);
    this.#ws?.send(message);
  }

  disconnect(): void {
    if (this.isActive()) {
      this.#ws?.close();
      this.#setLoading(false);
    }
    this.#messageBuffer = [];
  }

  reconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.connect(resolve, reject);
    });
  }

  isOpen(): boolean {
    return this.#ws?.readyState === WebSocket.OPEN;
  }

  isActive(): boolean {
    return this.#ws?.readyState === WebSocket.CONNECTING || this.isOpen();
  }

  isWebSocketEqual(newConnection: Connection): boolean {
    return this.#ws === newConnection.#ws;
  }

  #handleMessage(messageEvent: MessageEvent): void {
    this.#setLoading(false);
    try {
      let data: unknown;
      try {
        data = JSON.parse(messageEvent.data);
      } catch (error) {
        throw new Error(Label.INCORRECT_DATA_ERROR);
      }
      if (data === null || typeof data !== "object") {
        throw new Error(Label.INCORRECT_DATA_ERROR);
      }
      if ("done" in data && Boolean(data.done)) {
        // This is the last message so send the entire message.
        this.#messageCallback(this.#messageBuffer);
        this.#messageBuffer = [];
        return;
      }
      const dataOutput =
        "output" in data && Boolean(data.output) ? data.output : null;
      if (dataOutput === null || !dataOutput) {
        // This is the first message, an empty object and a newline.
        return;
      }
      if (!Array.isArray(dataOutput)) {
        throw new Error(Label.INCORRECT_DATA_ERROR);
      }
      // Build up messages until it gets the 'done' message:
      this.#messageBuffer.push(dataOutput[0]);
    } catch (error) {
      this.#wsOnError(toErrorString(error));
    }
  }
}

export default Connection;
