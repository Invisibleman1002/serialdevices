/* eslint-disable @typescript-eslint/naming-convention */
import {
  TreeItemCollapsibleState,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  Command,
  window,
  Memento,
} from "vscode";
import { join } from "path";
//import { spawn } from "child_process";
import { SerialPort } from "serialport";
//import { bonjour } from "bonjour";
const bonjour = require("bonjour")();

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
  private _coms: Com[] = [];
  private _comChanged: ComPlus[] = [];
  private _storage: Memento;
  //private _devices: string[][] = [];
  //   private _devices: object = {};
  constructor(storage: Memento) {
    SerialPort.list().then(function (value) {
      console.log("value");
      console.log(value);
    });
    /*     const valueOfVid = parseInt("0403", 16);
    const valueOfPid = parseInt("6001", 16);
    // console.log(extensions.all.map((x) => x.id));
    SerialPort.list().then(function (value) {
      value.find((p) => {
        // The pid and vid returned by SerialPortCtrl start with 0x prefix in Mac, but no 0x prefix in Win32.
        // Should compare with decimal value to keep compatibility.
        if (p.productId && p.vendorId) {
          console.log("value");
          console.log(value);
          console.log(
            parseInt(p.productId, 16) === valueOfPid &&
              parseInt(p.vendorId, 16) === valueOfVid
          );
        }
        //return false;
      });
    }); */

    // var browser = bonjour.find({ port: 8266 }, this.newService); //var browser = bonjour.find({ type: "_arduino._tcp." }, this.newService); //
    var browser = bonjour.find(
      { host: "tcp", type: "arduino" },
      this.newService
    );
    browser.on("down", function (s: any) {
      console.log(s);
      console.log("down");
    });
    //////^^^9^^    ALL TEST CODE
    this._storage = storage;
    // constructor(context: ExtensionContext) {
    let com: Com[] | undefined = this._storage.get<Com[]>("com");
    //this._storage.update("com", undefined);
    //let com: Com[] | undefined = context.globalState.get<Com[]>("com");
    // console.log("com");
    // console.log(com);
    if (com !== undefined) {
      // console.log("com");
      this._RenamedDevices = com!;
    }
    //this._coms = this._storage.get("com");
  }

  newService(service: any) {
    console.log("service");
    console.log(service.type);
    console.log(service);
  }
  //readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;
  getTreeItem(element: SerialD): TreeItem {
    // let renamed: Com[] = this._RenamedDevices.filter(
    //   (element) => element.DeviceID === element.DeviceID
    // );

    //  console.log("getTreeItem");
    // console.log(element);
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
  /*
//This does not work when we deactivate.  What am I missing?
  deactivate = async () => {
    await window
      .showWarningMessage(
        "Would you like to Delete the 'Renamed' settings?",
        "Yes",
        "No"
      )
      .then((selection) => {
        console.log(selection);
        if (selection === "Yes") {
          console.log("storage cleared");
          this._storage.update("com", undefined);
        }
      });
  };
*/
  removename = async (item: SerialD) => {
    this._RenamedDevices = this._RenamedDevices.filter(
      (element) => element.DeviceID !== item.jsondata.DeviceID
    );
    this._storage.update("com", this._RenamedDevices);

    this.refresh();
  };

  tryrename = async (item: SerialD) => {
    //  tryrename = async (item:string)=>{//
    let data: string | undefined = await window.showInputBox({
      prompt: `Rename ${item.jsondata.Caption} to:`,
    });
    // window.withProgress(
    //   {
    //     location: ProgressLocation.Notification,
    //     title: "Finding ...",
    //     cancellable: false,
    //   },
    //   async (progress, token) => {
    //     for (let i = 0; i < 10; i++) {
    //       setTimeout(() => {
    //         progress.report({ increment: i * 10, message: "title" });
    //       }, 10000);
    //     }
    //   }
    // );

    // let i = 0;
    // const result = await window.showQuickPick(["eins", "zwei", "drei"], {
    //   placeHolder: "eins, zwei or drei",
    //   onDidSelectItem: (item) =>
    //     window.showInformationMessage(`Focus ${++i}: ${item}`),
    // });

    /*
    await window.showInputBox({
      value: 'abcdef',
      valueSelection: [2, 4],
      placeHolder: 'For example: fedcba. But not: 123',
      validateInput: text => {
        window.showInformationMessage(`Validating: ${text}`);
        return text === '123' ? 'Not 123!' : null;
      }
    });*/
    // console.log(data);
    // console.log(item);
    if (data !== undefined) {
      //could scan the list and make sure there is not one already names this..
      //If so..  data+'_1';
      //We need eliminate ones if we already
      this._RenamedDevices = this._RenamedDevices.filter(
        (element) => element.DeviceID !== item.jsondata.DeviceID
      );
      // console.log(this._RenamedDevices);
      this._RenamedDevices.push({
        Name: item.jsondata.Name,
        Caption: item.jsondata.Caption,
        DeviceID: item.jsondata.DeviceID,
        Usernamed: data,
        vendorId: item.jsondata.vendorId,
        productId: item.jsondata.productId,
      });
      // Memn;
      // ExtensionContext.workspaceState.update("DEV", response);
      // console.log(this._RenamedDevices);
      this._storage.update("com", this._RenamedDevices);
      window.showInformationMessage(
        `${item.jsondata.Caption} rename to ${data}.`
      );
      this.refresh();
    }
  };
  /*
https://stackoverflow.com/questions/42464838/what-is-the-most-efficient-way-to-determine-if-a-collection-of-objects-has-chang/42466050#42466050
*/
  f(prev: Com[], curr: Com[]): ComPlus[] {
    const result: ComPlus[] = prev.reduce(function (result: ComPlus[], p) {
      const c = curr.find(function (item) {
        return item.DeviceID === p.DeviceID;
      });
      if (c) {
        if (c.DeviceID !== p.DeviceID) {
          result.push({
            event: "modified",
            DeviceID: p.DeviceID,
            Name: p.Name,
            Caption: p.Caption,
            Usernamed: p.Usernamed,
            vendorId: p.vendorId,
            productId: p.productId,
          });
        }
      } else {
        result.push({
          event: "removed",
          DeviceID: p.DeviceID,
          Name: p.Name,
          Caption: p.Caption,
          Usernamed: p.Usernamed,
          vendorId: p.vendorId,
          productId: p.productId,
        });
      }
      return result;
    }, []);

    // console.log("result");
    // console.log(result);
    return result;
    /* return curr.reduce(function (result, c) {
      const p = prev.find(function (item) {
        //   console.log("c");
        //   console.log(c);
        return item.DeviceID === c.DeviceID;
      });
      //  console.log("P");
      //  console.log(p);
      if (p !== undefined) {
        console.log(`P====[ ${p} ]`);
        result.push({
          event: "added",
          DeviceID: p.DeviceID,
          Name: p!.Name,
          Caption: p!.Caption,
          Usernamed: p!.Usernamed,
        });
      }
      return result;
    }, result); */
  }
  getdevices = async () => {
    let oldcomcount: number = this._coms.length;
    //  console.log("oldcomcount");
    // console.log(oldcomcount);
    let old_coms = this._coms;
    this._coms = await this.mySerialD().then(function (value) {
      return value;
    });
    // console.log("this._coms.length");
    // console.log(this._coms.length);
    if (oldcomcount === 0) {
      oldcomcount = this._coms.length;
      old_coms = this._coms;
    }

    let comchanged: boolean = this._coms.length !== oldcomcount;

    this._refreshcount = this._refreshcount + 1;
    if (this._refreshcount >= 30 || comchanged === true) {
      clearInterval(this._timerObject);

      this._refreshcount = 0;
      if (comchanged === true) {
        window.showInformationMessage("Device changes found.");
      } else {
        window.showInformationMessage("Scanning timed-out.");
      }
    }
    /**
     if (
      this._refreshcount >= 30 ||
      (comchanged === true && this._coms.length < oldcomcount)
    ) {
      clearInterval(this._timerObject);
      this._refreshcount = 0;
      // this._refresh =false;
    }
    if (comchanged === true) {
      //lets do one more scan
      this._refreshcount = 28;
      // this._refresh =false;
    }
     */
    // console.log(old_coms);
    // console.log("^-before.. V-after..");
    // if (old_coms.length > this._coms.length) {
    this._comChanged = this.f(old_coms, this._coms);
    //  } else {
    //  this._comChanged = this.f(this._coms, old_coms);
    // }

    // console.log(this._comChanged);
    // let current = old_coms.filter(this.isinarray(element, index, arr, this._coms)
    // );
    // let current = old_coms.filter((o1) =>
    //   this._coms.find((o2) => o1.DeviceID !== o2.DeviceID)
    // );
    // let different = this._coms.filter((o1) =>
    //   old_coms.some((o2) => o1.DeviceID === o2.DeviceID)
    // );
    // this._coms = this._coms.sort(this.GetSortOrder("Usernamed"));
    //this._coms.sort((a: any, b: any) => a.Caption - b.Caption);

    this.refresh();
  };

  refresh(): void {
    // console.log("inside refresh");
    this._onDidChangeTreeData.fire(undefined);
  }

  dorefresh(): void {
    window.showInformationMessage("Scanning for Serial port changes.");
    this._timerObject = setInterval(this.getdevices, 800);
  }

  public async getChildren(element?: SerialD): Promise<SerialD[]> {
    // console.log("---getChildren-------------");
    // console.log(element);
    // console.log("----------------");
    if (this._refresh) {
      // let coms = await this.mySerialD().then(function (value) {
      //   return value;
      // });
      // console.log("this._coms");
      // console.log(this._coms.length);
      let coms = this._coms;
      if (this._coms.length === 0) {
        // console.log("getting some coms");
        coms = await this.mySerialD().then(function (value) {
          return value;
        });
      }

      let treeSerialD: SerialD[] = [];

      if (coms.length !== 0) {
        for (var i = 0; i < coms.length; i++) {
          //var item = new TreeItem("Foo");
          let renamed: Com[] = this._RenamedDevices.filter(
            (element) => element.DeviceID === coms[i].DeviceID
          );
          // console.log("cption");
          //let cption:string = (renamed[0].Usernamed !== undefined)?renamed[0].Usernamed:coms[i].Caption;
          let cption: string = coms[i].Caption;
          if (renamed.length > 0) {
            cption =
              renamed[0].Usernamed !== undefined
                ? renamed[0].Usernamed
                : coms[i].Caption;
          }

          //  console.log(cption);
          treeSerialD[i] = new SerialD(
            cption,
            TreeItemCollapsibleState.None,
            {
              command: "serialdevices.renameEntry",
              title: coms[i].Caption,
              tooltip: `DeviceID:  ${coms[i].DeviceID}`,
            },
            "com",
            coms[i]
          );
          treeSerialD[i].command.arguments = [treeSerialD[i]];
          treeSerialD[i].id = i.toString();
          treeSerialD[i].description = coms[i].Name;
          treeSerialD[
            i
          ].tooltip = `Click to Rename. \n\n${coms[i].Caption}\n${coms[i].Name}`;
        }
      }
      //CHANGED CHILDREN!
      if (this._comChanged.length !== 0) {
        const plus = treeSerialD.length;
        for (var i = 0; i < this._comChanged.length; i++) {
          //var item = new TreeItem("Foo");
          let renamed: Com[] = this._RenamedDevices.filter(
            (element) => element.DeviceID === this._comChanged[i].DeviceID
          );

          let cption: string = this._comChanged[i].Caption;
          if (renamed.length > 0) {
            cption =
              renamed[0].Usernamed !== undefined
                ? renamed[0].Usernamed
                : this._comChanged[i].Caption;
          }
          /*
          switch (this._comChanged[i].event) {
            case "added":
              cption = `+${cption}+`;
              break;
            case "removed":
              cption = `-${cption}-`;
              break;
          }
          */
          console.log(cption);
          treeSerialD[i + plus] = new SerialD(
            cption,
            TreeItemCollapsibleState.None,
            {
              command: "",
              title: this._comChanged[i].Caption,
              tooltip: `DeviceID:  ${this._comChanged[i].DeviceID}`,
            },
            "com",
            this._comChanged[i]
          );
          treeSerialD[i + plus].command.arguments = [treeSerialD[i + plus]];
          treeSerialD[i + plus].id = i + plus.toString();
          treeSerialD[i + plus].description = this._comChanged[i].event; // this._comChanged[i].Caption;
          treeSerialD[i + plus].tooltip = `Click to Rename.`;
        }
        this._comChanged = [];
      }
      //this.dorefresh();

      //setTimeout(this.getdevices, 500);//wait 2 seconds

      return treeSerialD;
    } else {
      return Promise.resolve([]);
    }
  }

  async mySerialD(): Promise<Com[]> {
    // async list(): Promise<ISerialPortDetail[]> {
    return (await SerialPort.list()).map((port) => {
      return {
        Caption: port.path,
        Name: (port as any).friendlyName ?? port.manufacturer,
        DeviceID: port.pnpId!,
        Usernamed: undefined,
        vendorId: port.vendorId,
        productId: port.productId,
        // productId: port.productId,
      };
    });
  }
  /*
  async I_made_this_mySerialD() {
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
  */
} //End CLass

class Com {
  Name: string = "";
  Caption: string = "";
  DeviceID: string = "";
  Usernamed: string | undefined;
  productId: string | undefined;
  vendorId: string | undefined;
}
class ComPlus extends Com {
  event: string = "";
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
