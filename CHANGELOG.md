# Change Log

## [unreleased]

- Do a better job at getting the arduino.json on intial startup.

## [1.0.4] - 06/06/2022

- Added interactive "telnet" capability.

## [1.0.3] - 05/17/2022

### Added

- Added some undefined checks in case of new arduino.json file.
- Dropped `.ino` from the sketch name.

## [1.0.2] - 05/16/2022

### Added

- Doing a Serial Scan also refreshes the OTA list and restarts a new scan.
- The COM description now shows the name of the sketch.

## [1.0.1] - 05/15/2022

### Added

- When OTA does a refresh, it also reloads the renamed database. So if you renamed a Device in another VC Code window, it will eventually show up in other windows as well. You can manually force the refresh by using the command: `Serial ​Devices: Refresh MDNS`, by clicking `-=Refresh Network=-`, or by Staring another Serial scan.
- Created the change log file.

## [1.0.0] - 05/15/2022

- Initial release - I want to make some updates to the arduino.json file reading but think this is ready for others to play with.
