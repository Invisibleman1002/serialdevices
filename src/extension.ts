// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
//import * as vscode from 'vscode';
import { ExtensionContext, window, commands, TreeItem } from "vscode";
import { SerialProvider, SerialD } from "./serialDeviceprovider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "serialdevices" is now active!');

  const serProvider = new SerialProvider(context.globalState);
  window.registerTreeDataProvider("SerialDeviceProviderService", serProvider);

  commands.registerCommand(
    "serialdevices.DevicesSerial",
    serProvider.onFileClicked
  );
  commands.registerCommand("serialdevices.getsome", serProvider.getdevices);
  commands.registerCommand("serialdevices.refreshEntry", () =>
    serProvider.dorefresh()
  );
  commands.registerCommand("serialdevices.editEntry", (node: SerialD) =>
    window.showInformationMessage(
      `Successfully called edit entry on ${node.label}.`
    )
  );
  commands.registerCommand("serialdevices.renameEntry", (item: SerialD) =>
    serProvider.tryrename(item)
  );
  commands.registerCommand("serialdevices.unrename", (item: SerialD) =>
    serProvider.removename(item)
  );
  //see output
  //commands.registerCommand('serialdevices.renameEntry', (item:TreeItem)=> {console.log(item);});
  //commands.executeCommand('serialdevices.refresh', 'shouldRefresh', true);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand("serialdevices.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    window.showInformationMessage("Hello World from SerialDevices!");
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
