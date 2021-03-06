"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
//import * as vscode from 'vscode';
const vscode_1 = require("vscode");
const serialDeviceprovider_1 = require("./serialDeviceprovider");
function activate(context) {
    const serProvider = new serialDeviceprovider_1.SerialProvider(context.globalState);
    vscode_1.window.registerTreeDataProvider("SerialDeviceProviderService", serProvider);
    context.subscriptions.push(vscode_1.commands.registerCommand("serialdevices.getsomedevices", serProvider.getdevices));
    context.subscriptions.push(vscode_1.commands.registerCommand("serialdevices.refreshEntry", () => serProvider.dorefresh()));
    context.subscriptions.push(vscode_1.commands.registerCommand("serialdevices.refreshmdns", () => serProvider.mDNS_start()));
    // ! this wont work!  I mean, it pops open the Serial Port Selection but wont select it.
    vscode_1.commands.registerCommand("serialdevices.arduino_sp", (node) => {
        // const valueOfVid = parseInt("0403", 16);
        // const valueOfPid = parseInt("6001", 16);
        //This doesnt work, yet...   Maybe there is a way to send the port to the Arduino VSC Ext.
        if (node.type === "wifi") {
            serProvider.setclipboard(node);
            serProvider.startSocket(node);
        }
        if (node.jsondata.vendorId &&
            node.jsondata.productId &&
            node.type === "com") {
            serProvider.setclipboard(node);
            const valueOfVid = parseInt(node.jsondata.vendorId, 16);
            const valueOfPid = parseInt(node.jsondata.productId, 16);
            // console.log(valueOfPid);
            vscode_1.commands.executeCommand("arduino.selectSerialPort", valueOfVid, valueOfPid);
            sendClipboard();
            //commands.executeCommand("arduino.selectSerialPort", "0x0403", "0x6001")
        }
    });
    vscode_1.commands.registerCommand("serialdevices.arduino_ota", (node) => {
        if (node.type === "wifi") {
            serProvider.setclipboard(node);
            serProvider.startSocket(node);
        }
    });
    vscode_1.commands.registerCommand("serialdevices.renameEntry", (item) => serProvider.tryrename(item));
    vscode_1.commands.registerCommand("serialdevices.unrename", (item) => serProvider.removename(item));
    vscode_1.commands.registerCommand("serialdevices.restartmdns", () => serProvider.clickedmdns_restart());
}
exports.activate = activate;
async function sendClipboard() {
    await new Promise((r) => setTimeout(r, 400));
    vscode_1.commands.executeCommand("editor.action.clipboardPasteAction");
}
// this method is called when your extension is deactivated
function deactivate() {
    /* This does not work!  Extension can be disabled or uninstalled with out a question.
    I would like to clean up the "database".  Anyone?
    const serProvider = new SerialProvider(context.globalState);
    serProvider.deactivate();
    */
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map