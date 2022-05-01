# Serial Devices

This is useful for microcontroller development. It lists the Serial Device and allows for giving them an alternate name. So instead of seeing COM3, you can rename it to ESP32_SENSOR. Since Com port numbers change, it uses the DeviceID/pnpid to be more accurate for the search when checking for name.

## Features

Pressing the scan button starts a serial device scan. It will continue to run for about 15 seconds or until a device has been plugged-in or removed.  
You can click on a Device and give it a new name.
The Red X to the right of a port removes the new name but doesn't delete the port.

I have an ESP32 Debugger that show sup as two ports.
If you notive below the serial numbers is the same for both COM16 and COM17. If I used the serial number as the search criteria, both ports would be named the same.

`{path: 'COM16', manufacturer: 'FTDI', serialNumber: '7&5261f68&0&4', pnpId: 'FTDIBUS\\VID_0403+PID_6010+7&5261F68&0&4&1\\0000', locationId: undefined, …}`

`{path: 'COM17', manufacturer: 'FTDI', serialNumber: '7&5261f68&0&4', pnpId: 'FTDIBUS\\VID_0403+PID_6010+7&5261F68&0&4&2\\0000', locationId: undefined, …}`

![COMPROGRAMMING](./resources/SerialDevices.gif)

## Requirements

I had wrote my own Serial Port scanner using .NET Core as I wasnt sure the best one to use until I looked at the extension details for the Arduno VSC plugin.  
So I switched my code to use this one. https://serialport.io/docs/

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: enable/disable this extension
- `myExtension.thing`: set to `blah` to do something

## Release Notes

Initial version soon to be released after more cleanup of the code. This was my first Visual Studio Code extension and it changed so many times.

### 1.0.0

Initial release
