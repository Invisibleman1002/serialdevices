"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
//import * as vscode from 'vscode';
const vscode_1 = require("vscode");
const serialDeviceprovider_1 = require("./serialDeviceprovider");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "serialdevices" is now active!');
    const serProvider = new serialDeviceprovider_1.SerialProvider();
    vscode_1.window.registerTreeDataProvider('SerialDeviceProviderService', serProvider);
    vscode_1.commands.registerCommand('serialdevices.DevicesSerial', serProvider.onFileClicked);
    vscode_1.commands.registerCommand('serialdevices.getsome', serProvider.getdevices);
    vscode_1.commands.registerCommand("serialdevices.refreshEntry", () => serProvider.dorefresh());
    vscode_1.commands.registerCommand('serialdevices.editEntry', (node) => vscode_1.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
    vscode_1.commands.registerCommand('serialdevices.renameEntry', (item) => serProvider.tryrename(item));
    //see output
    //commands.registerCommand('serialdevices.renameEntry', (item:TreeItem)=> {console.log(item);});
    //commands.executeCommand('serialdevices.refresh', 'shouldRefresh', true);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode_1.commands.registerCommand('serialdevices.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode_1.window.showInformationMessage('Hello World from SerialDevices!');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map