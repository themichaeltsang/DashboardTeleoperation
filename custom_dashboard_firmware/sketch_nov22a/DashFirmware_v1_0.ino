#include <SoftwareSerial.h>
#include <EEPROM.h>
#include <DashBot.h>

const int DEFAULT_BAUD = 9600;
const int SERVO_CONTROLLER_RX_PIN = MISO; // The SERVO CONTROLLER'S RX PIN.
const int SERVO_CONTROLLER_TX_PIN = MOSI; // The SERVO CONTROLLER'S TX PIN.
DashBot myrobot; //gyro, motors, controller, LEDs, eyes
SoftwareSerial ServoController = SoftwareSerial(SERVO_CONTROLLER_RX_PIN, SERVO_CONTROLLER_TX_PIN);

void setup()
{
   myrobot.dashRadioSetup();
   ServoController.begin(DEFAULT_BAUD);
   delay(500);
}


void moveServo(int ServoChannel, int target)
{
   //656ms PWM pulse represents a servo angle of 0 degrees.
   //2000ms PWM pulse represents a servo angele of 180 degrees.
   //These values could vary based on the servo you use, check your servo's 
   //spec documentation and verify what PWM pulses are needed to move it.
 
   byte serialBytes[4]; //Create the byte array object that will hold the communication packet.
 
   target = (map(target, 0, 180, 656, 2000) * 4); //Map the target angle to the corresponding PWM pulse.
 
   serialBytes[0] = 0x84; // Command byte: Set Target.
   serialBytes[1] = ServoChannel; // First byte holds channel number.
   serialBytes[2] = target & 0x7F; // Second byte holds the lower 7 bits of target.
   serialBytes[3] = (target >> 7) & 0x7F; // Third byte holds the bits 7-13 of target.
 
   ServoController.write(serialBytes, sizeof(serialBytes)); //Write the byte array to the serial port.
}

void loop()
{
   myrobot.dashPacketHandler();
   moveServo(5, 0); //Move the servo on channel 0 to an angle of 0 degrees
 //  moveServo(0, 0); //Move the servo on channel 1 to an angle of 0 degrees
   delay(2000); //Wait 2000ms
   moveServo(5, 180); //Move the servo on channel 0 to an angle of 180 degrees
   //moveServo(0, 180); //Move the servo on channel 1 to an angle of 180 degrees
   delay(2000); //Wait 2000ms
}



/*

basic Dash firmware. 
//libraries

#include <SoftwareSerial.h>
#include <PMCtrl.h>

int servonum = 5;

PMCtrl servoCtrl (MISO, MOSI, 9600); //RX, TX, Baud
DashBot myrobot; //gyro, motors, controller, LEDs, eyes

void setup() {
  myrobot.dashRadioSetup();
  //Serial.begin(9600);  // needed for console output
}

void loop(){
  myrobot.dashPacketHandler();
  //servoCtrl.setServoSpeed (0, 0, 12);

  
  Serial.println ("Beginning"); 
  Serial.println ("Now I rotate the servo - Speed 50"); 
  servoCtrl.setServoSpeed (0, servonum, 12);
  servoCtrl.setTarget (608, servonum, 12);
  delay (5000);
  servoCtrl.getPosition(servonum,12);
  Serial.print ("Position is: "); Serial.println (servoCtrl.getPosition(servonum,12));


  Serial.println ("Now I rotate the servo - Speed 15");
  servoCtrl.setServoSpeed (15, servonum, 12);
  servoCtrl.setTarget (2224, servonum, 12);
  delay (5000);
  servoCtrl.getPosition(servonum,12); Serial.print ("Position is: "); Serial.println (servoCtrl.getPosition(servonum,12));

  servoCtrl.goHome(12);
  delay (5000);

  Serial.println ("Done");
  delay (2000);  
  
}


*/
