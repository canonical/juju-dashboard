class JujuAddon {
  constructor(socket, userData) {
    this._disposables = [];
    this._socket = socket;
    this._buffer = "";
    this._user = userData.user;
    this._credentials = userData.credentials;
    this._macaroons = userData.macaroons;
  }

  activate(terminal) {
    this._disposables.push(
      addSocketListener(this._socket, "message", (ev) => {
        const data = JSON.parse(ev.data);
        if (data.output) {
          terminal.writeln(`${data.output[0]}`);
        }
        if (data.done) {
          this._prompt(terminal);
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
          terminal.writeln("");
          let command = this._buffer;
          this._buffer = "";
          if (!command) {
            this._prompt(terminal);
            return;
          }
          if (command.indexOf("juju ") === 0) {
            // The 'juju' command prefix is not required, strip it
            // before sending the command if it's provided.
            command = command.substring(5);
          }
          const message = {
            commands: [command],
          };
          if (this._macaroons) {
            message.macaroons = this._macaroons;
          } else {
            message.user = this._user;
            message.credentials = this._credentials;
          }
          this._sendData(message);
          break;
        case "\u0003": // Ctrl+C
          this._prompt(terminal);
          break;
        case "\u007F": // Backspace
          // Do not delete the prompt
          if (terminal._core.buffer.x > 2) {
            terminal.write("\b \b");
          }
          // Remove the end of the buffer;
          this._buffer = this._buffer.substring(0, -1);
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
