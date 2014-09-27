Ext.ns('Ext.eu.sm.form');

Ext.eu.sm.form.dynamicForm = Ext.extend(Ext.Panel,{
	layout				: 'form',
	dataSource			: '',
	rawSourceEditor		: true,

	copyRecordToSource	: function(){
		var that = this;
		Ext.getCmp(that.jsonSourceId).setValue(JSON.stringify(that.getRecord(),null,4));
		return that;
	},

	copySourceToRecord	: function(){
		var that = this;
		that.loadData(JSON.parse(Ext.getCmp(that.jsonSourceId).getValue()));
		return that;
	},

	getData			: function (){
		var that = this;
		var card = Ext.getCmp(that.cardId);
		if(card.getLayout().activeItem.id==that.sourceContainerId){
			try{
				that.copySourceToRecord();
			}catch(e){
				alert('error');
			}
		}
		return that.getRecord();
	},

	loadData			: function (data){
		var that = this;
		if(typeof data == 'string'){
			data = JSON.parse(data);
		}
		for(var col in data){
			if(data.hasOwnProperty(col)){
				var field = that.subForm.find('name',col);
				if(field.length>0){
					field = field[0];
					if(field.xtype=='editorgrid'){
						field.getStore().removeAll();
						field.getStore().loadData(data[col]);
					}else{
						field.setValue(data[col]);
					}
				}
			}
		}
		that.copyRecordToSource();
	},

	getRecord				: function (){
		var that = this;
		var data = {};
		that.subForm.items.each(function(field){
			if(field.xtype=='editorgrid'){
				var subRecords = [];
				var subRecordType={};
				Ext.each(field.getStore().fields.keys,function(key){
					subRecordType[key]=null;
				});
				for(var i=0;i<field.getStore().getCount();i++){
					subRecords.push(Ext.applyIf(field.getStore().getAt(i).data,subRecordType));
				}
				data[field.name] = subRecords;
			}else{
				data[field.name] = field.getValue();
			}
		})
		return data;
	},

	initComponent	: function (){
		var that = this;
		var containerId = Ext.id();
		that.sourceContainerId = Ext.id();
		that.cardId = Ext.id();
		that.jsonSourceId = Ext.id();

		that.switchEditor = function(){
			var card = Ext.getCmp(that.cardId);
			if(card.getLayout().activeItem.id==that.sourceContainerId){
				try{
					that.copySourceToRecord();
					card.getLayout().setActiveItem(0);
				}catch(e){
					alert('error');
				}
			}else{
				card.getLayout().setActiveItem(1);
				that.copyRecordToSource();
			}
		}

		var createSubField = function(item){
			var id = Ext.id();
			switch (item.type||'text'){
				case 'text':
					return {
						id				: id,
						width			: 300,
						xtype			: 'textfield',
						name			: item.name,
						fieldLabel		: item.label||item.name
					};
				break;
				case 'select':
					var subv = [];
					Ext.each(item.values,function(v){
						subv.push([v]);
					})
					return {
						id				: id,
						width			: 300,
						xtype			: item.multiple?'multiselect':'combo',
						name			: item.name,
						fieldLabel		: item.label||item.name,
						store			: new Ext.data.SimpleStore({
							fields			: ['val'],
							data			: subv
						}),
						displayField	: 'val',
						valueField		: 'val',
						mode			: 'local',
						triggerAction	: 'all',
						emptyText		: 'Select a value...',
						typeAhead		: true,
						forceSelection	: true,
						selectOnFocus	:true
					};
				break;
				case 'grid':
					var title = (item.label||item.name);
					var f = [];
					var c = [];
					Ext.each(item.fields,function(v){
						f.push(v.name);
						c.push({
							header		: v.label||v.name,
							width		: 160,
							sortable	: true,
							dataIndex	: v.name,
							editor		: Ext.ComponentMgr.create(createSubField(v))})
					});
					return {
						id		: id,
						xtype	: 'editorgrid',
						name	: item.name,
						store	: new Ext.data.JsonStore({
							fields	: f,
							data	: []
						}),
						tbar			: [ title ,'->',{
							xtype			: 'button',
							iconCls			: 'add',
							text			: 'Add line',
							fieldId			: id,
							handler			: function (){
								var store = Ext.getCmp(this.fieldId).getStore();
								store.add(new store.recordType({}))
							}
						},{
							xtype			: 'button',
							iconCls			: 'remove',
							text			: 'Remove line',
							fieldId			: id,
							handler			: function (){
								var grid = Ext.getCmp(this.fieldId);
								var store = grid.getStore();
								var selection = grid.getSelectionModel().selection;
								if(selection && selection.record){
									store.remove(selection.record);
								}
							}
						}],
						columns			: c,
						stripeRows		: true,
						height			: 200,
						width			: '95%',
					};
				break;
			}
			return result;
		}

		var subItems=[];
		Ext.each(that.dynamicConfig,function(item,k){
			subItems.push(createSubField(item));
		});
		that.items.push({
			xtype		: 'panel',
			layout		: 'card',
			id			: that.cardId,
			activeItem	: 0,
			items		: [{
				id			: containerId,
				xtype		: 'form',
				layout		: 'form',
				width		: '100%',
				height		: 'auto',
				items		: subItems
			},{
				xtype		: 'panel',
				layout		: 'fit',
				id			: that.sourceContainerId,
				items		:	[{
					xtype		: 'textarea',
					id			: that.jsonSourceId,
					value		: '',
					height		: 300
				}]
			}]
		});
		if(that.rawSourceEditor){
			that.items.push({
				xtype	: 'button',
				text	: 'editor',
				pressed	: false,
				handler	: function(){
					that.switchEditor();
				}
			});
		}

		Ext.apply(that,{
			autoScroll	: true,
		});

		Ext.eu.sm.form.dynamicForm.superclass.initComponent.call(this);

		that.subForm = Ext.getCmp(containerId);
		if(that.dataSource){
			that.loadData(that.dataSource);
		}

	}
});

Ext.reg('eu.sm.dynamicForm', Ext.eu.sm.form.dynamicForm);
