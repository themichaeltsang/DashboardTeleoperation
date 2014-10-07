Dashboard Telemetry
===================

A BLE central interface for the Dashboard Peripheral

__Note:__ Mac OS X is currently the only supported OS. Linux is possible, but compatability will be enabled later.

Prerequisites
___________

__Mac Computer with Bluetooth 4.0__
__Mac OSX (Tested with 10.9.2)__
__DashBoard__
__npm from Node.js__

Install
_______
    download root from github
    sudo npm install noble
    sudo npm install keypress
    sudo npm install tty
    sudo npm install fs

Usage
____
    node test2.js 
    
    press q-> red, press w-> blue, press e-> green
    press n-> get live telemetry data    

