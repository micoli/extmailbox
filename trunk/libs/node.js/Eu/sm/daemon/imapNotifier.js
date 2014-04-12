// /usr/local/Cellar/activemq/5.9.0/bin
// ./activemq start
/*
 *

var mailListener = new MailListener({
	username : "micoli@mail.local",
	password : "micoli",
	host : "localhost",
	port : 143, // imap port
	secure : false, // use secure connection
	mailbox : "INBOX", // mailbox to monitor
	markSeen : false, // all fetched email willbe marked as seen and not
	fetchUnreadOnStart : false// use it only if you want to get all unread email on lib start. Default is`false`
});

mailListener.start();

mailListener.on("server:connected", function() {
	console.log("imapConnected");
});

mailListener.on("mail:arrived", function(id) {
	console.log("new mail arrived with id:" + id);
});
*/
var util			= require('util');
var stomp			= require('stomp');
var MailListener	= require('./mail.listener');
var logger			= require('node-logging');
var _				= require('underscore');

module.exports.Daemon = Daemon;

function Daemon(config){
	var that = this;
	this.config=config;
	_.defaults(this.config,{
		debug		: false,
		host		: 'localhost',
		port		: 61613,
		login		: 'guest',
		pass		: 'guest',
		actionQueue	: '/queue/test'
	});

	that.imapAccounts = {};
	that.initStompClient();
}

//util.inherits(Daemon, Stream);
Daemon.prototype.start = function(){
	var that = this;
	that.stompClient.connect();
}

Daemon.prototype.stop = function(){
	var that = this;
	for (var accountId in that.imapAccounts){
		if(that.imapAccounts.hasOwnProperty(accountId)){
			logger.inf('closing '+accountId);
			that.imapAccounts[accountId].stop();
		}
	}
	that.stompClient.disconnect();
}

Daemon.prototype.initStompClient = function(){
	var that = this;

	that.stompClient = new stomp.Stomp({
		host		: this.config.host,
		port		: this.config.port,
		login		: this.config.login,
		passcode	: this.config.pass,
	});

	that.stompClient.on('connected', function() {
		that.stompClient.subscribe({
			destination	: that.config.actionQueue,
			ack			: 'client',
			//'activemq.prefetchSize': '10'
		});
		logger.inf('Connected');
	});

	that.stompClient.on('message', function(msg){
		that.onMessage.call(that,msg);
	});

	that.stompClient.on('error', function(error_frame) {
		logger.inf(error_frame.body);
		that.stompClient.disconnect();
	});
}

Daemon.prototype.onMessage = function(message){
	var that = this;
	var msg = {};
	try{
		msg = JSON.parse(message.body)
	}catch(Exception){
		logger.inf('error decoding',message.body);
	}
	switch(msg.action){
		case 'connect':
			that.connectImapAccount(msg);
			break;
		case 'close':
			that.closeImapAccount(msg);
		break;
	}
	that.stompClient.ack(message.headers['message-id']);
}

/**
 * accountId
 * host
 * port
 * secure
 * user
 * pass
 * mailbox
 */
Daemon.prototype.connectImapAccount = function(msg){
	var that=this;
	if(!that.imapAccounts[msg.accountId]){
		logger.inf('new client connection : '+msg.accountId);
		that.imapAccounts[msg.accountId] = new imapStompNotifier({
			accountId		: msg.accountId,
			user			: msg.user					,
			pass			: msg.pass					,
			host			: msg.host					,
			port			: msg.port		|| 143		,
			secure			: (msg.hasOwnProperty('secure'))?msg.secure:true,
			mailbox			: msg.mailbox	|| "INBOX"	,
			stompClient		: that.stompClient,
			onMessageRoot	: that.config.onMessageRoot
		});
	}else{
		logger.inf('client connection already exists : '+msg.accountId);
	}
}

/*
// 'activemq.prefetchSize' is optional.
// Specified number will 'fetch' that many messages
// and dump it to the client.
 */



function imapStompNotifier(config){
	var that = this;
	that.config=config;
	that.mailListener = new MailListener({
		username			: that.config.user		,
		password			: that.config.pass		,
		host				: that.config.host		,
		port				: that.config.port		,
		secure				: that.config.secure	,
		mailbox				: that.config.mailbox	,
		markSeen			: false					,
		fetchUnreadOnStart	: false
	});


	that.mailListener.on("server:connected", function() {
		logger.inf("imapConnected " + that.config.accountId);
	});

	that.mailListener.on("mail:arrived", function(id) {
		that.config.stompClient.send({
			'destination'	: that.config.onMessageRoot+that.config.accountId,
			'body'			: JSON.stringify({msgId	:id}),
			'persistent'	: 'false'
		}, false);
		logger.inf("new mail arrived with id:" + id+ 'for account '+that.config.accountId);
	});

	that.mailListener.start();
}

imapStompNotifier.prototype.stop = function(){
	var that = this;
	that.mailListener.stop();
}