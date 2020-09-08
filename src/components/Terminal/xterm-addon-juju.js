class JujuAddon {
  constructor(socket) {
    this._disposables = [];
    this._socket = socket;
    this._buffer = "";
  }

  activate(terminal) {
    this._disposables.push(
      addSocketListener(this._socket, "message", (ev) => {
        const data = JSON.parse(ev.data);
        console.log(data);
        if (data.output) {
          terminal.writeln(`${data.output[0]}`);
        }
      })
    );
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

    terminal.onData((e) => {
      switch (e) {
        case "\r": // Enter
          this._sendData(this._buffer);
          this._buffer = "";
          break;
        case "\u0003": // Ctrl+C
          this._prompt(terminal);
          break;
        case "\u007F": // Backspace (DEL)
          // Do not delete the prompt
          if (terminal._core.buffer.x > 2) {
            terminal.write("\b \b");
          }
          // Remove the end of the buffer;
          this._buffer.substring(0, -1);
          break;
        default:
          terminal.write(e);
          // Save the inputted character to the buffer;
          this._buffer += e;
      }
    });
  }

  dispose() {
    this._disposables.forEach((d) => d.dispose());
  }

  _sendData(data) {
    if (this._socket.readyState !== 1) {
      return;
    }
    this._socket.send(JSON.stringify(data));
  }

  _prompt(terminal) {
    terminal.write("\r\n$ ");
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
    },
  };
}

export default JujuAddon;
