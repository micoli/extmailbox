#!/usr/bin/env node

var stomp = require('stomp');

var num = process.argv[2];

// Set to true if you want a receipt
// of all messages sent.
var receipt = true;

// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
var stomp_args = {
	port: 61613,
	host: 'localhost',
	debug: true,
	login: 'guest',
	passcode: 'guest',
}

var client = new stomp.Stomp(stomp_args);

var queue = '/queue/test_stomp';

client.connect();

client.on('connected', function() {
	num = num || 10;
	client.send({
		'destination'	: '/queue/imapNotifierActions',
		'body'			: JSON.stringify({
			action			: 'connect',
			accountId		: 'micoliAccount'		,
			user			: 'micoli@mail.local'	,
			pass			: 'micoli'				,
			host			: 'localhost'			,
			secure			: false
		}),
		'persistent'	: 'false'
	}, false);
	console.log('Produced ' + num + ' messages');
	client.disconnect();
});

client.on('receipt', function(receipt) {
	console.log("RECEIPT: " + receipt);
});

client.on('error', function(error_frame) {
	console.log(error_frame.body);
	client.disconnect();
});
