Ext.ns('Ext.eu.sm');
Ext.eu.sm.Stomp = function(prm){
	var that=this;
	that.prm = prm;
	if(prm.WebSocketClass){
		var WebSocketClass = prm.WebSocketClass;
	}else{
		var WebSocketClass = ReconnectingWebSocket;
	}
	console.log(that.prm.url);
	that.webs = new WebSocketClass(prm.url);
	//var ws = new WebSocketClass(prm.url, onerror:function(){
		//console.log('IMPOSSIBLE de se connecter.');
		//ws.close();
		//delete ws;
		//fb('WS is deleted ' , ws);
	//});
	that.webs.debug = false;
	//that.stompClient = Stomp.client(prm.url);
	that.stompClient = Stomp.over(that.webs);
	return this;
};

Ext.eu.sm.Stomp.prototype = {
	autoReconnect	: false,
	subscribers 	: {},

	connect			: function(onConnect){
		var that=this;
		that.stompClient.connect (that.prm.login, that.prm.password,
			function(msg){
				that.connectCallback(that,msg);
				typeof onConnect === 'function' ? onConnect(that) : void 0 ;
			},
			function(msg){
				that.errorCallback(that,msg);
			}
		);
		return this;
	},

	connectCallback : function(scope,frame){
		scope.debug.call(scope,frame,'onConnect');
		if(scope.prm.subscriptions){
			for(var destination in scope.prm.subscriptions){
				for(var uniqId in scope.prm.subscriptions[destination]){
					scope.subscribe.call(scope,uniqId,destination,scope.prm.subscriptions[destination][uniqId]);
				};
			};
		}
	},

	errorCallback	: function(scope,msg){
		scope.debug.call(scope,arguments,'errorCallback');
		if(scope.stompClient.counter == 0){ // connection callback
			alert('Could not connect to Websocket Server. Aborting. See the console log for details. ');
			delete ws;
			return;
		}
	},

	send			: function (destination,text, header){
		header = header || {};
		try{
			this.stompClient.send(destination, header, text);
			return true;
		} catch(e){
			console.log(e);
			return false;
		}
	},

	debug 			: function(str,title) {
		console.log("stompClient",title,str);
		if (typeof this.prm.debug === 'function'){
			this.prm.debug(str,title);
		}
	},

	subscribe	: function(uniqId,destination,callback){
		var that=this;
		if(that.subscribers[destination]==undefined){
			that.subscribers[destination]={};
		}
		that.subscribers[destination][uniqId]=callback;
		this.stompClient.subscribe(destination, function(msg){
			if(that.subscribers[destination]){
				for(var uniqId in that.subscribers[destination]){
					var cb = that.subscribers[destination][uniqId];
					if(typeof cb === 'function'){
						cb(msg,destination);
					}else{
						cb.callback.call(cb.scope || that,msg,destination);
					}
				}
			}else{
				that.debug.call(that,msg,'!!subscribe unknown');
			}
		});
	}
};
