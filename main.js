////////////////////////////////////////////////////////////////////////////////
// Automode - Remotely program your controller
// setTimeout is similar to delay
// setTimeout wraps a block of code that all runs at the same time
// The x'th setTimeout block runs at time = t_x (in ms)
//
// Commands:
// motorDrive(left motor speed, right motor speed, duration of run)
//	- motor speed: 0-100, duration of run: 0-16777215ms
// servox_control(target position, speed to reach position)
//  - target position: 0-180 degrees, speed: 0-255 (50 recommended)
////////////////////////////////////////////////////////////////////////////////


//Example Sketch - Conventional Sequence
function automode_sketch1() {
	
	servo1_control(180, 50); //t_0
	setTimeout(function(){
		motorDrive(100,100,800);
		servo2_control(0, 50);
		}, 100 //t_1 (ms)
	);
	setTimeout(function(){
		motorDrive(100,50,800);
		}, 1000 //t_2
	);
	setTimeout(function(){
		motorDrive(60,100,3000);
		servo2_control(180, 50);
		}, 2000 //t_3
	);
	setTimeout(function(){
		servo1_control(0, 50);
		servo2_control(0, 50);
		}, 4000 //t_4
	);
}





//Example Sketch - with "For" Loop
function automode_sketch2() {

	for(var i = 0; i <= 180; i += 30){
		(function(i) {
			setTimeout(function() {
					servo1_control(i,50);
					servo2_control(i,50);
				}, 50*i
			);
			setTimeout(function() {
					servo1_control(180,50);
					servo2_control(180,50);
				}, 500 + 50*i
			);
		})(i);
	}
}






//Create your own. Feel Free to edit sketch 1 and sketch 2.
function automode_sketch3() {

		//YOUR CODE HERE

}


























































var keypress = require('keypress');
var tty = require('tty');
var noble = require('noble');
var fs = require('fs');
var async = require("async");
var sys = require("sys");
var EventEmitter = require('events').EventEmitter;
var params = require("./PARAMS");



////////////////////////////////////////////////////////////////////////////////
// Bluetooth Discovery, Handle Input Requests
////////////////////////////////////////////////////////////////////////////////

	noble.on('stateChange', function(state) {
		console.log('SEARCHING FOR DASH');
		if (state === 'poweredOn') {
			noble.startScanning();
		} else {
			noble.stopScanning();
		}
	});

	//Discover Dashboard Peripheral
	noble.on('discover', function(peripheral) {
		if (peripheral.advertisement.localName === 'Dash v1.0') {
			noble.stopScanning();
			console.log('DASH DISCOVERED');
			//UNCOMMENT THE FOLLOWING TO GET INFO ABOUT THE PERIPHERAL
			
			//var advertisement = peripheral.advertisement;
			//var localName = advertisement.localName;
			//var txPowerLevel = advertisement.txPowerLevel;
			//var manufacturerData = advertisement.manufacturerData;
			//var serviceData = advertisement.serviceData;
			//var serviceUuids = advertisement.serviceUuids;	
			//var serviceUuids = advertisement.serviceUuids;

			peripheral.on('disconnect', function() {
				process.exit(0);
			});

			explore(peripheral, function(){
				console.log('DONE. EXITING.');
				process.exit();
			});
			// ask("write sensor data to file? (y/n)", /(y|n)/, function(sensor) {
			// 	ask("left motor speed (1-100)", /^(100|[1-9][0-9]|[1-9])$/, function(motorspeedL) {
			// 		ask("right motor speed (1-100)", /^(100|[1-9][0-9]|[1-9])$/, function(motorspeedR) {
			// 			var arr = [sensor,motorspeedL,motorspeedR];
			// 			explore(peripheral, arr, function(){
			// 				console.log('DONE. EXITING.');
			// 				process.exit();
			// 			});
			// 		});
			// 	});
			// });
		}
	});


////////////////////////////////////////////////////////////////////////////////
// Telemetry functions
////////////////////////////////////////////////////////////////////////////////

