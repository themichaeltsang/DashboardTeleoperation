Dashboard Programmable Teleoperation
====================================

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
* Download root of this Dashboard Teleoperation repository
* [Learn how to customize DashBoard firmware](https://github.com/DashRobotics/dashboard-v1.0-firmware/tree/master/arduino%20files)
* Replace the folder "/libraries/DashBot" [from the link above](https://github.com/DashRobotics/dashboard-v1.0-firmware/tree/master/arduino%20files) with the "/libraries" folder, found inside "custom_ardunio_files" in this repository
    * This is to ensure that the VarSpeedServo and custom DashBot library are both loaded into the DashBoard firmware

Bluetooth Setup
---------------
* If you have system bluetooth 4.0, skip to next section
* Else, select your bluetooth 4.0 dongle by selecting host controller in the ["Bluetooth Explorer"](http://www.geekguides.co.uk/414/how-to-select-a-bluetooth-adapter-in-os-x/) application   

Usage
-----
__Run__

In root directory:
   
    node main.js 
   
__Set Parameters (PARAMS.js)__

Set Keypress Definitions

    define( 'Start_Automation1_KEY', 'p' );
    define( 'Start_Automation2_KEY', 'o' );
    ...
    define( 'Run_Forward_KEY', 'a' );
    define( 'Turn_R_KEY, 'd' );
    define( 'Turn_L_KEY, 'a' );
    ...  
    define( 'Set_Servo1_Init_Position_KEY', 'z' );
    define( 'Set_Servo1_Final_Position_KEY', 'x' );
    ...

Set Telemetry Parameters

    define( 'Save_Sensor_Data', true );
    define( 'Rate_of_Sensor_Data_Arrival', 100 ); //in Hz

Set Telecommand Parameters

    //DC Motor Control
    define( 'Forward_Speed', 80 ); //unitless 1-100
    define( 'R_Turn_Angular_Velocity', 70 ); //unitless 1-100
    define( 'L_Turn_Angular_Velocity', 70 );
    define( 'Turn_Duration', 300 ); //(ms)
    ...
    //Servo Control
    define( 'Servo1_Port', MOSI );
    define( 'Servo1_Initial_Position', 0 ); //0-180 degrees
    define( 'Servo1_Final_Position', 180 ); //0-180 degrees
    define( 'Servo1_Speed',  40 ); //0=no speed, 1-255 slower to faster
    ...

__Functions (main.js)__

Control DC Motor

    motorDrive(left speed, right speed, run duration); //speed 0-100, run duration 0-16777215ms 

Control Servos 1, 2, and 3

    servo1_control(position, speed); //position 0-180 deg, speed 0-255 (50 recommended)
    servo2_control(position, speed); //position 0-180 deg, speed 0-255  "
    servo3_control(position, speed); //position 0-180 deg, speed 0-255  "

Read Yaw Rate

    readGyroDeg(function(yaw_rate){
        //YOUR CODE HERE that depends on yaw_rate
    });

Read Ambient Light Intensity

     readAmbLight(function(amb_light){
        //YOUR CODE HERE that depends on amb_light
    });   

Read L and R Proximity

    readLeftProximity(function(l_IR)){
        //YOUR CODE HERE that depends on l_IR
    });

    readRightProximity(function(r_IR)){
        //YOUR CODE HERE that depends on r_IR
    });


__Examples (main.js)__

Automated Behvaior: in automode_sketch1, automode_sketch2, or automode_sketch3

    function automode_sketch1() {

        servo1_control(180, 50); //t_0
        setTimeout(function(){
            motorDrive(100,100,800);
            servo2_control(0, 50);
            }, 100 //t_1 (ms)
        );
        setTimeout(function(){
            motorDrive(100,50,300);
            }, 1000 //t_2
        );
        setTimeout(function(){
            servo1_control(0, 50);
            servo2_control(0, 50);
            }, 4000 //t_3
        );
    }

    function automode_sketch2() {
        //YOUR CODE HERE
    }
    
    function automode_sketch3() {
        //YOUR CODE HERE
    }

Cascade Sensor Reads

    function automode_sketch1() {
        readAmbLight(function(amb_light){
            readGyroDeg(function(yaw_rate){
                //YOUR CODE HERE that depends on yaw_rate and amb_light
            });
        }); 
    }


Saved Data
-----------
Telemetric sensor data is automatically saved and appended in sensorlog.csv
Use spreadsheet program to open filetype csv 

Roadmap (TODO)
-------------
 * Mac OS X:
    * ~~Keypress Flash Lights~~
    * ~~Print Live Sensor Data and save to Log file~~
    * ~~Keypress Motor Control~~
    * ~~Automated Behavior~~ 
    * ~~VarSpeedServo extension for Servo Control~~
	* ~~Control PWM at ports (currently MISO, MOSI, and SDA work)~~
        * Fix timer conflicts for backwards right or left motor speed
    * ~~Program Interactivity, Automation~~
        * ~~Keypress Turn Right, Turn Left, Go Forward~~
        * ~~Delayed Events~~
        * ~~Control Servo Speed~~
        * ~~Timed Automation~~
        * ~~Gyro-Assisted Steering~~
        * ~~Parse external file with parameters~~
    * Automated Motor Control for Self-Righting Project
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
