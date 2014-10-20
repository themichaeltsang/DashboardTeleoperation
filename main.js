var keypress = require('keypress');
var tty = require('tty');
var noble = require('noble');
var fs = require('fs');
//var async = require('async');

// initialize write-to-file capability - create log.txt if it doesn't exist, append to it if it exists
var log = fs.createWriteStream('sensorlog.txt', {'flags': 'a'});
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file

process.stdin.resume();
process.stdin.setEncoding('utf8');
 
process.stdin.on('data', function (chunk) {
 process.stdout.write('data: ' + chunk);
});



//ask("Name", /.+/, function(name) {
//  ask("Email", /^.+@.+$/, function(email) {
//    console.log("Your name is: ", name);
//    console.log("Your email is:", email);
 
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
			explore(peripheral, function(){
				console.log('DONE. EXITING.');
				process.exit();
			});
		}
	});


    //process.exit();
 // });
//	});




function explore(peripheral,callback) {
	var service;
	peripheral.connect(function () {
	console.log('CONNECTED');
    // make `process.stdin` begin emitting "keypress" events
    keypress(process.stdin);
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
			// listen for the "keypress" event
			process.stdin.on('keypress', function (ch, key) {
				//Keypress Ctrl c: EXIT
				if (key && key.ctrl && key.name == 'c') {
					console.log('^c EXIT');
					characteristic_write.write(new Buffer([4,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					peripheral.disconnect();
					process.exit();
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
				//Keypress a: Control Left Motor
				else if (key &&  key.name == 'a'){
					console.log('a');
					characteristic_write.write(new Buffer([7,100,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				//Keypress s: Control Right Motor
				else if (key &&  key.name == 's'){
					console.log('s');
					characteristic_write.write(new Buffer([8,80,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				//Keypress d: Stop Motors
				else if (key && key.name == 'd'){//turn motors off
					console.log('d');
					characteristic_write.write(new Buffer([7,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					characteristic_write.write(new Buffer([8,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);

				}
				//Keypress m: Set Message
				//else if (key && key.name == 'm'){
				//	console.log('m');
				//	characteristic_write.write(new Buffer([5,'m','e','s','s','a','g','e','1','2','3','4','5',0]), true, callback);
				//}
				//Ketpress n: View and Save Sensor Data
				else if (key && key.name == 'n'){
					console.log('n');
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
					characteristic_write.write(new Buffer([4,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
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
