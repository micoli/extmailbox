Ext.data.ConnectionCache = function(){
	var requests={}

	var _getTime = function(delay){
		return (new Date().getTime()) + delay*1000
	}

	var _cleanCache = function(){
		var t = _getTime(0);
		for(hash in requests){
			if(requests.hasOwnProperty(hash)){
				if(requests[hash].expire<t){
					_deleteCache(hash);
				}
			}
		}
	}
	var _getResponse = function (hash,cb,scope){
		if(requests[hash]){
			if(requests[hash].loading){
				requests[hash]={
					loading		: true
				}
			}else if(requests[hash].expire>=_getTime(0)){
				var r = requests[hash].response;
				r.argument=requests[hash].argument;
				console.log('in cache');
				cb.call(scope,r);
				return true;
			}else{
				_cleanCache();
				return null;
			}
		}
	}

	var _deleteCache = function (hash){
		delete(requests[hash]);
	}

	var _storeCache = function (hash,response,delay){
		if(response.fromConnectionCache){
			return;
		}
		requests[hash]={
				loading		: false,
				expire		: _getTime(delay),
				response	: response,
				argument	: Ext.ux.util.clone(response.argument)
		}
		_cleanCache();
	}

	return {
		getResponse	: _getResponse,
		deleteCache	: _deleteCache,
		storeCache	: _storeCache
	}
}();

Ext.override(Ext.data.Connection, {
	request : function(o){
		if(this.fireEvent("beforerequest", this, o) !== false){
			var p = o.params;

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

			if(o.form){
				var form = Ext.getDom(o.form);
				url = url || form.action;

				var enctype = form.getAttribute("enctype");
				if(o.isUpload || (enctype && enctype.toLowerCase() == 'multipart/form-data')){
					return this.doFormUpload(o, p, url);
				}
				var f = Ext.lib.Ajax.serializeForm(form);
				p = p ? (p + '&' + f) : f;
			}

			var hs = o.headers;
			if(this.defaultHeaders){
				hs = Ext.apply(hs || {}, this.defaultHeaders);
				if(!o.headers){
					o.headers = hs;
				}
			}

			var cb = {
				success	: this.handleResponse,
				failure	: this.handleFailure,
				scope	: this,
				timeout	: o.timeout || this.timeout,
				argument: {
					options: o
				},
			};

			var method = o.method||this.method||((p || o.xmlData || o.jsonData) ? "POST" : "GET");

			o.requestHash = Ext.util.MD5(url+'/'+method+'/'+p);

			if(method == 'GET' && (this.disableCaching && o.disableCaching !== false) || o.disableCaching === true){
				var dcp = o.disableCachingParam || this.disableCachingParam;
				url += (url.indexOf('?') != -1 ? '&' : '?') + dcp + '=' + (new Date().getTime());
			}

			if(typeof o.autoAbort == 'boolean'){ // options gets top priority
				if(o.autoAbort){
					this.abort();
				}
			}else if(this.autoAbort !== false){
				this.abort();
			}
			if((method == 'GET' || o.xmlData || o.jsonData) && p){
				url += (url.indexOf('?') != -1 ? '&' : '?') + p;
				p = '';
			}
			console.log('B',o.requestHash);
			if(!Ext.data.ConnectionCache.getResponse(o.requestHash,this.handleResponse,this)){
				this.transId = Ext.lib.Ajax.request(method, url, cb, p, o);
			}
			return this.transId;
		}else{
			Ext.callback(o.callback, o.scope, [o, null, null]);
			return null;
		}
	},

	// private
	handleResponse : function(response){
		this.transId = false;
		if(response.fromConnectionCache){
		}
		var options = response.argument.options;
		console.log('E',response.fromConnectionCache?"fromcache":"--",options.requestHash);
		Ext.data.ConnectionCache.storeCache(options.requestHash,response,1800);
		response.argument = options ? options.argument : null;
		this.fireEvent("requestcomplete", this, response, options);
		Ext.callback(options.success, options.scope, [response, options]);
		Ext.callback(options.callback, options.scope, [options, true, response]);
	},

	// private
	handleFailure : function(response, e){
		this.transId = false;
		var options = response.argument.options;
		console.log('E',response.fromConnectionCache?"fromcache":"--",options.requestHash);
		Ext.data.ConnectionCache.deleteCache(options.requestHash);
		response.argument = options ? options.argument : null;
		this.fireEvent("requestexception", this, response, options, e);
		Ext.callback(options.failure, options.scope, [response, options]);
		Ext.callback(options.callback, options.scope, [options, false, response]);
	}
});