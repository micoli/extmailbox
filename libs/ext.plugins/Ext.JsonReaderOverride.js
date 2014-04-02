/*
	if(response.getResponseHeader['Content-Length']=="1302820\r"){
		j.parse(response.responseText,function(result){
			console.log("eeee",response,result)
		});
	}else{
		return JSON.parse(json.responseText);
	}

 */
Ext.override(Ext.data.HttpProxy, {
	loadResponse : function(o, success, response){
		delete this.activeRequest;
		if(!success){
			this.fireEvent("loadexception", this, o, response);
			o.request.callback.call(o.request.scope, null, o.request.arg, false);
			return;
		}
		if(o.reader.getJsonAccessor){
			this.loadResponseWW(o, success, response);
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
	loadResponseWW : function(o, success, response){
		delete this.activeRequest;
		var opConfig = {
			getJsonAccessor: function(){
				var re = /[\[\.]/;
				return function(expr) {
					try {
						return(re.test(expr))
							? new Function("obj", "return obj." + expr)
							: function(obj){
								return obj[expr];
							};
					} catch(e){}
					return Ext.emptyFn;
				};
			}(),
			readRecords : function(o){
				this.jsonData = o;
				/*if(o.metaData){
					delete this.ef;
					this.meta = o.metaData;
					this.recordType = Ext.data.Record.create(o.metaData.fields);
					this.onMetaChange(this.meta, this.recordType, o);
				}*/
//				debugger;
				var s = this.meta, Record = Ext.data.Record.create(this.recordFields),
				f = Record.prototype.fields, fi = f.items, fl = f.length;
				// Generate extraction functions for the totalProperty, the
				// root, the id, and for each field
				if (!this.ef) {
					if(s.totalProperty) {
						this.getTotal = this.getJsonAccessor(s.totalProperty);
					}
					if(s.successProperty) {
						this.getSuccess = this.getJsonAccessor(s.successProperty);
					}
					this.getRoot = s.root ? this.getJsonAccessor(s.root) : function(p){return p;};
					if (s.id) {
						var g = this.getJsonAccessor(s.id);
						this.getId = function(rec) {
							var r = g(rec);
							return (r === undefined || r === "") ? null : r;
						};
					} else {
						this.getId = function(){return null;};
					}
					this.ef = [];
					for(var i = 0; i < fl; i++){
						f = fi[i];
						var map = (f.mapping !== undefined && f.mapping !== null) ? f.mapping : f.name;
						this.ef[i] = this.getJsonAccessor(map);
					}
				}
				var root = this.getRoot(o), c = root.length, totalRecords = c, success = true;
				if(s.totalProperty){
					var v = parseInt(this.getTotal(o), 10);
					if(!isNaN(v)){
						totalRecords = v;
					}
				}
				if(s.successProperty){
					var v = this.getSuccess(o);
					if(v === false || v === 'false'){
						success = false;
					}
				}
				var records = [];
				for(var i = 0; i < c; i++){
					var n = root[i];
					var values = {};
					var id = this.getId(n);
					for(var j = 0; j < fl; j++){
						f = fi[j];
						var v = this.ef[j](n);
						values[f.name] = f.convert((v !== undefined) ? v : f.defaultValue, n);
					}
					//var record = new Record(values, id);
					//record.json = n;
					//records[i] = record;
					records[i]={
						v	: values,
						i	: id,
						j	: n
					}
				}
				return {
					success : success,
					records : records,
					totalRecords : totalRecords
				};
			},
			read	: function(o,json,cb) {
				//this.apply(o);
				this.meta=o.meta;
				this.recordFields=o.recordFields;
				try {
					var ob = eval("("+json+")");
					result = this.readRecords(ob);
				}catch(e){
					console.log(e);
					cb(false,null,e);
				}
				cb(true,result);
			}
		}
		//var op = operative(opConfig,['libs/operative.mock/Record.js']);
		var op = new function(){return opConfig;}();
		var that = this;
		var fields=[];
		Ext.each(o.reader.recordType.prototype.fields.items,function(v,k){
			fields.push({
				dateFormat	:v.dateFormat	|| null,
				defaultValue:v.defaultValue	|| null,
				mapping		:v.mapping		|| null,
				name		:v.name			|| null,
				sortDir		:v.sortDir		|| null,
				type		:v.type			|| null,
			})
		})
		op.read({
			meta		: {
				root			: o.reader.meta.root			|| null,
				totalProperty	: o.reader.meta.totalProperty	|| null,
				successProperty	: o.reader.meta.successProperty	|| null,
				id				: o.reader.meta.id				|| null
			},
			recordFields : fields
		},response.responseText,function(ok,result,exception){
			if(ok){
				var Record = o.reader.recordType;
				for(i=0;i<result.records.length;i++){
					var record = new Record(result.records[i].v, result.records[i].i);
					record.json = result.records[i].j;
					result.records[i] = record;
				}
				that.fireEvent("load", that, o, o.request.arg);
				o.request.callback.call(o.request.scope,result, o.request.arg, true);
			}else{
				that.fireEvent("loadexception", that, o, response, exception);
				o.request.callback.call(o.request.scope,null, o.request.arg, true);
			}
		});
	},
});
