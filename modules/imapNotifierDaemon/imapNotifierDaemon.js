#!/usr/bin/env node

var imapNotifier = require('../../libs/node.js/Eu/sm/daemon/imapNotifier');

var daemon = new imapNotifier.Daemon({
	actionQueue	: '/queue/imapNotifierActions',
	onMessageRoot	: '/topic/imapNotifierOnMessage/'
});

daemon.connectImapAccount({
	action			: 'connect'		,
	accountId		: 'userAccountMicoli'	,
	user			: 'micoli@micoli.loc'	,
	pass			: 'micoli'		,
	host			: '192.168.1.230'	,
	secure			: false
});

daemon.start();

process.on('SIGINT', function() {
	console.log('\n daemon closing');
	daemon.stop();
	console.log('\n daemon closed');
	process.exit();
});
