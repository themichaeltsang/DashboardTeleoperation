Dashboard Telemetry
===================

A BLE central interface for the Dashboard Peripheral

__Note:__ Mac OS X is currently the only supported OS. Linux is possible, but compatability will be enabled later.

Prerequisites
_____________

* Mac Computer with Bluetooth 4.0
* Mac OSX (Tested with 10.9.2)
* DashBoard
* npm from Node.js

Install
_______
download root of this Dashboard Telemetry repository
    sudo npm install noble
    sudo npm install keypress
    sudo npm install tty
    sudo npm install fs

Usage
_____
    node test2.js 
    
    press q-> green, press w-> blue, press e-> red
    press n-> get live telemetry data    

