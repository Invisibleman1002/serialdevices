// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
//import * as vscode from 'vscode';
import { ExtensionContext, window, commands } from "vscode";
import { SerialProvider, SerialD } from "./serialDeviceprovider";

export function activate(context: ExtensionContext) {
  const serProvider = new SerialProvider(context.globalState);
  window.registerTreeDataProvider("SerialDeviceProviderService", serProvider);

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
  context.subscriptions.push(
    commands.registerCommand("serialdevices.refreshmdns", () =>
      serProvider.mDNS_start()
    )
  );

  // ! this wont work!  I mean, it pops open the Serial Port Selection but wont select it.
  commands.registerCommand("serialdevices.arduino_sp", (node: SerialD) => {
    // const valueOfVid = parseInt("0403", 16);
    // const valueOfPid = parseInt("6001", 16);
    //This doesnt work, yet...   Maybe there is a way to send the port to the Arduino VSC Ext.
    if (node.type === "wifi") {
      serProvider.setclipboard(node);

      // commands.executeCommand("arduino.selectSerialPort");
      // sendClipboard();

      serProvider.startSocket(node);
    }
    if (
      node.jsondata.vendorId &&
      node.jsondata.productId &&
      node.type === "com"
    ) {
      serProvider.setclipboard(node);
      const valueOfVid = parseInt(node.jsondata.vendorId, 16);
      const valueOfPid = parseInt(node.jsondata.productId, 16);
      // console.log(valueOfPid);
      commands.executeCommand(
        "arduino.selectSerialPort",
        valueOfVid,
        valueOfPid
      );

      sendClipboard();

      //commands.executeCommand("arduino.selectSerialPort", "0x0403", "0x6001")
    }
  });

  commands.registerCommand("serialdevices.arduino_ota", (node: SerialD) => {
    if (node.type === "wifi") {
      serProvider.setclipboard(node);
      serProvider.startSocket(node);
    }
  });

  commands.registerCommand("serialdevices.renameEntry", (item: SerialD) =>
    serProvider.tryrename(item)
  );
  commands.registerCommand("serialdevices.unrename", (item: SerialD) =>
    serProvider.removename(item)
  );

  commands.registerCommand("serialdevices.restartmdns", () =>
    serProvider.clickedmdns_restart()
  );
}

async function sendClipboard() {
  await new Promise((r) => setTimeout(r, 400));
  commands.executeCommand("editor.action.clipboardPasteAction");
}

// this method is called when your extension is deactivated
export function deactivate() {
  /* This does not work!  Extension can be disabled or uninstalled with out a question.
  I would like to clean up the "database".  Anyone?
  const serProvider = new SerialProvider(context.globalState);
  serProvider.deactivate();
  */
}
