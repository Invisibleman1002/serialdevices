/* eslint-disable @typescript-eslint/naming-convention */
import {
  TreeItemCollapsibleState,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  Command,
  window,
  commands,
  Uri,
  MarkdownString,
  ExtensionContext,
} from "vscode";
import { join, parse } from "path";
import { spawn } from "child_process";

export class SerialProvider implements TreeDataProvider<SerialD> {
  private _onDidChangeTreeData: EventEmitter<any | undefined | null | void> =
    new EventEmitter<any | undefined | null | void>();
  //private _onDidChangeTreeData: EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
  readonly onDidChangeTreeData: Event<any | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private _timerObject: any;
  private _refreshcount: number = 0;
  private _RenamedDevices: Com[] = [];
  private _refresh: boolean = true;
  //private _devices: string[][] = [];
  //   private _devices: object = {};

  //readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;
  getTreeItem(element: SerialD): TreeItem {
    let renamed: Com[] = this._RenamedDevices.filter(
      (element) => element.DeviceID === element.DeviceID
    );

    console.log("getTreeItem");
    console.log(element);
    // let updatedelement = new SerialD(
    //   cption,
    //   TreeItemCollapsibleState.None,
    //   {
    //     command: "serialdevices.renameEntry",
    //     title: element.Caption,
    //     tooltip: `DeviceID:  ${element.DeviceID}`,
    //   },
    //   "com",
    //   coms[i]
    // );
    // treeSerialD[i].command.arguments = [treeSerialD[i]];
    // treeSerialD[i].id = i.toString();

    return element;
  }

  async onFileClicked(diffs: [string, string]): Promise<void> {
    console.log("inside On File Clicked");
    try {
      // await this.getdevices;
      //await showSERS(diffs);
      //   await new Promise(function(resolve, reject) {
      //     resolve('success')

      // });

      let p = Promise.resolve([1, 2, 3]);
      await p.then(function (v) {
        console.log(v[0]); // 1
      });
    } catch (error) {
      console.error(error);
    }
  }

  tryrename = async (item: SerialD) => {
    //  tryrename = async (item:string)=>{//
    let data: string | undefined = await window.showInputBox({
      prompt: "Rename to:",
    });
    console.log(data);
    console.log(item);

    this._RenamedDevices.push({
      Name: item.jsondata.Name,
      Caption: item.jsondata.Caption,
      DeviceID: item.jsondata.DeviceID,
      Usernamed: data,
    });

    console.log(this._RenamedDevices);
    this.refresh();
  };

  getdevices = async () => {
    console.log("inside getdevices");
    console.log(this._refreshcount);
    this._refreshcount = this._refreshcount + 1;
    if (this._refreshcount >= 10) {
      clearInterval(this._timerObject);
      this._refreshcount = 0;
      // this._refresh =false;
    }
    this.refresh();
  };

  refresh(): void {
    console.log("inside refresh");
    this._onDidChangeTreeData.fire(undefined);
  }

  dorefresh(): void {
    //window.showInformationMessage('Refresh button clicked!');
    this._timerObject = setInterval(this.getdevices, 500);
    //const _timerObject  = setTimeout(this.getdevices, 500);
  }

  public async getChildren(element?: SerialD): Promise<SerialD[]> {
    console.log("----------------");
    console.log(element);
    console.log("----------------");
    if (this._refresh) {
      let coms = await this.mySerialD().then(function (value) {
        return value;
      });

      let treeSerialD: SerialD[] = [];

      if (coms.length !== 0) {
        for (var i = 0; i < coms.length; i++) {
          //var item = new TreeItem("Foo");
          let renamed: Com[] = this._RenamedDevices.filter(
            (element) => element.DeviceID === coms[i].DeviceID
          );
          console.log("cption");
          //let cption:string = (renamed[0].Usernamed !== undefined)?renamed[0].Usernamed:coms[i].Caption;
          let cption: string = coms[i].Caption;
          if (renamed.length > 0) {
            cption =
              renamed[0].Usernamed !== undefined
                ? renamed[0].Usernamed
                : coms[i].Caption;
          }

          console.log(cption);
          treeSerialD[i] = new SerialD(
            cption,
            TreeItemCollapsibleState.None,
            {
              command: "serialdevices.renameEntry",
              title: coms[i].Caption,
              tooltip: `DeviceID:  ${coms[i].DeviceID}`,
              // PID:  ${this.info.productId}
              // ${locale['manufacturer']}: ${this.info.manufacturer}
              // ${locale['serialNumber']}: ${this.info.serialNumber}
              // * ${locale['click_to']} ${this.port.isOpen ? locale['disconnect'] : locale['connect']}`;
            },
            "com",
            coms[i]
          );
          treeSerialD[i].command.arguments = [treeSerialD[i]];
          treeSerialD[i].id = i.toString();
        }
      }
      //this.dorefresh();

      //setTimeout(this.getdevices, 500);//wait 2 seconds

      return treeSerialD;
    } else {
      return Promise.resolve([]);
    }
  }

  async mySerialD() {
    var serialJSON = "";
    //	await context.globalstate.get('trey');
    return new Promise<Com[]>((resolve, reject) => {
      //let promise =  new Promise((resolve, reject) => {

      //	const spawnTest = (() => {
      const dir = spawn("SerialDevices.exe", {
        stdio: ["ignore", "pipe", "pipe"],
        cwd: "C:\\Users\\treya\\source\\repos\\SerialDevices\\bin\\Debug\\net5.0\\",
      });

      dir.stdout.on("data", (data) => {
        // console.log(`spawn stdout: ${data}`);
        serialJSON += data;
      });

      dir.stderr.on("data", (data) => {
        console.log(`spawn stderr: ${data}`);
      });

      dir.on("error", (code) => {
        console.log(`spawn error: ${code}`);
      });
      //https://stackoverflow.com/questions/37522010/difference-between-childprocess-close-exit-events
      dir.on("close", (code) => {
        // console.log(`spawn child process closed with code ${code}`);
        const obj = JSON.parse(serialJSON);
        //console.log(obj);
        //console.log(obj[0].Name);
        // _devices = obj;
        resolve(obj);
      });

      dir.on("exit", (code) => {
        //console.log(`spawn child process exited with code ${code}`);
      });
    });
    //	console.log("---result--S-");
    //console.log(result[0].Name);
    // let result = await promise;

    // return result;
    //return promise;
  }
} //End CLass

class Com {
  Name: string = "";
  Caption: string = "";
  DeviceID: string = "";
  Usernamed: string | undefined;
}

export class SerialD extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly command: Command,
    public readonly type: "com",
    public jsondata: Com
  ) {
    super(label, collapsibleState);
    //this.tooltip = this.label;
    // this.description = this.label + ' test';
  }

  /* 	get tooltip(): string {
		return this.label;
	}

	get description(): string {
		return this.label;
	} */

  iconPath = {
    light: join(__filename, "..", "..", "resources", `${this.type}.svg`),
    dark: join(__filename, "..", "..", "resources", `${this.type}.svg`),
  };

  contextValue = "COM";
}
