"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialD = exports.SerialProvider = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode_1 = require("vscode");
const path_1 = require("path");
const path = require("path");
const fs = require("fs");
const serialport_1 = require("serialport");
const bonjour_service_1 = require("bonjour-service");
class SerialProvider {
    //private _TelnetMonitor: Terminal; //OutputChannel;
    //private _clsTerminal: Terminally;
    constructor(storage) {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        //private _onDidChangeTreeData: EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._refreshcount = 0;
        this._refreshOTA = 0; //Clear the OTA every x cycles.
        this._RenamedDevices = [];
        this._coms = [];
        this._comChanged = [];
        this._OTA = [];
        this._ArdCOM = "";
        this._ArdSKETCH = "";
        this._bonjour = new bonjour_service_1.default();
        this._clsArduino = new Arduino_JSON_Settings();
        this.startSocket = async (node) => {
            // let txt: string = "";
            // if (node.type === "wifi") {
            //   txt = `${node.jsondata.Caption} : ${node.description}`;
            // }this._clsTerminal =
            new Terminally(23, node.description.toString(), node.jsondata.Caption);
        };
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
            let data = await vscode_1.window.showInputBox({
                prompt: `Rename ${item.jsondata.Caption} to:`,
            });
            if (data !== undefined) {
                //could scan the list and make sure there is not one already names this..
                //If so..  data+'_1';
                //We need eliminate ones if we already
                this._RenamedDevices = this._RenamedDevices.filter((element) => element.DeviceID !== item.jsondata.DeviceID);
                this._RenamedDevices.push({
                    Name: item.jsondata.Name,
                    Caption: item.jsondata.Caption,
                    DeviceID: item.jsondata.DeviceID,
                    Usernamed: data,
                    vendorId: item.jsondata.vendorId,
                    productId: item.jsondata.productId,
                });
                this._storage.update("com", this._RenamedDevices);
                vscode_1.window.showInformationMessage(`${item.jsondata.Caption} rename to ${data}.`);
                this.refresh();
            }
        };
        this.setclipboard = async (node) => {
            let txt = "";
            if (node.type === "wifi") {
                txt = `${node.jsondata.Caption} : ${node.description}`;
            }
            if (node.type === "com") {
                txt = node.jsondata.Caption;
            }
            await vscode_1.env.clipboard.writeText(txt);
        };
        this.getdevices = async () => {
            let oldcomcount = this._coms.length;
            let old_coms = this._coms;
            this._coms = await this.mySerialD().then(function (value) {
                return value;
            });
            this._coms.sort((a, b) => a.Caption.localeCompare(b.Caption, "en", { numeric: true }));
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
            this._comChanged = this.f(old_coms, this._coms);
            this.Storage_Refresh();
            this.refresh();
        };
        let newwatcher = vscode_1.workspace.createFileSystemWatcher("**/arduino.json");
        newwatcher.onDidChange((uri) => {
            this._clsArduino.setActiveCOMport();
            this._ArdCOM = this._clsArduino.getActiveCOMport();
            this._ArdSKETCH = this._clsArduino.getActivesketch();
        }); //this.checkport.bind(this));
        this.checkport();
        this._clsArduino.registerRefresh(() => this.refresh());
        vscode_1.window.onDidChangeActiveTextEditor(this.CheckActiveDocument.bind(this));
        //////^^^9^^    ALL TEST CODE
        this._storage = storage;
        this.Storage_Refresh();
        this.mDNS_start();
        // this._TelnetMonitor = window.createTerminal("Telnet Terminal"); //window.createOutputChannel("Telnet Monitor");
        // this._TelnetMonitor.show();
        // //this._TelnetMonitor.appendLine("TELNET SESSION STARTED.");
        // this._TelnetMonitor.sendText("TERMINAL LY ILL");
    }
    checkport() {
        this._clsArduino.setActiveCOMport();
        this._ArdCOM = this._clsArduino.getActiveCOMport();
        this._ArdSKETCH = this._clsArduino.getActivesketch();
    }
    CheckActiveDocument() {
        //  console.log("CheckActrive");
        // window.showInformationMessage(
        //   `window.activeTextEditor: ${window.activeTextEditor?.document.uri.fsPath}`
        // );
        // window.showInformationMessage(
        //   `workspaceFolderPath: ${workspace.workspaceFolders![0].uri.fsPath}`
        // );
        // console.log(
        //   window.activeTextEditor?.document.uri.toString().includes(".ino")
        // );
        if (vscode_1.window.activeTextEditor?.document.uri.fsPath !== undefined &&
            vscode_1.window.activeTextEditor?.document.uri.toString().includes(".ino")) {
            // console.log("activeTextEditor");
            // console.log(
            //   workspace.getWorkspaceFolder(window.activeTextEditor?.document.uri)?.uri
            // );
            // console.log("setActiveURI");
            this._clsArduino.setActiveURI(vscode_1.workspace.getWorkspaceFolder(vscode_1.window.activeTextEditor?.document.uri)
                ?.uri);
            if (this._clsArduino.checkexist() === true) {
                // console.log("checkexist");
                // this._clsArduino.watchfile();
                this._clsArduino.setActiveCOMport();
                this._ArdCOM = this._clsArduino.getActiveCOMport();
                this._ArdSKETCH = this._clsArduino.getActivesketch();
                this.refresh();
            }
            // console.log(this._clsArduino);
            // window.showInformationMessage(
            //   `getWorkspaceFolder: ${
            //     workspace.getWorkspaceFolder(window.activeTextEditor?.document.uri)
            //       ?.uri.fsPath
            //   }`
            // );
        }
    }
    clickedmdns_restart() {
        this._refreshOTA = 6;
        this._OTA = []; //Lets clear our old devices hanging around every once in a while.  You unplugged, right?
        this.refresh();
        this.mDNS_start();
    }
    Storage_Refresh() {
        let com = this._storage.get("com");
        if (com !== undefined) {
            this._RenamedDevices = com;
        }
    }
    mDNS_start() {
        //Here so other things can start this and we dont end up with holes?
        clearInterval(this._timerBonjour);
        this._refreshOTA = this._refreshOTA + 1;
        if (this._refreshOTA > 5) {
            vscode_1.window.setStatusBarMessage("Refresh OTA scan.", new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 3000);
            }));
            this.Storage_Refresh();
            this._refreshOTA = 0;
            this._OTA = []; //Lets clear our old devices hanging around every once in a while.  You unplugged, right?
        }
        let browser = this._bonjour.find({ type: "arduino" }, this.newService.bind(this));
        //we stop and restart the discovery because I remember reading about a bug that found devices that disconnect, dont get found again.
        //Maybe fixed?
        this._timerBonjour = setInterval(() => {
            clearInterval(this._timerBonjour);
            browser.stop();
            this.mDNS_start();
        }, 60000);
        //RARE anything says its down.  all my OTA just disappear because unplugged.
        // down.on("down", (service) => {
        //   console.log("DOWN DOWN");
        //   console.log(service);
        //   console.log(service.txt.board);
        // });
        //THIS BIT ME!!!!  https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
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
         
        }); */
    }
    newService(service) {
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
        this._OTA = this._OTA.filter((element) => element.fqdn !== service.fqdn);
        this._OTA.push(eota);
        this._OTA.sort((a, b) => a.Name.localeCompare(b.Name));
        this.refresh();
    }
    getTreeItem(element) {
        return element;
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
        return result;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    dorefresh() {
        this.clickedmdns_restart();
        clearInterval(this._timerObject);
        this._timerObject = setInterval(this.getdevices, 800);
        vscode_1.window
            .showInformationMessage("Scanning for Serial port changes.", "Cancel")
            .then((selection) => {
            if (selection === "Cancel") {
                clearInterval(this._timerObject);
            }
        });
    }
    generatedash(strin) {
        let dash = "";
        for (var i = this._refreshOTA + 1; i < 6; i++) {
            dash = dash + "~";
        }
        return strin + dash;
    }
    async getChildren(element) {
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
                //let cption:string = (renamed[0].Usernamed !== undefined)?renamed[0].Usernamed:coms[i].Caption;
                let cption = coms[i].Caption;
                if (renamed.length > 0) {
                    cption =
                        renamed[0].Usernamed !== undefined
                            ? renamed[0].Usernamed
                            : coms[i].Caption;
                }
                // if (coms[i].Caption === this._ArdCOM) {
                //   cption = `<=> ${cption}`;
                // }
                // console.log(this._ArdCOM);
                treeSerialD[i] = new SerialD(cption, vscode_1.TreeItemCollapsibleState.None, {
                    command: "serialdevices.renameEntry",
                    title: coms[i].Caption,
                    tooltip: `DeviceID:  ${coms[i].DeviceID}`,
                }, coms[i].Caption === this._ArdCOM ? "selected" : "com", coms[i]);
                treeSerialD[i].command.arguments = [treeSerialD[i]];
                treeSerialD[i].id = i.toString();
                let Desc = this._ArdSKETCH !== "" && coms[i].Caption === this._ArdCOM
                    ? `${this._ArdSKETCH} (${coms[i].Caption})`
                    : coms[i].Name;
                treeSerialD[i].description = Desc; //coms[i].Name;
                treeSerialD[i].tooltip = new vscode_1.MarkdownString(`Click to rename\n___\n- *PORT:=*    **${coms[i].Caption}**\n- *friendlyName:=*  **${coms[i].Name}**`);
            }
            treeSerialD.sort((a, b) => a.label.localeCompare(b.label, "en", { numeric: true }));
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
        if (this._OTA.length !== 0) {
            let plus = treeSerialD.length;
            let ni = 0;
            let NetworkLabel = "--= Network Devices =--";
            //this._refreshOTA
            treeSerialD[ni + plus] = new SerialD(this.generatedash(NetworkLabel), vscode_1.TreeItemCollapsibleState.None, {
                command: "serialdevices.restartmdns",
                title: "Network Devices",
                tooltip: `header`,
            }, "blank", {
                Name: "",
                Caption: "",
                DeviceID: "",
                Usernamed: "",
                productId: "",
                vendorId: "",
            });
            treeSerialD[ni + plus].command.arguments = [treeSerialD[ni + plus]];
            treeSerialD[ni + plus].id = ni + plus.toString();
            treeSerialD[ni + plus].description = "";
            treeSerialD[ni + plus].tooltip = `Click to Refresh OTA.`;
            treeSerialD[ni + plus].contextValue = "networklbl"; //This allows me to hide the ICON in Package.json
            plus = treeSerialD.length;
            for (var i = 0; i < this._OTA.length; i++) {
                let renamed = this._RenamedDevices.filter((element) => element.DeviceID === this._OTA[i].DeviceID);
                let cption = this._OTA[i].Caption;
                if (renamed.length > 0) {
                    cption =
                        renamed[0].Usernamed !== undefined
                            ? renamed[0].Usernamed
                            : this._OTA[i].Caption;
                }
                treeSerialD[i + plus] = new SerialD(cption, vscode_1.TreeItemCollapsibleState.None, {
                    command: "serialdevices.renameEntry",
                    title: this._OTA[i].Caption,
                    tooltip: `DeviceID:  ${this._OTA[i].DeviceID}`,
                }, "wifi", this._OTA[i]);
                treeSerialD[i + plus].command.arguments = [treeSerialD[i + plus]];
                treeSerialD[i + plus].id = i + plus.toString();
                //https://code.visualstudio.com/api/references/vscode-api#MarkdownString
                treeSerialD[i + plus].description = this._OTA[i].address; // this._comChanged[i].Caption;
                treeSerialD[i + plus].tooltip = new vscode_1.MarkdownString(`Click to rename\n___\n- *IP:=*    **${this._OTA[i].address}**\n- *Host:=*  **${this._OTA[i].host}**\n- *fqdn:=*  **${this._OTA[i].fqdn}**\n- *Board:=* **${this._OTA[i].board}**\n- *AUTH:=* **${this._OTA[i].auth_upload}**`);
                treeSerialD[i + plus].contextValue = "ota";
                //  console.log(treeSerialD[i + plus].iconPath);
            }
        }
        return treeSerialD;
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
        this.iconPath = {
            light: (0, path_1.join)(__filename, "..", "..", "resources", `${this.type}.svg`),
            dark: (0, path_1.join)(__filename, "..", "..", "resources", `${this.type}.svg`),
        };
        this.contextValue = "COM";
    }
}
exports.SerialD = SerialD;
const ARDUINO_CONFIG_FILE = path.join(".vscode", "arduino.json");
class Arduino_JSON_Settings {
    constructor() {
        this._ActiveURI = "";
        this._arduinoConfigPath = "";
        this._COMActive = "";
        this._SKETCHActive = "";
    }
    setActiveURI(acturi) {
        this._ActiveURI = acturi.fsPath;
    }
    getActiveCOMport() {
        return this._COMActive;
    }
    getActivesketch() {
        return this._SKETCHActive;
    }
    setActiveCOMport() {
        //console.log("setActiveComPoART");
        if (fs.existsSync(this._arduinoConfigPath)) {
            const settings = this.tryParseJSON(fs.readFileSync(this._arduinoConfigPath, "utf8"));
            // console.log(settings);
            this._COMActive = settings.port !== undefined ? settings.port : "";
            this._SKETCHActive =
                settings.sketch !== undefined
                    ? settings.sketch.toString().replace(/.ino/gi, "")
                    : "";
            //Maybe grab the Board and other details and place in the Extended options.
            //commands.executeCommand("serialdevices.refreshtree"); //Replaced this with a callback.
            // console.log("CALLBACK");
            this._refreshCallbacks();
        }
    }
    registerRefresh(callback) {
        this._refreshCallbacks = callback;
    }
    checkexist() {
        if (this._ActiveURI !== undefined) {
            this._arduinoConfigPath = path.join(this._ActiveURI.toString(), ARDUINO_CONFIG_FILE);
            if (fs.existsSync(this._arduinoConfigPath)) {
                // window.showInformationMessage(
                //   `workspaceFolderPath_checkexist: ${this._arduinoConfigPath}`
                // );
                //    if (this._watcher === undefined) {
                //    console.log("_watcher");
                this.setActiveCOMport();
                //   this.watchfile();
                //  }
                return true;
            }
        }
        return false;
    }
    // public dispose() {
    //   if (this._watcher) {
    //     this._watcher.dispose();
    //   }
    // }
    tryParseJSON(jsonString) {
        try {
            const jsonObj = JSON.parse(jsonString);
            if (jsonObj && typeof jsonObj === "object") {
                return jsonObj;
            }
        }
        catch (ex) { }
        return undefined;
    }
}
/**
  Terminally:  Create the node telnet connection.
 */
class Terminally {
    /**
      Start up node telnet connection and create a terminal window for it.
     */
    constructor(port, host, name) {
        const clientFile = (0, path_1.resolve)(__dirname, "sockettome.js");
        const shellArgs = [clientFile, port.toString(), host];
        const shellPath = "node";
        this._Terminal = vscode_1.window.createTerminal({
            name,
            shellPath,
            shellArgs,
        });
        //this._Terminal =  window.createTerminal("Telnet Terminal");
        this._Terminal.show();
    }
}
//# sourceMappingURL=serialDeviceprovider.js.map