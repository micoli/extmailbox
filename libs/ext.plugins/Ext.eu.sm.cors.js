Ext.ns('Ext.eu.sm.cors');

Ext.eu.sm.cors.Connection = function(config){
	var that = this;
	Ext.apply(that, config);
	this.addEvents(
		"beforerequest",
		"requestcomplete",
		"requestexception"
	);
	Ext.eu.sm.cors.Connection.superclass.constructor.call(that);
};

Ext.extend(Ext.eu.sm.cors.Connection,Ext.util.Observable,{
	method	: 'GET',
	request	: function(o){
		var that = this;
		var p = o.params||{};

		if(typeof p == "function"){
			p = p.call(o.scope||window, o);
		}
		if(typeof p == "object"){
			p = Ext.urlEncode(p);
		}
		if(this.extraParams){
			var extras = Ext.urlEncode(this.extraParams);
			p = p ? (p + '&' + extras) : extras;
		}

		var url = o.url || this.url;
		if(typeof url == 'function'){
			url = url.call(o.scope||window, o);
		}
		url += (url.indexOf('?') != -1 ? '&' : '?') + p;
		var method =o.method||that.method;
		var xhr = new XMLHttpRequest();

		xhr.onload = function() {
			//console.log('onload',xhr.responseText);
			if(o.success){
				o.success(xhr);
			}
		};

		xhr.onerror = function() {
			//console.log('There was an error!',xhr);
			if(o.failure){
				o.failure(xhr,that);
			}
		};
		if ("withCredentials" in xhr) {
			// Check if the XMLHttpRequest object has a "withCredentials" property.
			// "withCredentials" only exists on XMLHTTPRequest2 objects.
			xhr.open(method, url, true);
		} else if (typeof XDomainRequest != "undefined") {
			// Otherwise, check if XDomainRequest.
			// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
			xhr = new XDomainRequest();
			xhr.open(method, url);
		} else {
			// Otherwise, CORS is not supported by the browser.
			xhr = null;
		}
		xhr.send();
		return xhr;
	}
});

Ext.eu.sm.cors.Ajax = new Ext.eu.sm.cors.Connection({});




Ext.eu.sm.cors.Proxy = function(conn){
	Ext.eu.sm.cors.Proxy.superclass.constructor.call(this);
	this.conn = conn;
	this.useAjax = !conn || !conn.events;
};

Ext.extend(Ext.eu.sm.cors.Proxy, Ext.data.DataProxy, {
	getConnection : function(){
		return Ext.eu.sm.cors.Connection;
	},
	load : function(params, reader, callback, scope, arg){
		var  o = {
			params 		: params || {},
			request		: {
				callback	: callback,
				scope		: scope,
				arg			: arg
			},
			reader		: reader,
			callback	: this.loadResponse,
			scope		: this
		};
		Ext.applyIf(o, this.conn);
		if(this.activeRequest){
			Ext.Ajax.abort(this.activeRequest);
		}
		this.activeRequest = Ext.eu.sm.cors.Ajax.request(o);
	},

	// private
	loadResponse : function(o, success, response){
		delete this.activeRequest;
		debugger;
		if(!success){
			this.fireEvent("loadexception", this, o, response);
			o.request.callback.call(o.request.scope, null, o.request.arg, false);
			return;
		}
		var result;
		try {
			result = o.reader.read(response);
		}catch(e){
			this.fireEvent("loadexception", this, o, response, e);
			o.request.callback.call(o.request.scope, null, o.request.arg, false);
			return;
		}
		this.fireEvent("load", this, o, o.request.arg);
		o.request.callback.call(o.request.scope, result, o.request.arg, true);
	},

	// private
	update : function(dataSet){

	},

	// private
	updateResponse : function(dataSet){

	}
});