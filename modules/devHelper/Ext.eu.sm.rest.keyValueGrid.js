Ext.ns('Ext.eu.sm.rest');

Ext.eu.sm.rest.keyValueGrid = Ext.extend(Ext.grid.EditorGridPanel,{
	definedData		: [],
	getValue		: function(){
		var that = this;
		var aResult=[];
		that.store.data.each(function(record){
			if(record.data.key){
				record.data.value=(''+record.data.value).replace('&#160;','');
				aResult.push(record.data);
			}
		});
		return aResult;
	},
	setValue		: function(datas){
		var that = this;
		that.store.removeAll();
		Ext.each(datas,function(data){
			that.store.add(new that.store.recordType(data));
		});
	},

	initComponent	: function(){
		var that = this;

		that.definedKeyStore	= new Ext.data.JsonStore({
			fields		: ['key','value'],
			autoLoad	: false,
			proxy		: new Ext.data.MemoryProxy([]),
			data		: that.definedData||[]
		});


		this.rowActions = new Ext.ux.grid.RowActions({
			header			: '&nbsp;',
			keepSelection	: true,
			actions			: [{
				iconCls : 'icon-del',tooltip : 'Delete'
			}],
			callbacks		: {
				'icon-del':function(grid, record, action, value) {
					that.store.remove(record);
				}
			}
		});

		that.store	= new Ext.data.JsonStore({
			fields		: ['key','value'],
			autoLoad	: false,
			proxy		: new Ext.data.MemoryProxy([]),
			data 		: []
		});

		Ext.apply(that,{
			store			: that.store,
			xtype			: 'editorgrid',
			autoExpandColumn: 'autoexpand',
			plugins			: [this.rowActions],
			tbar			: [{
				xtype			: 'button',
				iconCls			: 'icon-add',
				text			: 'Add',
				handler			: function(){
					that.store.add(new that.store.recordType({
						key		: '',
						value	: ''
					}));
				}
			}],
			columns			: [{
				header	: 'key'	, dataIndex	:'key'	,width:200,editor : new Ext.form.ComboBox({
					store			: that.definedKeyStore,
					displayField	: 'key',
					mode			: 'local',
					name			: 'name',
					triggerAction	: 'all',
					typeAhead		: true,
					forceSelection	: false,
					selectOnFocus	: true,
					listeners		:{
						select			: function(combo,record,index){
							console.log('selected',record);
						}
					}
				})
			},{
				header	: 'value'	, dataIndex	:'value',id	:'autoexpand',editor : new Ext.form.TextField({
					allowBlank: false
				}),cellActions:[{
					iconCls	:'icon-del'
				}]
			},this.rowActions]
		});

		Ext.eu.sm.rest.keyValueGrid.superclass.initComponent.call(this);
	}
});
Ext.reg('rest.keyValueGrid',Ext.eu.sm.rest.keyValueGrid);