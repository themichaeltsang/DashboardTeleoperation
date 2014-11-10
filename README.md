Dashboard Telemetry & Telecommand
===================================

A BLE central interface for the Dashboard Peripheral, for programmable telemetry and telecommand of small, lightweight robots


__Note:__ Mac OS X is currently the only supported OS. Linux is possible, but compatibility will be enabled later.

Prerequisites
-----------

* Mac (tested with 2009 macbook and newer)
* OSX (tested with 10.9.2 and newer)
* System OR Dongle Bluetooth 4.0 
* DashBoard

Install
-------
* [Install Node.js: click "INSTALL"](http://nodejs.org/)
* Download root of this Dashboard Telemetry repository
* [Learn how to customize DashBoard firmware](https://github.com/DashRobotics/dashboard-v1.0-firmware/tree/master/arduino%20files)
* Replace DashBot.cpp and DashBot.h with the files provided in this repository's folder: custom_dashboard_firmware

Bluetooth Setup
---------------
* If you have system bluetooth 4.0, skip to next section
* Else, select your bluetooth 4.0 dongle by selecting host controller in the ["Bluetooth Explorer"](http://www.geekguides.co.uk/414/how-to-select-a-bluetooth-adapter-in-os-x/) application   

Usage
-----
__Set Parameters__
 
Edit

    PARAMS.js 

__Run__

In root directory
   
    node main.js 
   
__Keypress commands__

Default 

    press w-> move forward
    press s-> move backward
    press d-> turn right
    press a-> turn left

    press p-> start specified AUTO mode
    press n-> get live telemetry data
  

Roadmap (TODO)
-------------
 * Mac OS X:
    * ~~Keypress Flash Lights~~
    * ~~Print Live Sensor Data and save to Log file~~
    * ~~Keypress Motor Control~~ 
    * SoftPWM extension for Servo Control
        * Fix Conflicts between MISO/MOSI and right(?) motor speed
    * Program Interactivity, Automation
        * ~~Keypress Turn Right, Turn Left, Go Forward, Go Backward~~
        * ~~Delayed Events~~
        * Differentiate Keydown and Keypress
	* Control Speed of Wing Flap
        * Timed Automation
        * Gyro-Assisted Steering
        * ~~Parse external file with parameters~~
    * Automated Motor Control for Self-Righting Body-Arching Project
    * Send Live IMU Sensor Data to Computer
    * Autonomous Behavior: Apply Control Theory/Machine Learning/Formal Methods Algorithms  
 * Linux 
    * TBD

Useful Links
------------
 * [Dashboard](http://dashrobotics.com/collections/frontpage/products/dashboard-rdk)
 * [Dash Robotics Open Source Code (Firmware, PCB Schematic, iOS Controller)](https://github.com/DashRobotics)
 * [node.js BLE central module](https://github.com/sandeepmistry/noble)
 * [SoftPWM for Customizing Output of Dashboard Pins](https://code.google.com/p/rogue-code/wiki/SoftPWMLibraryDocumentation)

Contact
=======

Michael Tsang <themichaeltsang@gmail.com> (2014)


Special Thanks to Dr Chen Li, Kaushik Jarayam, Dwight Swingthorpe, Mari Batilando, and Sandeep Mistry
