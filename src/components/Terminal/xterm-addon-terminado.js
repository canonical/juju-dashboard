class TerminadoAddon {
  constructor(socket, options) {
    this._disposables = [];
    this._socket = socket;
    this._socket.binaryType = "arraybuffer";
    this._bidirectional =
      options && options.bidirectional === false ? false : true;
    this._utf8 = !!(options && options.inputUtf8);
  }

  activate(terminal) {
    if (this._utf8) {
      // TODO for terminado.
      this._disposables.push(
        addSocketListener(this._socket, "message", ev =>
          terminal.writeUtf8(new Uint8Array(ev.data))
        )
      );
    } else {
      this._disposables.push(
        addSocketListener(this._socket, "message", ev => {
          const data = JSON.parse(ev.data);
          // TODO add buffering support.
          if (data[0] === "stdout") {
            terminal.write(data[1]);
          }
        })
      );
    }

    if (this._bidirectional) {
      this._disposables.push(
        terminal.onData(data => {
          this._sendData(data);
        })
      );
    }
    this._disposables.push(
      addSocketListener(this._socket, "close", () => {
        this.dispose();
      })
    );
    this._disposables.push(
      addSocketListener(this._socket, "error", () => {
        this.dispose();
      })
    );
  }
  dispose() {
    this._disposables.forEach(d => d.dispose());
  }
  _sendData(data) {
    if (this._socket.readyState !== 1) {
      return;
    }
    this._socket.send(JSON.stringify(["stdin", data]));
  }
}

function addSocketListener(socket, type, handler) {
  socket.addEventListener(type, handler);
  return {
    dispose: () => {
      if (!handler) {
        return;
      }
      socket.removeEventListener(type, handler);
    }
  };
}

export default TerminadoAddon;
