var MOSI = 16, MISO = 14, SDA = 2; //DONT TOUCH
// NOTES - In this file you may independently set:
//		telemetry parameters
//		dc motors: speed, turn behavior/duration
//		servos: speed, initial and final positions
//		keypress definitions for on-the-fly control
//		for Automated Behavior, visit the top of the main.js file

//EXAMPLE Parameter Definition
	define( 'pi', 3.14 );

//EDIT PARAMETERS HERE
	//TELEMETRY
		define(	'Save_All_Sensor_Data', true ); //Output to CSV file
		define(	'Rate_of_Sensor_Data_Arrival', 10 ); //(<= 100Hz) 

	//DC MOTORS
		define( 'Forward_Speed', 80 ); //1-100
		//define(	'Backward_Speed', 50 );
		define( 'R_Turn_Angular_Velocity', 70 ); //1-100
		define( 'L_Turn_Angular_Velocity', 70 );
		define( 'Turn_Duration', 300 ); //(ms)

	//SERVOS 
		define( 'Servo1_Port', MOSI );
		define( 'Servo2_Port', SDA );
		define( 'Servo3_Port', MISO );

		define( 'Servo1_Initial_Position', 0 ); //0-180 degrees
		define( 'Servo1_Final_Position', 180 ); //0-180 degrees
		define( 'Servo1_Speed',  40 ); //0=no speed, 1-255 slower to faster
		define( 'Servo2_Intitial_Position', 0 ); //0-180 degrees
		define( 'Servo2_Final_Position',  180 ); //0-180 degrees
		define( 'Servo2_Speed',  40 ); //0=no speed, 1-255 slower to faster
		define( 'Servo3_Initial_Position', 0 ); //0-180 degrees
		define( 'Servo3_Final_Position', 180 ); //0-180 degrees
		define( 'Servo3_speed',  40 );

	//KEYPRESS DEFINITIONS - trigger "on-the-fly" control
		define( 'Start_Automation1_KEY', 'p' );
		define( 'Start_Automation2_KEY', 'o' );
		define( 'Start_Automation3_KEY', 'i' );

		define(	'Run_Forward_KEY', 'w' );
		//define(	'Run_Backward_KEY', 's' );
		define( 'Turn_R_KEY', 'd' );
		define( 'Turn_L_KEY', 'a' );

		define( 'Set_Servo1_Init_Position_KEY', 'z' );
		define( 'Set_Servo1_Final_Position_KEY', 'x' );
		define( 'Set_Servo2_Init_Position_KEY', 'c' );
		define( 'Set_Servo2_Final_Position_KEY', 'v' );
		define( 'Set_Servo3_Init_Position_KEY', 'b' );
		define( 'Set_Servo3_Final_Position_KEY', 'n' );












































//DO NOT EDIT FOLLOWING LINES
function define(name, value) { Object.defineProperty(exports, name, {value: value, enumerable: true }); }
//SCK = 15, SS = 17, SCL = 3