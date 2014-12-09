/*
basic Dash firmware. 
*/
//libraries
#include <EEPROM.h>
#include <DashBot.h>
#include <VarSpeedServo.h>

DashBot myrobot; //gyro, motors, controller, LEDs, eyes

void setup() {
  myrobot.dashRadioSetup();
}
void loop(){
  myrobot.dashPacketHandler();
}
