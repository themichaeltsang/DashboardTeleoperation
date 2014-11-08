var keypress = require('keypress');
var tty = require('tty');
var noble = require('noble');
var fs = require('fs');
var async = require("async");
var sys = require("sys");
var EventEmitter = require('events').EventEmitter;

// initialize write-to-file capability - create log.txt if it doesn't exist, append to it if it exists
var log = fs.createWriteStream('sensorlog.txt', {'flags': 'a'});
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file


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
			ask("write sensor data to file? (y/n)", /(y|n)/, function(sensor) {
				ask("left motor speed (1-100)", /^(100|[1-9][0-9]|[1-9])$/, function(motorspeedL) {
					ask("right motor speed (1-100)", /^(100|[1-9][0-9]|[1-9])$/, function(motorspeedR) {
						var arr = [sensor,motorspeedL,motorspeedR];
						explore(peripheral, arr, function(){
							console.log('DONE. EXITING.');
							process.exit();
						});
					});
				});
			});
		}
	});



////////////////////////////////////////////////////////////////////////////////
// Motor, Gyro, Control functions
////////////////////////////////////////////////////////////////////////////////

//Valid SERVO Positions 5-13
function servoPositionL(pos, callback){
	global.characteristic_write.write(new Buffer([9,pos,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
}
function servoPositionR(pos, callback){
	global.characteristic_write.write(new Buffer([10,pos,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
}


function motorDriveL(motor_pwm, callback){

	if (motor_pwm < 0) {
		motor_pwm = (-1*motor_pwm) + 100;
	}
	global.characteristic_write.write(new Buffer([7,motor_pwm,1,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
}
function motorDriveR(motor_pwm, callback){
	if (motor_pwm < 0) {
		motor_pwm = (-1*motor_pwm) + 100;
	}
	global.characteristic_write.write(new Buffer([7,motor_pwm,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
}


function gyroSetup(callback)
{
	var val = 0;
	var i;

	//read the gyro 5 times in 50 ms
	//avoiding for loop implementation for now
	readGyroRaw(function(raw) {
		val += raw;
		console.log(val);
	});
	setTimeout(function(){
		readGyroRaw(function(raw) {
			val += raw;
			console.log(val);
		});
	},50);
	setTimeout(function(){
		readGyroRaw(function(raw) {
			val += raw;
			console.log(val);
		});
	},100);
	setTimeout(function(){
		readGyroRaw(function(raw) {
			val += raw;
			console.log(val);
		});
	},150);
	setTimeout(function(){
		readGyroRaw(function(raw) {
			val += raw;
			console.log(val);
			callback(val/5);
		});
	},200);
}

function readGyroRaw(callback){
	var gyro_raw;
	global.characteristic_notify.once('read', function(data, isNotification) {
		gyro_raw = data.readUInt8(3);
		//console.log(gyro_raw);
		callback(gyro_raw);
	});
	global.characteristic_notify.notify(true, function(error) {
		//console.log('telemetry notification on');
	});
}

function readGyroDeg(callback)
{
	var gyro_current;
	var gyro_init_fl;
	var gyro_deg;

	var GYRO_MAX_RANGE = 2000.0;

	gyro_current = readGyroRaw();

	//OMGARSH
	gyro_init_fl = global.gyro_init;
	gyro_deg = (gyro_current - gyro_init_fl)*(GYRO_MAX_RANGE/gyro_init_fl);
	callback(gyro_deg);

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
			R_motor = ref_pwm + (2 * abs(ref_pwm)) * (ref_yaw/MAX_YAW);    // Right motor goes from 100 to -100 (2 = (100 - (-100)) / max_pwm)
		}
		else if (ref_yaw < 0) {   // If left turn
			L_motor = ref_pwm - (2 * abs(ref_pwm)) * (ref_yaw/MAX_YAW);   // Left motor goes from 100 to -100
			R_motor = ref_pwm;    // Right motor positive
		}
	}
	// Translate yaw rate to a turning radius and amplify by 50%
	ref_yaw = 1.5*ref_yaw*abs(ref_pwm)/100; // Turn slowly if moving slowly
  
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
		mix = mix*abs(ref_pwm)/100;   // Cap mixing based on speed
		L_motor = L_motor - mix;
		R_motor = R_motor + mix;

		// Send commands
		motorDriveL(L_motor);
		motorDriveR(R_motor);
	});
  return ref_yaw;
}



////////////////////////////////////////////////////////////////////////////////
// Peripheral Commands & Sensing 
////////////////////////////////////////////////////////////////////////////////


function explore(peripheral, arr, callback) {
	var service;
	rspeed = parseInt(arr[2]);
	lspeed = parseInt(arr[1]);
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


			console.log('INITIALIZING GYRO');

			gyroSetup(function(gyro_init){
				console.log('RUNNING');
				console.log(gyro_init);
				global.gyro_init = gyro_init;
				//console.log(global.gyro_init);

				// make `process.stdin` begin emitting "keypress" events
				keypress(process.stdin);

				//motorDriveR(0,callback);
				//motorDriveL(0,callback);


				// listen for the "keypress" event
				process.stdin.on('keypress', function (ch, key) {
					if (!key){
						motorDriveL(0,callback);
						motorDriveR(0,callback);
					}
					//Keypress Ctrl c: EXIT
					if (key && key.ctrl && key.name == 'c') {
						async.waterfall([
							console.log('^c EXIT'),
							peripheral.disconnect()
					], callback);
					process.exit();

					}

					//Keypress o: Automate Wing Flapping
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

/*
					//Keypress p: Start Automation
					if (key && key.name == 'p'){

						var init_time = new Date();

						var auto_flag = 1;
						var running = 0;
						//init_time = millis();
						//while (new Date() - init_time < 1 && auto_flag == 1) {
							

						//100 ITERATIONS -> TENSECONDS
						while (running<50)	{//console.log('hi');

							motorDriveL(0, callback);
							motorDriveR(80, callback);
							//dashRun Instead		??
							//dashPacketHandler();
							running++;

						}

						console.log('done');



						/*
						var start = Date.now();
						console.log('p');
						//t = 0
						motorDriveR(rspeed, callback);

						//t = 1000
						setTimeout(function(){
							motorDriveR(lspeed, callback);
							motorDriveL(lspeed, callback);
						},1000);
						*/
					}
					//Keypress q: Set Eye Color Green
					if (key &&  key.name == 'q'){
						console.log('q');
						characteristic_write.write(new Buffer([1,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					}


					//Drive straight
					// else if (key &&  key.name == 'w' && key.shift){
					// 	console.log('^w');
					// 	motorDriveL(100,callback);
					// 	motorDriveR(100,callback);
					// }


					else if (key &&  key.name == 'w'){
						console.log('w');
						motorDriveL(100,callback);
						motorDriveR(100,callback);

						// setTimeout(function(){
						// 	motorDriveL(0,callback);
						// 	motorDriveR(0,callback);
						// },200);
					}

					//Go backwards

					// else if (key &&  key.name == 's' && key.shift){
					// 		console.log('^s');
					// 		motorDriveL(-100,callback);
					// 		motorDriveR(-100,callback);
					// 	}

					else if (key &&  key.name == 's'){
						console.log('s');
						motorDriveL(-100,callback);
						motorDriveR(-100,callback);

						// setTimeout(function(){
						// 	motorDriveL(0,callback);
						// 	motorDriveR(0,callback);
						// },200);
					}

					//Turn left
					else if (key &&  key.name == 'a'){
						console.log('a');
						motorDriveR(30,callback);


						setTimeout(function(){
							motorDriveR(0,callback);
						},400);
						//motorDriveL(0,callback);

						//characteristic_write.write(new Buffer([7,lspeed,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					}

					//Turn right
					else if (key &&  key.name == 'd'){
						console.log('d');
						motorDriveL(30,callback);
						//motorDriveR(0,callback);

						setTimeout(function(){
							motorDriveL(0,callback);
						},400);

					}
					//Keypress d: Stop Motors
					else if (key && key.name == 'f'){//turn motors off
						console.log('f');
						motorDriveR(0,callback);
						motorDriveL(0,callback);
					}



					//Keypress e: Set Eye Color Red
					else if (key &&  key.name == 'e'){
						console.log('e');
						characteristic_write.write(new Buffer([3,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					}
					//Keypress ctrl s: Speed up Motor
					else if (key &&  key.name == 's' && key.ctrl){
						if (rspeed<95){
							console.log('^s');
							rspeed = rspeed + 3;
						}
						characteristic_write.write(new Buffer([8,rspeed,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					}
					//Keypress shift s: Slow down Motor
					else if (key &&  key.name == 's' && key.shift){
						if (rspeed>5){
							console.log('sft s');
							rspeed = rspeed - 3;
						}
						characteristic_write.write(new Buffer([8,rspeed,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					}



					else if (key && key.name == 'z'){//MISO
						console.log('z');
						servoPositionL(5,callback);
					}

					else if (key && key.name == 'x'){//MISO
						console.log('x');
						servoPositionL(7,callback);

					}
					else if (key && key.name == 'c'){//MISO
						console.log('c');
						servoPositionL(9,callback);
					}
					else if (key && key.name == 'v'){//MISO
						console.log('v');
						servoPositionL(11,callback);
					}
					else if (key && key.name == 'b'){//MISO
						console.log('b');
						servoPositionL(13,callback);
					}



					else if (key && key.name == 'g'){//MOSI
						console.log('g');
						servoPositionR(5,callback);
					}

					else if (key && key.name == 'h'){//MOSI
						console.log('h');
						servoPositionR(7,callback);
					}
					else if (key && key.name == 'j'){//MOSI
						console.log('j');
						servoPositionR(9,callback);
					}
					else if (key && key.name == 'k'){//MOSI
						console.log('k');
						servoPositionR(11,callback);
					}
					else if (key && key.name == 'l'){//MOSI
						console.log('l');
						servoPositionR(13,callback);
					}

					//else if (key && key.name == 'x'){//MOSI
					//	console.log('x');
					//	characteristic_write.write(new Buffer([10,20,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					//}
					//Keypress m: Set Message
					//else if (key && key.name == 'm'){
					//	console.log('m');
					//	characteristic_write.write(new Buffer([5,'m','e','s','s','a','g','e','1','2','3','4','5',0]), true, callback);
					//}
					//Ketpress n: View and Save Sensor Data
					else if (key && key.name == 'n'){
						console.log('n');
						log.write(new Date().toString() + '\n');

						characteristic_notify.on('read', function(data, isNotification) {
							console.log(data.toString('hex'));
							log.write(data.toString('hex') + '\n');
						});
						// true to enable notify
						characteristic_notify.notify(true, function(error) {
							console.log('telemetry notification on');
						});
					}
					//Any other Keypress: Set Eye Color Null
					else{
						characteristic_write.write(new Buffer([2,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					}
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