function gyroSetup(callback)
{
	var val = 0;
	var i;

	//read the gyro 5 times in 50 ms
	//avoiding for loop implementation for now
	readGyroDeg(function(raw) {
		val += raw;
		//console.log(val);
	});
	setTimeout(function(){
		readGyroDeg(function(raw) {
			val += raw;
			//console.log(val);
		});
	},50);
	setTimeout(function(){
		readGyroDeg(function(raw) {
			val += raw;
			//console.log(val);
		});
	},100);
	setTimeout(function(){
		readGyroDeg(function(raw) {
			val += raw;
			//console.log(val);
		});
	},150);
	setTimeout(function(){
		readGyroDeg(function(raw) {
			val += raw;
			//console.log(val);
			callback();
		});
	},200);
}

function readGyroDeg(callback){
	var gyro_deg;
	global.characteristic_notify.once('read', function(data, isNotification) {
		//gyro_raw = data.readUInt8(3);

		gyro_deg =  (data.readUInt8(2) << 8) + data.readUInt8(3);
		if (gyro_deg > global.GYRO_MAX_RANGE) {
			gyro_deg = -1*(gyro_deg-global.GYRO_MAX_RANGE);
		}

		//console.log(gyro_raw);
		callback(gyro_deg);
	});
	global.characteristic_notify.notify(true, function(error) {
		//console.log('telemetry notification on');
	});
}

