var keypress = require('keypress');
var tty = require('tty');
var noble = require('noble');
var fs = require('fs');


// initialize write-to-file capability - create log.txt if it doesn't exist, append to it if it exists
var log = fs.createWriteStream('log.txt', {'flags': 'a'});
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file


noble.on('stateChange', function(state) {
	console.log('SEARCHING FOR DASH');
	if (state === 'poweredOn') {
		noble.startScanning();
	} else {
		noble.stopScanning();
	}
});

noble.on('discover', function(peripheral) {

	if (peripheral.advertisement.localName === 'Dash v1.0') {
		noble.stopScanning();
		console.log('DASH DISCOVERED');
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

function explore(peripheral,callback) {
	//console.log('services and characteristics:');
	//console.log('IN EXPOLORE');
	var service;
	peripheral.connect(function () {
	console.log('CONNECTED');
      // make `process.stdin` begin emitting "keypress" events
     keypress(process.stdin);
// listen for the "keypress" event
	peripheral.discoverServices([], function (error, services) {
		service = services[3];
		console.log('RUNNING');
		if (!service) {
			console.log('error');
			process.exit();
		}
		service.discoverCharacteristics([], function(error, characteristics) {
			var characteristic_notify = characteristics[0];
			var characteristic_write = characteristics[1];
			process.stdin.on('keypress', function (ch, key) {
				if (key && key.ctrl && key.name == 'c') {
					console.log('hi');
					characteristic_write.write(new Buffer([4,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					peripheral.disconnect();
					process.exit();
				}
				if (key &&  key.name == 'q'){//set eye color green
					console.log('q');
					characteristic_write.write(new Buffer([1,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				else if (key &&  key.name == 'w'){//set eye color blue
					console.log('w');
					characteristic_write.write(new Buffer([2,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				else if (key &&  key.name == 'e'){//set eye color red
					console.log('e');
					characteristic_write.write(new Buffer([3,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				else if (key && key.name == 'p'){//clear eye color clear
					console.log('p');
					characteristic_write.write(new Buffer([4,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
				}
				//else if (key && key.name == 'm'){//set message
				//	console.log('m');
				//	characteristic_write.write(new Buffer([5,'m','e','s','s','a','g','e','1','2','3','4','5',0]), true, callback);
				//}
				else if (key && key.name == 'n'){//set peripheral emitting, setInfoPacketMode
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
			//look in setInfoPacketMode, need to figure out how to read message
				else if (key && key.name == 'r'){
					for (i = 0; i<3; i++){
						characteristic_write.write(new Buffer([1,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
						setTimeout(characteristic_write.write(new Buffer([2,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback),3000);
						characteristic_write.write(new Buffer([2,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
						//characteristic.write(new Buffer([3,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
						//characteristic.write(new Buffer([4,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);
					}
				}
				else{
					characteristic_write.write(new Buffer([4,0,0,0,0,0,0,0,0,0,0,0,0,0]), true, callback);

				}
				//console.log('got "keypress"', key.name);
			});
		});
	});
	//console.log('got "keypress"', key);
	if (typeof process.stdin.setRawMode == 'function') {
		process.stdin.setRawMode(true);
	} else {
		tty.setRawMode(true);
	}
	process.stdin.resume();
	});
}