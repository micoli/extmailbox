Ext.ux.ExtForm = Ext.extend(Ext.FormPanel,{
	createForm: function(){
		delete this.initialConfig.listeners;
		return new Ext.ux.ExtBasicForm(null, this.initialConfig);
	},
});
Ext.reg('Ext.ux.ExtForm',Ext.ux.ExtForm);

Ext.ux.ExtBasicForm = Ext.extend(Ext.form.BasicForm,{
	//mapById		: {},
	setValues	: function(values){
		if(Ext.isArray(values)){ // array of objects
			for(var i = 0, len = values.length; i < len; i++){
				var v = values[i];
				var f = this.findField(v.id);
				if(f){
					//f.setValue(v.value);
					f[f.rgSetValue?'rgSetValue':'setValue'](v.value);
					if(this.trackResetOnLoad){
						f.originalValue = f.getValue();
					}
				}
			}
		}else{ // object hash
			var field, id;
			for(id in values){
				if(typeof values[id] != 'function' && (field = this.findField(id))){
					//field.setValue(values[id]);
					field[field.rgSetValue?'rgSetValue':'setValue'](values[id]);
					if(this.trackResetOnLoad){
						field.originalValue = field.getValue();
					}
				}
			}
		}
		return this;
	},

	isThatField	: function(f,id){
		return f.isFormField && (f.dataIndex == id || f.id == id || f.getName() == id || (f.rgGetName && f.rgGetName() == id));
	},

	findField : function(id,form){
		if(!form){
			form = this;
		}
		if(form.mapById == undefined){
			form.mapById={};
		}else{
			if(form.mapById.hasOwnProperty(id)){
				return form.mapById[id];
			}
		}
		if(this.items && this.items.get){
			var field = this.items.get(id);
			if(!field){
				this.items.each(function(f){
					if(form.isThatField(f,id)){
						field = f;
						return false;
					}
					if(f.items){
						var fi = this.findField.call(f,id,form);
						if (fi) {
							field=fi;
							return false;
						}
					}
				});
			}
		}else{
			return null;
		}
		if(field){
			form.mapById[id] = field;
		}
		return field || null;
	}
});