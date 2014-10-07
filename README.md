Dashboard Telemetry
===================

A BLE central interface for the Dashboard Peripheral

__Note:__ Mac OS X is currently the only supported OS. Linux is possible, but compatibility will be enabled later.

Prerequisites
-----------

* Mac Computer with OSX (Tested with 10.9.2) and Bluetooth 4.0
* Mac OSX (Tested with 10.9.2)
* DashBoard
* npm from Node.js

Install
-------
* Download root of this Dashboard Telemetry repository
* [Learn how to customize DashBoard firmware](https://github.com/DashRobotics/dashboard-v1.0-firmware/tree/master/arduino%20files)
* Replace DashBot.cpp and DashBot.h with the files provided in this repository's folder: custom_dashboard_firmware

__Next, Install Dependencies__

    npm install noble
    npm install keypress
    npm install fs

Usage
-----
__Run__
   
    node main.js 
   
__Keypress commands__

    press q-> green, press w-> blue, press e-> red
    press n-> get live telemetry data    

Roadmap (TODO)
-------------
 * Mac OS X:
    * ~~Keypress Flash Lights~~
    * ~~Print Live Sensor Data and save to Log file~~
    * Automated Motor Control for Self-Righting Winged Project
    * Keypress Motor Control
    * Send Live IMU Sensor Data to Computer
    * Autonomous Behavior: Apply Control Theory/Machine Learning/Formal Methods Algorithms  
 * Linux 
    * TBD

Useful Links
------------
 * [Dashboard](http://dashrobotics.com/collections/frontpage/products/dashboard-rdk)
 * [Dash Robotics Open Source Code](https://github.com/DashRobotics)
 * [node.js BLE central module](https://github.com/sandeepmistry/noble)

Contact
=======

Michael Tsang <themichaeltsang@gmail.com> (2014)

