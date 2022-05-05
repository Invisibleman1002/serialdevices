// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
//import * as vscode from 'vscode';
import {
  ExtensionContext,
  window,
  commands,
  TreeItem,
  ConfigurationTarget,
} from "vscode";
import { SerialProvider, SerialD } from "./serialDeviceprovider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  //console.log('Congratulations, your extension "serialdevices" is now active!');

  const serProvider = new SerialProvider(context.globalState);
  window.registerTreeDataProvider("SerialDeviceProviderService", serProvider);

  commands.registerCommand(
    "serialdevices.DevicesSerial",
    serProvider.onFileClicked
  );
  context.subscriptions.push(
    commands.registerCommand(
      "serialdevices.getsomedevices",
      serProvider.getdevices
    )
  );
  context.subscriptions.push(
    commands.registerCommand("serialdevices.refreshEntry", () =>
      serProvider.dorefresh()
    )
  );

  // ! this wont work!  I mean, it pops open the Serial Port Selection but wont select it.
  commands.registerCommand("serialdevices.arduino_sp", (node: SerialD) => {
    // const valueOfVid = parseInt("0403", 16);
    // const valueOfPid = parseInt("6001", 16);
    //This doesnt work, yet...   Maybe there is a way to send the port to the Arduino VSC Ext.
    if (node.jsondata.vendorId && node.jsondata.productId) {
      const valueOfVid = parseInt(node.jsondata.vendorId, 16);
      const valueOfPid = parseInt(node.jsondata.productId, 16);
      console.log(valueOfPid);
      commands.executeCommand(
        "arduino.selectSerialPort",
        valueOfVid,
        valueOfPid
      );
      //commands.executeCommand("arduino.selectSerialPort", "0x0403", "0x6001")
    }
  });

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
  // let disposable = commands.registerCommand("serialdevices.helloWorld", () => {
  //   // The code you place here will be executed every time your command is executed
  //   // Display a message box to the user
  //   window.showInformationMessage("Hello World from SerialDevices!");
  // });

  // context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate(context: ExtensionContext) {
  /* This does not work!  Extension can be disabled or uninstalled with out a question.
  I would like to clean up the "database".  Anyone?
  const serProvider = new SerialProvider(context.globalState);
  serProvider.deactivate();
  */
}
