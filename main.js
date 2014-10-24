var keypress = require('keypress');
var tty = require('tty');
var noble = require('noble');
var fs = require('fs');
//var sys = require("sys");
var async = require("async");
//var EventEmitter = require('events').EventEmitter;

// initialize write-to-file capability - create log.txt if it doesn't exist, append to it if it exists
var log = fs.createWriteStream('sensorlog.txt', {'flags': 'a'});
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file

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

function explore(peripheral, arr, callback) {
	var service;
	peripheral.connect(function () {
	//console.log('CONNECTED');
	peripheral.discoverServices([], function (error, services) {
		service = services[3];
		console.log('RUNNING');
		// In the case that service array is empty: return error and exit
		if (!service) {
			console.log('error');
			process.exit();
		}
		service.discoverCharacteristics([], function(error, characteristics) {
			var characteristic_notify = characteristics[0];
			var characteristic_write = characteristics[1];
		    // make `process.stdin` begin emitting "keypress" events
			keypress(process.stdin);

			rspeed = parseInt(arr[2]);
			lspeed = parseInt(arr[1]);

			// listen for the "keypress" event
			process.stdin.on('keypress', function (ch, key) {
				//Keypress Ctrl c: EXIT
				if (key && key.ctrl && key.name == 'c') {
					async.waterfall([
						console.log('^c EXIT'),
						characteristic_write.write(new Buffer([2,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback),
						peripheral.disconnect()
    				], callback);
    				process.exit()

				}
				//Keypress q: Set Eye Color Green
				if (key &&  key.name == 'q'){
					console.log('q');
					characteristic_write.write(new Buffer([1,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				//Keypress w: Set Eye Color Blue
				else if (key &&  key.name == 'w'){
					console.log('w');
					characteristic_write.write(new Buffer([2,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
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

				//Keypress a: Control Left Motor
				else if (key &&  key.name == 'a'){
					console.log('a');
					characteristic_write.write(new Buffer([7,lspeed,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				//Keypress s: Control Right Motor
				else if (key &&  key.name == 's'){					
					console.log('s');
					characteristic_write.write(new Buffer([8,rspeed,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				
				//Keypress d: Stop Motors
				else if (key && key.name == 'd'){//turn motors off
					console.log('d');
					characteristic_write.write(new Buffer([7,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					characteristic_write.write(new Buffer([8,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				else if (key && key.name == 'z'){//MISO
					console.log('z');
					characteristic_write.write(new Buffer([9,5,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}

				else if (key && key.name == 'x'){//MISO
					console.log('x');
					characteristic_write.write(new Buffer([9,7,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}

				else if (key && key.name == 'c'){//MISO
					console.log('c');
					characteristic_write.write(new Buffer([9,9,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}


				else if (key && key.name == 'v'){//MISO
					console.log('v');
					characteristic_write.write(new Buffer([9,11,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				else if (key && key.name == 'b'){//MISO
					console.log('b');
					characteristic_write.write(new Buffer([9,13,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}



				else if (key && key.name == 'g'){//MOSI
					console.log('g');
					characteristic_write.write(new Buffer([10,5,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				else if (key && key.name == 'h'){//MOSI
					console.log('h');
					characteristic_write.write(new Buffer([10,7,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				else if (key && key.name == 'j'){//MOSI
					console.log('j');
					characteristic_write.write(new Buffer([10,9,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				else if (key && key.name == 'k'){//MOSI
					console.log('k');
					characteristic_write.write(new Buffer([10,11,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				else if (key && key.name == 'l'){//MOSI
					console.log('l');
					characteristic_write.write(new Buffer([10,13,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
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
						console.log(data.toString('hex') );
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
	//The following are required code for keypress
	if (typeof process.stdin.setRawMode == 'function') {
		process.stdin.setRawMode(true);
	} else {
		tty.setRawMode(true);
	}
	process.stdin.resume();
	});
}


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
