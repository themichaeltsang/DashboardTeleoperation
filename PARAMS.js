// NOTES - In this file you may independently set:
//		motors: speed, turn behavior/duration
//		servos: wingflap speed, initial and final wing positions
//		automatated behavior: when to flap wings or turn while running, when to stop running
//		keypress definitions for on-the-fly control

//EXAMPLE Parameter Definition
	define( 'pi', 3.14 );

//EDIT PARAMETERS HERE
	//TELEMETRY
		define(	'Save_Sensor_Data', true );//~~
		define(	'Delay_between_Sensor_Readings', 50 ); //(ms)~~
		define( 'Notify_Significant_Changes_in_Live_Sensor_Data', true);

	//TELECOMMAND
		//~~MOTORS - set running behavior~~
		define( 'Forward_Speed', 80 ); //1-100
		define(	'Backward_Speed', 100 );
		define( 'R_Turn_Angular_Velocity', 70 ); //1-100
		define( 'L_Turn_Angular_Velocity', 70 );
		define( 'Turn_Duration', 300 ); //(ms)

		//SERVOS - set wing behavior
		define( 'Initial_L_Wing_Position', WING_UP ); //Wings Up or Down
		define( 'Initial_R_Wing_Position', WING_UP );
		define( 'Final_L_Wing_Position', WING_DOWN );
		define( 'Final_R_Wing_Position', WING_DOWN );
		define( 'L_Wing_Flap_Speed',  FAST );
		define( 'R_Wing_Flap_Speed',  SLOW );
	
	//AUTOMATED behavior - "AUTO"
		define( 'AUTO_MODE',  RUN_FORWARD ); //RUN_FORWARD, RUN_BACKWARD (Gyro-Assisted)
		define( 'AUTO_TIME_LIMIT', 5000 ); //(ms)

		define( 'Delay_L_Wing_Flap_From_AUTO_Start', 100 ); //(ms)	
		define( 'Delay_R_Wing_Flap_From_AUTO_Start', 100 );
		define( 'Delay_L_Turn_From_AUTO_Start', 30 ); //(ms)
		define( 'Delay_R_Turn_From_AUTO_Start', 40 );

	//KEYPRESS DEFINITIONS - trigger "on-the-fly" control
		define(	'Run_Forward_KEY', 'w' );//~~
		define(	'Run_Backward_KEY', 's' );//~~
		define( 'Turn_R_KEY', 'd' );//~~
		define( 'Turn_L_KEY', 'a' );//~~
		define( 'Flap_L_Wing_Up_KEY', 'upkey' );
		define( 'Flap_R_Wing_Up_KEY', 'upkey' );
		define( 'Flap_L_Wing_Down_KEY', 'downkey' );
		define( 'Flap_R_Wing_Down_KEY', 'downkey' );
		define( 'Start_Stop_Automation_KEY', 'p' );






//DO NOT EDIT FOLLOWING LINES
function define(name, value) { Object.defineProperty(exports, name, {value: value, enumerable: true }); }
var WING_DOWN = 0, WING_UP = 1, SLOW = 0, FAST = 1, RUN_FORWARD = 0, RUN_BACKWARD = 1;