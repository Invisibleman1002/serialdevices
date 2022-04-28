"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialD = exports.SerialProvider = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode_1 = require("vscode");
const path_1 = require("path");
const child_process_1 = require("child_process");
class SerialProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        //private _onDidChangeTreeData: EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._refreshcount = 0;
        this._RenamedDevices = [];
        this._refresh = true;
        this.tryrename = async (item) => {
            //  tryrename = async (item:string)=>{//
            let data = await vscode_1.window.showInputBox({
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
        this.getdevices = async () => {
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
    }
    //private _devices: string[][] = [];
    //   private _devices: object = {};
    //readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;
    getTreeItem(element) {
        let renamed = this._RenamedDevices.filter((element) => element.DeviceID === element.DeviceID);
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
    refresh() {
        console.log("inside refresh");
        this._onDidChangeTreeData.fire(undefined);
    }
    dorefresh() {
        //window.showInformationMessage('Refresh button clicked!');
        this._timerObject = setInterval(this.getdevices, 500);
        //const _timerObject  = setTimeout(this.getdevices, 500);
    }
    async getChildren(element) {
        console.log("----------------");
        console.log(element);
        console.log("----------------");
        if (this._refresh) {
            let coms = await this.mySerialD().then(function (value) {
                return value;
            });
            let treeSerialD = [];
            if (coms.length !== 0) {
                for (var i = 0; i < coms.length; i++) {
                    //var item = new TreeItem("Foo");
                    let renamed = this._RenamedDevices.filter((element) => element.DeviceID === coms[i].DeviceID);
                    console.log("cption");
                    //let cption:string = (renamed[0].Usernamed !== undefined)?renamed[0].Usernamed:coms[i].Caption;
                    let cption = coms[i].Caption;
                    if (renamed.length > 0) {
                        cption =
                            renamed[0].Usernamed !== undefined
                                ? renamed[0].Usernamed
                                : coms[i].Caption;
                    }
                    console.log(cption);
                    treeSerialD[i] = new SerialD(cption, vscode_1.TreeItemCollapsibleState.None, {
                        command: "serialdevices.renameEntry",
                        title: coms[i].Caption,
                        tooltip: `DeviceID:  ${coms[i].DeviceID}`,
                        // PID:  ${this.info.productId}
                        // ${locale['manufacturer']}: ${this.info.manufacturer}
                        // ${locale['serialNumber']}: ${this.info.serialNumber}
                        // * ${locale['click_to']} ${this.port.isOpen ? locale['disconnect'] : locale['connect']}`;
                    }, "com", coms[i]);
                    treeSerialD[i].command.arguments = [treeSerialD[i]];
                    treeSerialD[i].id = i.toString();
                }
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
        var serialJSON = "";
        //	await context.globalstate.get('trey');
        return new Promise((resolve, reject) => {
            //let promise =  new Promise((resolve, reject) => {
            //	const spawnTest = (() => {
            const dir = (0, child_process_1.spawn)("SerialDevices.exe", {
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
exports.SerialProvider = SerialProvider;
class Com {
    constructor() {
        this.Name = "";
        this.Caption = "";
        this.DeviceID = "";
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