import * as net from "net";
//import {Socket} from "dgram";
import * as readline from "readline";

class SocketToMe {
  private _port: number;
  private _host: string;
  private _client: net.Socket;
  private _pause: boolean = false;

  constructor(port: string, host: string) {
    this._port = parseInt(port);
    this._host = host;
    this._client = new net.Socket();
    this.startSocket();
  }
  public dispose(): void {
    this._client.destroy();
  }

  startSocket() {
    this._client.connect(this._port, this._host, () => {
      console.log("Connected.  This is just a socket connction on port 23.");
      console.log("Commads:");
      console.log("exit - Disconnects and closes the window.");
      console.log("pause - Toggles showing incoming data.");
      this.doubleask();
    });

    this._client.on("data", (data: any) => {
      console.log("< incoming >");
      console.log(data.toString("UTF8"));
    });

    this._client.on("close", function () {
      console.log("Connection closed");
      console.log("type exit to leave.");
    });

    this._client.on("disconnect", (reason) => {
      console.log(`disconnected...${reason}`);
    });
  }

  async doubleask() {
    const ans: string = await this.askQuestion(">> ");
    //console.log(`>>> ${ans}`);
    if (ans === "exit") {
      this._client.destroy();
      //look at socked.end
      return;
    }
    if (ans === "pause") {
      this._pause = !this._pause;
      if (this._pause) {
        this._client.pause();
      } else {
        this._client.resume();
      }
    }
    //this._client.write(ans);
    this._client.write(ans, () => {
      console.log(`>>> ${ans}`);
    });
    this.doubleask();
  }

  askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
      })
    );
  }
}
let [_1, _2, port, host] = process.argv;
//const sock: SocketToMe = new SocketToMe(port, host);
new SocketToMe(port, host);
