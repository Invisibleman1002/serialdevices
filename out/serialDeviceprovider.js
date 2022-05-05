"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialD = exports.SerialProvider = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode_1 = require("vscode");
const path_1 = require("path");
//import { spawn } from "child_process";
const serialport_1 = require("serialport");
//import { bonjour } from "bonjour";
const bonjour = require("bonjour")();
class SerialProvider {
    //private _devices: string[][] = [];
    //   private _devices: object = {};
    constructor(storage) {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        //private _onDidChangeTreeData: EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._refreshcount = 0;
        this._RenamedDevices = [];
        this._refresh = true;
        this._coms = [];
        this._comChanged = [];
        this.deactivate = async () => {
            await vscode_1.window
                .showWarningMessage("Would you like to Delete the 'Renamed' settings?", "Yes", "No")
                .then((selection) => {
                console.log(selection);
                if (selection === "Yes") {
                    console.log("storage cleared");
                    this._storage.update("com", undefined);
                }
            });
        };
        this.removename = async (item) => {
            this._RenamedDevices = this._RenamedDevices.filter((element) => element.DeviceID !== item.jsondata.DeviceID);
            this._storage.update("com", this._RenamedDevices);
            this.refresh();
        };
        this.tryrename = async (item) => {
            //  tryrename = async (item:string)=>{//
            let data = await vscode_1.window.showInputBox({
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
                this._RenamedDevices = this._RenamedDevices.filter((element) => element.DeviceID !== item.jsondata.DeviceID);
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
                vscode_1.window.showInformationMessage(`${item.jsondata.Caption} rename to ${data}.`);
                this.refresh();
            }
        };
        this.getdevices = async () => {
            let oldcomcount = this._coms.length;
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
            let comchanged = this._coms.length !== oldcomcount;
            this._refreshcount = this._refreshcount + 1;
            if (this._refreshcount >= 30 || comchanged === true) {
                clearInterval(this._timerObject);
                this._refreshcount = 0;
                if (comchanged === true) {
                    vscode_1.window.showInformationMessage("Device changes found.");
                }
                else {
                    vscode_1.window.showInformationMessage("Scanning timed-out.");
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
        serialport_1.SerialPort.list().then(function (value) {
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
        var browser = bonjour.find({ host: "tcp", type: "arduino" }, this.newService);
        browser.on("down", function (s) {
            console.log(s);
            console.log("down");
        });
        //////^^^9^^    ALL TEST CODE
        this._storage = storage;
        // constructor(context: ExtensionContext) {
        let com = this._storage.get("com");
        //this._storage.update("com", undefined);
        //let com: Com[] | undefined = context.globalState.get<Com[]>("com");
        // console.log("com");
        // console.log(com);
        if (com !== undefined) {
            // console.log("com");
            this._RenamedDevices = com;
        }
        //this._coms = this._storage.get("com");
    }
    newService(service) {
        console.log("service");
        console.log(service.type);
        console.log(service);
    }
    //readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;
    getTreeItem(element) {
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
    async onFileClicked(diffs) {
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
        }
        catch (error) {
            console.error(error);
        }
    }
    /*
  https://stackoverflow.com/questions/42464838/what-is-the-most-efficient-way-to-determine-if-a-collection-of-objects-has-chang/42466050#42466050
  */
    f(prev, curr) {
        const result = prev.reduce(function (result, p) {
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
            }
            else {
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
    refresh() {
        // console.log("inside refresh");
        this._onDidChangeTreeData.fire(undefined);
    }
    dorefresh() {
        vscode_1.window.showInformationMessage("Scanning for Serial port changes.");
        this._timerObject = setInterval(this.getdevices, 800);
    }
    async getChildren(element) {
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
            let treeSerialD = [];
            if (coms.length !== 0) {
                for (var i = 0; i < coms.length; i++) {
                    //var item = new TreeItem("Foo");
                    let renamed = this._RenamedDevices.filter((element) => element.DeviceID === coms[i].DeviceID);
                    // console.log("cption");
                    //let cption:string = (renamed[0].Usernamed !== undefined)?renamed[0].Usernamed:coms[i].Caption;
                    let cption = coms[i].Caption;
                    if (renamed.length > 0) {
                        cption =
                            renamed[0].Usernamed !== undefined
                                ? renamed[0].Usernamed
                                : coms[i].Caption;
                    }
                    //  console.log(cption);
                    treeSerialD[i] = new SerialD(cption, vscode_1.TreeItemCollapsibleState.None, {
                        command: "serialdevices.renameEntry",
                        title: coms[i].Caption,
                        tooltip: `DeviceID:  ${coms[i].DeviceID}`,
                    }, "com", coms[i]);
                    treeSerialD[i].command.arguments = [treeSerialD[i]];
                    treeSerialD[i].id = i.toString();
                    treeSerialD[i].description = coms[i].Name;
                    treeSerialD[i].tooltip = `Click to Rename. \n\n${coms[i].Caption}\n${coms[i].Name}`;
                }
            }
            //CHANGED CHILDREN!
            if (this._comChanged.length !== 0) {
                const plus = treeSerialD.length;
                for (var i = 0; i < this._comChanged.length; i++) {
                    //var item = new TreeItem("Foo");
                    let renamed = this._RenamedDevices.filter((element) => element.DeviceID === this._comChanged[i].DeviceID);
                    let cption = this._comChanged[i].Caption;
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
                    treeSerialD[i + plus] = new SerialD(cption, vscode_1.TreeItemCollapsibleState.None, {
                        command: "",
                        title: this._comChanged[i].Caption,
                        tooltip: `DeviceID:  ${this._comChanged[i].DeviceID}`,
                    }, "com", this._comChanged[i]);
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
        }
        else {
            return Promise.resolve([]);
        }
    }
    async mySerialD() {
        // async list(): Promise<ISerialPortDetail[]> {
        return (await serialport_1.SerialPort.list()).map((port) => {
            return {
                Caption: port.path,
                Name: port.friendlyName ?? port.manufacturer,
                DeviceID: port.pnpId,
                Usernamed: undefined,
                vendorId: port.vendorId,
                productId: port.productId,
                // productId: port.productId,
            };
        });
    }
} //End CLass
exports.SerialProvider = SerialProvider;
class Com {
    constructor() {
        this.Name = "";
        this.Caption = "";
        this.DeviceID = "";
    }
}
class ComPlus extends Com {
    constructor() {
        super(...arguments);
        this.event = "";
    }
}
class SerialD extends vscode_1.TreeItem {
    constructor(label, collapsibleState, command, type, jsondata) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.type = type;
        this.jsondata = jsondata;
        /* 	get tooltip(): string {
              return this.label;
          }
      
          get description(): string {
              return this.label;
          } */
        this.iconPath = {
            light: (0, path_1.join)(__filename, "..", "..", "resources", `${this.type}.svg`),
            dark: (0, path_1.join)(__filename, "..", "..", "resources", `${this.type}.svg`),
        };
        this.contextValue = "COM";
        //this.tooltip = this.label;
        // this.description = this.label + ' test';
    }
}
exports.SerialD = SerialD;
//# sourceMappingURL=serialDeviceprovider.js.map