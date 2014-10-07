Dashboard Telemetry
===================

A BLE central interface for the Dashboard Peripheral

__Note:__ Mac OS X is currently the only supported OS. Linux is possible, but compatibility will be enabled later.

Information about preparing and editing Dashboard Peripheral functionality: 
https://github.com/DashRobotics/dashboard-v1.0-firmware/tree/master/arduino%20files 

Prerequisites
-----------

* Mac Computer with Bluetooth 4.0
* Mac OSX (Tested with 10.9.2)
* DashBoard
* npm from Node.js

Install
-------
* Download root of this Dashboard Telemetry repository

__Dependencies__

    sudo npm install noble
    sudo npm install keypress
    sudo npm install tty
    sudo npm install fs

Usage
-----
__Run__:
    node test2.js 
   
    press q-> green, press w-> blue, press e-> red
    press n-> get live telemetry data    