function setSensorEmitDelay(delay, callback){
	global.characteristic_write.write(new Buffer([8,delay,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
}


////////////////////////////////////////////////////////////////////////////////
// Telecommand functions
////////////////////////////////////////////////////////////////////////////////

function servo1_control(degree, speed, callback){
	global.characteristic_write.write(new Buffer([9,degree,speed,1,0,0,0,0,0,0,0,0,0,0]), true, callback);
}
function servo2_control(degree, speed, callback){
	global.characteristic_write.write(new Buffer([9,degree,speed,2,0,0,0,0,0,0,0,0,0,0]), true, callback);
}
function servo3_control(degree, speed, callback){
	global.characteristic_write.write(new Buffer([9,degree,speed,3,0,0,0,0,0,0,0,0,0,0]), true, callback);
}


function motorDrive(motorL_pwm, motorR_pwm, duration, callback){
	if (motorR_pwm < 0) {
		motorR_pwm = (-1*motorR_pwm) + 100;
	}
	if (motorL_pwm < 0) {
		motorL_pwm = (-1*motorL_pwm) + 100;
	}
	var buf  = new Buffer([7,motorL_pwm,motorR_pwm,duration>>16,duration>>8,duration,0,0,0,0,0,0,0,0]);
	global.characteristic_write.write(buf, true, callback);
}

function motorDriveR(motor_pwm, callback){
	if (motor_pwm < 0) {
		motor_pwm = (-1*motor_pwm) + 100;
	}
	global.characteristic_write.write(new Buffer([12,motor_pwm,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
}

function motorDriveL(motor_pwm, callback){
	if (motor_pwm < 0) {
		motor_pwm = (-1*motor_pwm) + 100;
	}
	global.characteristic_write.write(new Buffer([13,motor_pwm,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
}



//With Gyro-Assisted Steering
function dashRun(ref_pwm, ref_yaw){
  // yaw ranges from -400 to 400 (degrees per sec) from iPad
  // pwm ranges from -100 to 100 (duty cycle) from iPad
  // gyro feedback sttering for Dash. implements PI control law with anti-windup
	var P_GAIN = 0.1;
	var I_GAIN = 0.0005;
	var ANTIWINDUP = 20/0.0005;
	var MAX_YAW = 400;

	var L_motor;
	var R_motor;
	var err;
	var mix;

	// Baseline PWM values
	L_motor = ref_pwm;
	R_motor = ref_pwm;

	// Scale PWM based on dirction (forward and backward) and target yaw rate
	if (ref_pwm > 0) {
		if (ref_yaw < 0) {   // If right turn
			L_motor = ref_pwm;   // Left motor positive
			R_motor = ref_pwm + (2 * ref_pwm) * (ref_yaw/MAX_YAW);    // Right motor goes from 100 to -100
		}
		else if (ref_yaw > 0) {   // If left turn
			L_motor = ref_pwm - (2 * ref_pwm) * (ref_yaw/MAX_YAW);   // Left motor goes from 100 to -100 (2 = (100 - (-100)) / max_pwm)
			R_motor = ref_pwm;    // Right motor positive
		}
	}
	else {
		if (ref_yaw > 0) {   // If right turn
			L_motor = ref_pwm;   // Left motor positive
			R_motor = ref_pwm + (2 * Math.abs(ref_pwm)) * (ref_yaw/MAX_YAW);    // Right motor goes from 100 to -100 (2 = (100 - (-100)) / max_pwm)
		}
		else if (ref_yaw < 0) {   // If left turn
			L_motor = ref_pwm - (2 * Math.abs(ref_pwm)) * (ref_yaw/MAX_YAW);   // Left motor goes from 100 to -100
			R_motor = ref_pwm;    // Right motor positive
		}
	}
	// Translate yaw rate to a turning radius and amplify by 50%
	ref_yaw = 1.5*ref_yaw*Math.abs(ref_pwm)/100; // Turn slowly if moving slowly
  
    //PI controller with anti-windup
	readGyroDeg(function(gyro_deg){
		err = ref_yaw - gyro_deg;
		global.err_integral = global.err_integral + err;
		if (global.err_integral > ANTIWINDUP) {
			global.err_integral = ANTIWINDUP;
		}
		else if (global.err_integral < -ANTIWINDUP){
			global.err_integral = -ANTIWINDUP;
		}
		mix = P_GAIN*err+I_GAIN*global.err_integral;
		mix = mix*Math.abs(ref_pwm)/100;   // Cap mixing based on speed
		L_motor = L_motor - mix;
		R_motor = R_motor + mix;

		// Send commands
		motorDriveL(R_motor);
		motorDriveR(L_motor);
	});
  return ref_yaw;
}

function setServoPortDefinitions(servo1, servo2, servo3, callback){
	global.characteristic_write.write(new Buffer([11,servo1,servo2,servo3,0,0,0,0,0,0,0,0,0,0]), true, callback);
}


// initialize write-to-file capability - create log.txt if it doesn't exist, append to it if it exists
var log = fs.createWriteStream('sensorlog.csv', {'flags': 'a'});
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file



////////////////////////////////////////////////////////////////////////////////
// Peripheral Commands & Sensing 
////////////////////////////////////////////////////////////////////////////////


function explore(peripheral, arr, callback) {
	var service;
	//rspeed = parseInt(arr[2]);
	//lspeed = parseInt(arr[1]);
	global.err_integral = 0;
	peripheral.connect(function () {
	//console.log('CONNECTED');
	peripheral.discoverServices([], function (error, services) {
		service = services[3];
		// In the case that service array is empty: return error and exit
		if (!service) {
			console.log('error');
			process.exit();
		}
		service.discoverCharacteristics([], function(error, characteristics) {
			var characteristic_notify = characteristics[0];
			var characteristic_write = characteristics[1];
			global.characteristic_notify = characteristics[0];
			global.characteristic_write = characteristics[1];


			console.log('\tInitializing gyro');

			gyroSetup(function(gyro_init){

				//console.log(gyro_init);
				global.gyro_init = gyro_init;
				global.GYRO_MAX_RANGE = 2000.0;
				//console.log(global.gyro_init);

	
				var sensorperiod = 1000/params.Rate_of_Sensor_Data_Arrival;
				setSensorEmitDelay(sensorperiod, callback);
				setServoPortDefinitions(params.Servo1_Port, params.Servo2_Port, params.Servo3_Port, callback);

				// make `process.stdin` begin emitting "keypress" events
				keypress(process.stdin);


				if (params.Save_All_Sensor_Data){
					console.log('\tSaving sensor data, appended to sensorlog.csv');
					var dateobj = new Date();
					var datestr = dateobj.toString();
					var start = dateobj.getTime();
					log.write('Sensor Data: ' + datestr + '\n');
					log.write('Expected Time (ms),Actual Time (ms),Yaw Rate (deg/sec),Ambient Light,L Proximity,R Proximity,L Motor(%),R Motor (%)\n');
					var t = 0;

					characteristic_notify.on('read', function(data, isNotification) {
						var gyro_deg =  (data.readUInt8(2) << 8) + data.readUInt8(3);
						if (gyro_deg > 2000){
							gyro_deg = -1*(gyro_deg-2000);
						}
						var amb_light = (data.readUInt8(4) << 8) + data.readUInt8(5);
						var l_IR = (data.readUInt8(6) << 8) + data.readUInt8(7);
						var r_IR = (data.readUInt8(8) << 8) + data.readUInt8(9);
						var motor_right_backward = data.readUInt8(10);
						var motor_right_forward = data.readUInt8(11);
						var motor_left_backward = data.readUInt8(12);
						var motor_left_forward = data.readUInt8(13);
						var motorL = parseInt((motor_left_forward - motor_left_backward)*100.0/255.0);
						var motorR = parseInt((motor_right_forward - motor_right_backward)*100.0/255.0);
						var writestr = t +','+ (new Date().getTime() - start) + ',' + gyro_deg + ',' + amb_light + ',' + l_IR + ',' + r_IR + ',' + motorL + ',' +  motorR + '\n';
						log.write(writestr);
						//console.log(writestr);
						t = t + sensorperiod;

					});
				}
				console.log('RUNNING...');
				console.log('');
				console.log('Press keys defined in PARAMS.js:');
				console.log('\tStart Automode1: ' + params.Start_Automation1_KEY);
				console.log('\tStart Automode2: ' + params.Start_Automation2_KEY);
				console.log('\tStart Automode3: ' + params.Start_Automation3_KEY);
				console.log('\tRun Forward: ' + params.Run_Forward_KEY);
				console.log('\tTurn Right: ' + params.Turn_R_KEY);
				console.log('\tTurn Left: ' + params.Turn_L_KEY);
				console.log('\tSet Servo1 initial: ' + params.Set_Servo1_Init_Position_KEY);
				console.log('\tSet Servo1 final: ' + params.Set_Servo1_Final_Position_KEY);
				console.log('\tSet Servo2 initial: ' + params.Set_Servo2_Init_Position_KEY);
				console.log('\tSet Servo2 final: ' + params.Set_Servo2_Final_Position_KEY);
				console.log('\tSet Servo3 initial: ' + params.Set_Servo3_Init_Position_KEY);
				console.log('\tSet Servo3 final: ' + params.Set_Servo3_Final_Position_KEY);


				// listen for the "keypress" event
				process.stdin.on('keypress', function (ch, key) {
					//Keypress Ctrl c: EXIT
					if (key && key.ctrl && key.name == 'c') {
						async.waterfall([
							console.log('^c EXIT'),
							peripheral.disconnect()
					], callback);
					process.exit();

					}
					//Keypress o: Automate Wing Flapping
					/*
					if (key && key.name == 'o'){
						//Initialize with wings down
						console.log('o');
						//t = 0 ms
						for(var i = 7; i < 13; i+= 2){
							(function(i) {
								setTimeout(function() {
									servoPositionL(i,callback); //NEVER SET ServoPositionL to 5 
									servoPositionR(i,callback);
								}, (i-7)*1000); // t = (i-7)*1000 ms
								setTimeout(function() {
									servoPositionL(13,callback); //NEVER SET ServoPositionL to 5 
									servoPositionR(13,callback);
								}, (i-7)*1000+700);
							})(i);
						}
					}
					*/
					//Keypress p: Start Automation
					if (key && key.name == params.Start_Automation1_KEY){
						console.log(params.Start_Automation1_KEY);
						automode_sketch1(callback);
					}

					if (key && key.name == params.Start_Automation2_KEY){
						console.log(params.Start_Automation2_KEY);
						automode_sketch2(callback);
					}

					if (key && key.name == params.Start_Automation3_KEY){
						console.log(params.Start_Automation3_KEY);
						automode_sketch3(callback);
					}

					//Drive straight
					else if (key &&  key.name == params.Run_Forward_KEY){
						console.log(params.Run_Forward_KEY);
						//dashRun(70,90);
						motorDriveR(params.Forward_Speed);
						motorDriveL(params.Forward_Speed);
						//motorDrive(params.Forward_Speed, params.Forward_Speed, 1, callback);
					}

					//Drive backwards
					else if (key &&  key.name == params.Run_Backward_KEY){
						console.log(params.Run_Backward_KEY);
						motorDrive(params.Backward_Speed, params.Backward_Speed, 1, callback);
					}

					//Turn left
					else if (key &&  key.name == params.Turn_R_KEY){
						console.log(params.Turn_R_KEY);	
						motorDrive(0, params.R_Turn_Angular_Velocity, 100, callback);
						setTimeout(function(){
							motorDrive(0, 0, 10, callback);

						},params.Turn_Duration);
					}

					//Turn right
					else if (key &&  key.name == params.Turn_L_KEY){
						console.log(params.Turn_L_KEY);
						motorDrive(params.L_Turn_Angular_Velocity, 0, 100, callback);
						setTimeout(function(){
							motorDrive(0, 0, 10, callback);

						},params.Turn_Duration);
					}

					else if (key && key.name == params.Set_Servo1_Init_Position_KEY){
						console.log(params.Set_Servo1_Init_Position_KEY);
						servo1_control(params.Servo1_Initial_Position, params.Servo1_Speed, callback);
					}
					else if (key && key.name == params.Set_Servo1_Final_Position_KEY){
						console.log(params.Set_Servo1_Final_Position_KEY);
						servo1_control(params.Servo1_Final_Position, params.Servo1_Speed, callback);
					}
					else if (key && key.name == params.Set_Servo2_Init_Position_KEY){
						console.log(params.Set_Servo2_Init_Position_KEY);
						servo2_control(params.Servo2_Initial_Position, params.Servo2_Speed, callback);
					}
					else if (key && key.name == params.Set_Servo2_Final_Position_KEY){
						console.log(params.Set_Servo2_Final_Position_KEY);
						servo2_control(params.Servo2_Final_Position, params.Servo2_Speed, callback);
					}
					else if (key && key.name == params.Set_Servo3_Init_Position_KEY){
						console.log(params.Set_Servo3_Init_Position_KEY);
						servo3_control(params.Servo3_Initial_Position, params.Servo3_speed, callback);
					}
					else if (key && key.name == params.Set_Servo3_Final_Position_KEY){
						console.log(params.Set_Servo3_Final_Position_KEY);
						servo3_control(params.Servo3_Final_Position, params.Servo3_speed, callback);
					}


					// Keypress e: Set Eye Color Red
					// else if (key &&  key.name == 'e'){
					// 	console.log('e');
					// 	characteristic_write.write(new Buffer([3,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					// }
					// //Keypress q: Set Eye Color Green
					// if (key &&  key.name == 'q'){
					// 	console.log('q');
					// 	characteristic_write.write(new Buffer([1,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					// }
					// Keypress ctrl s: Speed up Motor
					// else if (key &&  key.name == 's' && key.ctrl){
					// 	if (rspeed<95){
					// 		console.log('^s');
					// 		rspeed = rspeed + 3;
					// 	}
					// 	characteristic_write.write(new Buffer([8,rspeed,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					// }
					// Keypress shift s: Slow down Motor
					// else if (key &&  key.name == 's' && key.shift){
					// 	if (rspeed>5){
					// 		console.log('sft s');
					// 		rspeed = rspeed - 3;
					// 	}
					// 	characteristic_write.write(new Buffer([8,rspeed,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					// }
					// Keypress m: Set Message
					// else if (key && key.name == 'm'){
					// 	console.log('m');
					// 	characteristic_write.write(new Buffer([5,'m','e','s','s','a','g','e','1','2','3','4','5',0]), true, callback);
					// }
					// Set Eye Color Blue
					// else{
					// 	characteristic_write.write(new Buffer([2,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					// }
					
				});
			});
		});
	});
	//The following are required code for keypress
	if (typeof process.stdin.setRawMode == 'function') {
		process.stdin.setRawMode(true);
	} else {
		tty.setRawMode(true);
	}
	process.stdin.resume();
	});
}


////////////////////////////////////////////////////////////////////////////////
// Question Handler function
////////////////////////////////////////////////////////////////////////////////

function ask(question, format, callback) {
	var stdin = process.stdin, stdout = process.stdout;
	stdin.resume();
	stdout.write(question + ": ");
	stdin.once('data', function(data) {
		data = data.toString().trim();
		if (format.test(data)) {
			callback(data);
		} else {
			stdout.write("It should match: "+ format +"\n");
			ask(question, format, callback);
		}
	});
}
