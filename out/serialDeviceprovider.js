"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialD = exports.SerialProvider = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode_1 = require("vscode");
const path_1 = require("path");
//import { spawn } from "child_process";
const serialport_1 = require("serialport");
//import { Server } from "http";
//import { bonjour } from "bonjour";
//import bonjour = require('bonjour')();
//const bonjour = require("bonjour")();
//import _bonjour from "bonjour";
//const bonjour = _bonjour();
const bonjour_service_1 = require("bonjour-service");
//import bonjour = require("bonjour");
//const bonjour = new _bonjour();
class SerialProvider {
    //private _devices: string[][] = [];
    //   private _devices: object = {};
    constructor(storage) {
        // SerialPort.list().then(function (value) {
        //   console.log("value");
        //   console.log(value);
        // });
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
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        //private _onDidChangeTreeData: EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._refreshcount = 0;
        this._RenamedDevices = [];
        this._refresh = true;
        this._coms = [];
        this._comChanged = [];
        this._OTA = [];
        this._svc = [];
        this._bonjour = new bonjour_service_1.default();
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
        this.removename = async (item) => {
            this._RenamedDevices = this._RenamedDevices.filter((element) => element.DeviceID !== item.jsondata.DeviceID);
            this._storage.update("com", this._RenamedDevices);
            this.refresh();
        };
        this.tryrename = async (item) => {
            console.log(this._svc);
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
        this.mDNS_start();
        // var browser = bonjour.find({ port: 8266 }, this.newService); //var browser = bonjour.find({ type: "_arduino._tcp." }, this.newService); //
        /*     var browser = bonjour.find({ type: "arduino" }); //,
    
        let myatt: any[] = [];
        let eota: Com[] = [];
        // browser.on("up", this.newService);
    
        browser.on("up", function (service: any) {
          console.log("service");
    
          console.log(service);
          console.log(service.txt.board);
    
          myatt.push(service);
    
          let lent = eota.push({
            Name: "FIRE",
            Caption: "TRUCK",
            DeviceID: "TRUCK",
            Usernamed: "",
            vendorId: "undefined",
            productId: "undefined",
          });
          console.log(myatt);
          console.log(lent);
          //this.refresh();
        }); */
        // browser.on("down", function (s: any) {
        //   console.log(s);
        //   console.log("down");
        // });
    }
    async find(token) {
        console.log("inside find:");
        const services = [];
        const bonjour = new bonjour_service_1.default();
        const browser = bonjour.find({ type: "arduino", protocol: "tcp" }, function (service) {
            services.push({
                label: service.name,
                service,
            });
        });
        await vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Discovered",
            cancellable: true,
        }, (progress, token) => {
            const step = 100 / 10;
            const nobodyMsg = "nobody 😢";
            progress.report({
                increment: 0,
                message: nobodyMsg,
            });
            return new Promise((resolve) => {
                let elapsed = 0;
                const interval = setInterval(() => {
                    elapsed++;
                    const names = services.map((s) => s.label).join(", ");
                    const message = names || nobodyMsg;
                    progress.report({
                        increment: step,
                        message: message,
                    });
                    if (elapsed === 10) {
                        clearInterval(interval);
                        resolve("resolve");
                    }
                }, 1000);
                token.onCancellationRequested(() => {
                    clearInterval(interval);
                    resolve("resolve");
                });
            });
        });
        browser.stop();
        return services;
    }
    async mDNS_start() {
        //  bonjour.find({ type: "arduino" }, this.newService);
        /*     const tokenSrc = new CancellationTokenSource();
        const services = await this.find(tokenSrc.token);
    
        if (services.length === 0) {
          window.showErrorMessage("There's no peer found");
          return;
        }
    
        const selected = await window.showQuickPick<item>(services);
        if (!selected) {
          return;
        }
        console.log(selected.service); */
        /*     let eota: OTAPlus;
        eota = {
          Name: selected.service.name,
          Caption: selected.service.host,
          DeviceID: selected.service.addresses[0],
          Usernamed: "",
          vendorId: "undefined",
          productId: "undefined",
          address: selected.service.addresses[0],
          //name: string = "";
          fqdn: selected.service.fqdn,
          host: selected.service.host,
          port: selected.service.port,
          auth_upload: selected.service.txt.auth_upload,
          board: selected.service.txt.board,
        };
        console.log(this._OTA.push(eota));
        this.refresh(); */
        console.log("starting FIND!");
        this._bonjour.find({ type: "arduino" }, this.newService.bind(this));
        /*  this._bonjour.find({ type: "arduino" }, (service) => {
          console.log("newService service");
          //  console.log(service.type);
          console.log(service);
          console.log(service.txt.board);
     
          let eota: OTAPlus;
          eota = {
            Name: service.name,
            Caption: service.host,
            DeviceID: service.addresses![0],
            Usernamed: "",
            vendorId: "undefined",
            productId: "undefined",
            address: service.addresses![0],
            //name: string = "";
            fqdn: service.fqdn,
            host: service.host,
            port: service.port,
            auth_upload: service.txt.auth_upload,
            board: service.txt.board,
          };
         
          console.log("eota");
          console.log(eota);
          //  this.wtf(eota);
          this._OTA.push(eota);
          console.log("FARGING ICEHOLE:");
          console.log(this._OTA);
          this.refresh();
        }); */
    }
    newService(service) {
        console.log("newService service");
        //  console.log(service.type);
        console.log(service);
        console.log(service.txt.board);
        // let otacom:Com = new Com(){
        //   Name: service.name,
        //   Caption: item.jsondata.Caption,
        //   DeviceID: item.jsondata.DeviceID,
        //   Usernamed: undefined,
        //   vendorId: item.jsondata.vendorId,
        //   productId: item.jsondata.productId,
        // };
        //---------------------------------------------  REVISIT THIS!  might have to do on multiple
        //this._OTA = this._OTA.filter((element) => element.fqdn !== service.fqdn);
        let eota;
        eota = {
            Name: service.name,
            Caption: service.host,
            DeviceID: service.addresses[0],
            Usernamed: "",
            vendorId: "undefined",
            productId: "undefined",
            address: service.addresses[0],
            //name: string = "";
            fqdn: service.fqdn,
            host: service.host,
            port: service.port,
            auth_upload: service.txt.auth_upload,
            board: service.txt.board,
        };
        //this._svc.push(service);
        // let eota: Com[] = [];
        // console.log("TRUCK");
        // let lent = eota.push({
        //   Name: "FIRE",
        //   Caption: "TRUCK",
        //   DeviceID: "TRUCK",
        //   Usernamed: "",
        //   vendorId: "undefined",
        //   productId: "undefined",
        // });
        // this._OTA.push(eota);
        console.log("eota");
        console.log(eota);
        //  this.wtf(eota);
        this._OTA.push(eota);
        console.log("FARGING ICEHOLE:");
        console.log(this._OTA);
        this.refresh();
    }
    // class OTAPlus extends Com {
    //   address: string = "";
    //   //name: string = "";
    //   fqdn: string = "";
    //   host: string = "";
    //   port: number = 0;
    //   auth_upload: string = "";
    //   board: string = "";
    // }
    wtf(datain) {
        console.log("datain");
        console.log(datain);
        console.log(this._OTA.push(datain));
    }
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
        // window.showInformationMessage("Scanning for Serial port changes.");
        this._timerObject = setInterval(this.getdevices, 800);
        vscode_1.window
            .showInformationMessage("Scanning for Serial port changes.", "Cancel")
            .then((selection) => {
            console.log(selection);
            if (selection === "Cancel") {
                console.log("Cancel Cancel");
                clearInterval(this._timerObject);
            }
        });
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
            if (this._OTA.length !== 0) {
                const plus = treeSerialD.length;
                for (var i = 0; i < this._OTA.length; i++) {
                    let renamed = this._RenamedDevices.filter((element) => element.DeviceID === this._OTA[i].DeviceID);
                    let cption = this._OTA[i].Caption;
                    if (renamed.length > 0) {
                        cption =
                            renamed[0].Usernamed !== undefined
                                ? renamed[0].Usernamed
                                : this._OTA[i].Caption;
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
                        title: this._OTA[i].Caption,
                        tooltip: `DeviceID:  ${this._OTA[i].DeviceID}`,
                    }, "com", this._OTA[i]);
                    treeSerialD[i + plus].command.arguments = [treeSerialD[i + plus]];
                    treeSerialD[i + plus].id = i + plus.toString();
                    // treeSerialD[i + plus].description = this._OTA[i].address; // this._comChanged[i].Caption;
                    treeSerialD[i + plus].tooltip = `Click to Rename.`;
                }
            }
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
class OTAPlus extends Com {
    constructor() {
        super(...arguments);
        this.address = "";
        //name: string = "";
        this.fqdn = "";
        this.host = "";
        this.port = 0;
        this.auth_upload = "";
        this.board = "";
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