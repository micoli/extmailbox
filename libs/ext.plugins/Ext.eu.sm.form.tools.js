Ext.ns('Ext.eu.sm.form');

Ext.eu.sm.form.tools = {
	getValues : function(obj){
		var that = Ext.eu.sm.form.tools;
		var record={};
		that.fullCascade(obj,function(name,item){
			var val=item[item.xtype=="radiogroup"?"rgGetValue":"getValue"]();
			if(item.xtype=='datefield'){
				val=val.format('Y-m-d');
			}
			that.setObjPath(record,name,val);
		},'get');
		return record;
	},

	setValues : function(obj,record){
		var that = Ext.eu.sm.form.tools;
		that.fullCascade(obj,function(name,item){
			item[item.xtype=="radiogroup"?"rgSetValue":"setValue"](that.getObjPath(record,name));
		},'set');
	},

	// http://likerrr.ru/on-air/adding-string-with-dot-notation-as-a-key-to-javascript-objects
	getObjPath: function(obj, path, notation) {
		notation = notation || '.';
		return path.split(notation).reduce(function(prev, cur) {
			return (prev !== undefined) ? prev[cur] : undefined;
		}, obj);
	},

	// http://likerrr.ru/on-air/adding-string-with-dot-notation-as-a-key-to-javascript-objects
	setObjPath : function(obj, path, value, notation) {
		var isObject = function (obj) {
			return (Object.prototype.toString.call(obj) === '[object Object]' && !!obj);
		};
		notation = notation || '.';
		path.split(notation).reduce(function (prev, cur, idx, arr) {
			var isLast = (idx === arr.length - 1);
			// if <cur> is last part of path
			if (isLast) return (prev[cur] = value);
			// if <cur> is not last part of path, then returns object if existing value is object or empty object
			return (isObject(prev[cur])) ? prev[cur] : (prev[cur] = {});
		}, obj);

		return obj;
	},

	fullCascade : function(obj,cb,getOrSet){
		obj.cascade(function(item){
			if(item.ownerCt && item.ownerCt.initialConfig && item.ownerCt.initialConfig.layout=='card'){
				if(item.ownerCt.getLayout().activeItem!=item){
					return false;
				}
			}
			var subFn=function(item){
				if (
					(typeof item=='object') &&
					(item.isFormField || item.xisFormField) &&
					(item.name || item.xname) &&
					(
						(getOrSet=='get'&&(item.rgGetValue || item.getValue))
						||
						(getOrSet=='set'&&(item.rgSetValue || item.setValue))
					)
				){
					cb((item.name||item.xname),item);
				}
			};
			subFn(item);
			Ext.each(['top','bottom'],function(side){
				if(item[side+'Toolbar'] && item[side+'Toolbar'].items){
					item[side+'Toolbar'].items.each(function(toolbarItem){
						subFn(toolbarItem);
					});
				}
			});
		});
	}
};
