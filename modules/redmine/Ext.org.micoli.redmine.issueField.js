Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.issueField = {
	initDefault : function (that) {
		that.cfg = that.cfg || {
			name	: that.name
		};
		Ext.apply(that,{
			width			: 200,
			value			: that.cfg.default_value || undefined,
			visible			: that.cfg.visible,
			fieldLabel		: that.cfg.name,
			stateful		: false,
			maxLength		: that.cfg.max_length || Number.MAX_VALUE,
			regex			: that.cfg.regexp ? new RegExp(that.cfg.regexp) : null,
		});
	}
}

Ext.org.micoli.redmine.issueField.string = Ext.extend(Ext.form.TextField,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		//console.log('initComponent',that.cfg);
		Ext.org.micoli.redmine.issueField.string.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.text = Ext.extend(Ext.form.TextArea,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		//console.log('initComponent',that);
		Ext.org.micoli.redmine.issueField.text.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.int = Ext.extend(Ext.form.NumberField,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		Ext.apply(that,{
			allowDecimals	: false,
		});
		//console.log('initComponent',that);
		Ext.org.micoli.redmine.issueField.int.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.float = Ext.extend(Ext.form.NumberField,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		Ext.apply(that,{
			allowDecimals	: true,
		});
		//console.log('initComponent',that);
		Ext.org.micoli.redmine.issueField.float.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.list = Ext.extend(Ext.form.ComboBox,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		Ext.apply(that,{
			displayField	: 'value',
			valueField		: 'value',
			minChars		: 1,
			mode			: 'local',
			store			: new Ext.data.JsonStore ({
				fields	: ['value'],
				root	: 'root',
				data	: {
					root	: that.cfg.possible_values
				},
				proxy	: new Ext.data.MemoryProxy({})
			})
		});
		//console.log('initComponent list',that,that.cfg.possible_values,that.store);
		Ext.org.micoli.redmine.issueField.list.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.listMultiple = Ext.extend(Ext.ux.BoxSelect,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		Ext.apply(that,{
			displayField	: 'value',
			valueField		: 'value',
			minChars		: 1,
			mode			: 'local',
			store			: new Ext.data.JsonStore({
				fields	: ['value'],
				root	: 'root',
				data	: {
					root	: that.cfg.possible_values
				},
				proxy	: new Ext.data.MemoryProxy({})
			})
		});
		//console.log('initComponent multipleList',that,that.cfg.possible_values,that.store);
		Ext.org.micoli.redmine.issueField.listMultiple.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.date = Ext.extend(Ext.form.DateField,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		//console.log('initComponent',that.cfg);
		Ext.org.micoli.redmine.issueField.date.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.bool = Ext.extend(Ext.form.Checkbox,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		//console.log('initComponent',that.cfg);
		Ext.org.micoli.redmine.issueField.bool.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.user = Ext.extend(Ext.form.ComboBox,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		Ext.apply(that,Ext.org.micoli.redmine.service.enumerations.users.dynComboCfg);
		//console.log('initComponent list',that,that.cfg.possible_values,that.store);
		Ext.org.micoli.redmine.issueField.user.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.userMultiple = Ext.extend(Ext.ux.BoxSelect,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		Ext.apply(that,{
			minChars		: 1,
		},Ext.org.micoli.redmine.service.enumerations.users.dynComboCfg);

		//console.log('initComponent multipleList',that,that.cfg.possible_values,that.store);
		Ext.org.micoli.redmine.issueField.userMultiple.superclass.initComponent.call(this);
	}
});

Ext.org.micoli.redmine.issueField.version = Ext.extend(Ext.org.micoli.redmine.issueField.string,{
});

Ext.org.micoli.redmine.issueField.versionMultiple = Ext.extend(Ext.org.micoli.redmine.issueField.string,{
});

/*Ext.org.micoli.redmine.issueField.versionMultiple = Ext.extend(Ext.org.micoli.redmine.issueField.listMultiple,{
	initComponent	: function (){
		var that = this;
		Ext.org.micoli.redmine.issueField.initDefault(that);
		Ext.apply(that,{
			store			: new Ext.data.JsonStore ({
				fields	: ['value'],
				root	: 'root',
				data	: {
					root	: that.cfg.possible_values
				},
				proxy	: new Ext.data.MemoryProxy({})
			})
		});
		Ext.org.micoli.redmine.issueField.versionMultiple.superclass.initComponent.call(this);
	}
});
*/
/*Ext.org.micoli.redmine.issueField.done_ratio = Ext.extend(Ext.org.micoli.redmine.issueField,{
	fieldLabel	: 'Done',
	dataIndex	: 'done_ratio',
	width		: 80,
	fixed		: true,
	renderer	: function (val, meta, record, rowIndex, colIndex, store){
		var percent = val;
		var width = Ext.getCmp(store.extra.gridId).ownerCt.gridColumnModel[colIndex].width;
		var bar = 4-parseInt(percent/25);
		this.style = this.style + ";background-position: ";
		this.style = this.style + (percent==0?-120:(width*percent/100)-120);
		this.style = this.style +"px 50%; background-repeat:no-repeat;";
		meta.css = meta.css+' '+'progressBar-back-'+bar
		return val+'%';
	}
});
*/

for (var type in Ext.org.micoli.redmine.issueField){
	if(Ext.org.micoli.redmine.issueField.hasOwnProperty(type)){
		Ext.reg('org.micoli.redmine.issueField.'+type,Ext.org.micoli.redmine.issueField[type]);
	}
}