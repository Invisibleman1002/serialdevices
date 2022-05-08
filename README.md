# Serial Devices

This is useful for microcontroller development. It lists the Serial Device and allows for giving them an alternate name. So instead of seeing COM3, you can rename it to ESP32_SENSOR. Since Com port numbers change, it uses the DeviceID/pnpid to be more accurate for the search when checking for name.
NEW ADDITION! I added a mDNS discovery to pull in Arduino OTA devices.
When the Extension is running, it starts the discovery. Since OTA seem to be erratic, I dont clear the list while its discoering and I stop the broswer and restart it every 60 seconds. The reason for this is due to found devices may not be found again during that 60 seconds if removed.  
After 6 mimutes of scanning, it clears the list and starts again. This removes stale OTA devices. Pressing the -=Network Devices=- item, forces a clear and refresh immediately.

## Features

Pressing the scan button starts a serial device scan. It will continue to run for about 15 seconds or until a device has been plugged-in or removed.  
You can click on a Device and give it a new name.
The Red X to the right of a port removes the new name but doesn't delete the port.

I have an ESP32 Debugger that shows up as two ports.
If you notice below the serial numbers is the same for both COM16 and COM17. If I used the serial number as the search criteria, both ports would be named the same.

`{path: 'COM16', manufacturer: 'FTDI', serialNumber: '7&5261f68&0&4', pnpId: 'FTDIBUS\\VID_0403+PID_6010+7&5261F68&0&4&1\\0000', locationId: undefined, …}`

`{path: 'COM17', manufacturer: 'FTDI', serialNumber: '7&5261f68&0&4', pnpId: 'FTDIBUS\\VID_0403+PID_6010+7&5261F68&0&4&2\\0000', locationId: undefined, …}`

![COMPROGRAMMING](./assets/SerialDevices.gif)

## ?

- I switched my code to use this one. https://serialport.io/docs/

- Future version possible use https://github.com/MadLittleMods/node-usb-detection

- Would be nice if Arduino extension gave the USB port is connected to and allows to set it though another extension.

## HELP

If you have the arduino extension installed, the code will execute the command below when clicking the arduino icon.
The problem is, it just shows the QuickPick window, but wont send it the correct port. Does anyone know how to send that extension the Port update?

`commands.executeCommand("arduino.selectSerialPort", "0x0403", "0x6001")`

The above command actually runs this command:

`public async selectSerialPort(vid: string, pid: string)`

Sadly it does not work, just opens the quick pick but doesnt use the details to select the port.

## Extension Settings

## Release Notes

Initial version soon to be released after more cleanup of the code. This was my first Visual Studio Code extension and it changed so many times.

### 1.0.0

Initial release
