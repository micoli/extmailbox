Ext.ns('Ext.eu.sm.prospectImporter');
Ext.eu.sm.prospectImporter.importGridEditor = Ext.extend(Ext.FormPanel, {
	refresh			: function(){
		var that = this;
		that.batchStore.removeAll();
		that.batchStore.load();
	},
	initComponent	: function (){
		var that = this;
		that.prospectGridId		= Ext.id();
		that.batchComboId		= Ext.id();
		that.labelCountTotalId	= Ext.id();

		that.batchStore			= new Ext.data.JsonStore({
			fields			: [
				'ipb_id'			,
				'ipb_batch_id'		,
				'ipb_campaign_id'	,
				'ipb_act_mapping'
			],
			root			: 'data',
			idProperty		: 'ipb_id',
			totalProperty	: 'total',
			autoLoad		: false,
			baseParams		: {
				'exw_action'	: 'local.prospectImporter.getBatch'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
			})/*,
			listeners		: {
				datachanged		: function(store){
					console.log('store Changed 1');
				},
				load			: function(store){
					console.log('store Changed 2');
				},
				add			: function(store){
					console.log('store Changed 3');
				}
			}*/
		});

		that.prospectStore = new Ext.data.JsonStore({
			fields			: [
				'ipr_batch_id'			,
				'ipr_company_name'		,
				'ipr_company_number'	,
				'ipr_address1'			,
				'ipr_address2'			,
				'ipr_town_name'			,
				'ipr_raw_activities'	,
				'ipr_mapped_activities'	,
				'ipr_postcode'			,
				'ipr_phone'				,
				'ipr_email'				,
				'ipr_contact_title'		,
				'ipr_contact_firstname'	,
				'ipr_contact_lastname'	,
				'ipr_contact_function'	,
				'ipr_description'
			],
			root			: 'data',
			idProperty		: 'id',
			totalProperty	: 'total',
			remoteSort		: true,
			autoLoad		: false,
			baseParams		: {
				'exw_action'	: 'local.prospectImporter.getProspects'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
			}),
		});

		that.prospectStoreChanged	= function(){
			var reader = that.prospectStore.reader;
			console.log('store Changed 5',reader);
			Ext.getCmp(that.labelCountTotalId).setText(reader.jsonData.total);
		}

		that.gridSelectionModel		= new Ext.grid.CheckboxSelectionModel({
			singleSelect	: false,
			hidden			: false
		});

		Ext.apply(that,{
			layout	: 'border',
			items	:[{
				xtype				: 'grid',
				id					: that.prospectGridId,
				region				: 'center',
				store				: that.prospectStore,
				tbar				:['Batch&nbsp;:&nbsp;',{
					store			: that.batchStore,
					id				: that.batchComboId,
					xtype			: 'combo',
					valueField		: 'ipb_id',
					displayField	: 'ipb_batch_id',
					emptyText		: 'Select a batch ...',
					mode			: 'local',
					triggerAction	: 'all',
					typeAhead		: true,
					forceSelection	: true,
					selectOnFocus	: true,
					singleSelect	: true,
					listeners		: {
						select			: function (combo,record,idx){
							that.prospectStore.baseParams.ipb_id = record.get('ipb_id');
							that.prospectStore.load({
								params		: {
									start		: 0,
									limit		: 25
								},
								callback	: that.prospectStoreChanged
							});
						}
					}
				},' ','Total : ',{
					xtype			: 'label',
					id				: that.labelCountTotalId
				}],
				bbar				: new Ext.PagingToolbar({
					pageSize			: 25,
					store				: that.prospectStore,
					displayInfo			: true,
					displayMsg			: 'Displaying {0} - {1} of {2}',
					emptyMsg			: "Nothing to display",
					listeners			: {
						change				: that.prospectStoreChanged
					}
				}),
				loadMask			: true,
				autoExpandColumn	: 'name',
				selectionModel		: that.gridSelectionModel,
				cm					: new Ext.grid.ColumnModel([
					that.gridSelectionModel,{
					header: 'id'				, width:  30, sortable: true, fixed:true,dataIndex: 'ipr_id'
				},{
					header: 'company_name'		, width: 200, sortable: true, fixed:false,dataIndex: 'ipr_company_name'		,
				},{
					header: 'company_number'	, width:  50, sortable: true, fixed:false,dataIndex: 'ipr_company_number'	,
				},{
					header: 'address1'			, width:  80, sortable: true, fixed:false,dataIndex: 'ipr_address1'			,
				},{
					header: 'address2'			, width:  80, sortable: true, fixed:false,dataIndex: 'ipr_address2'			,
				},{
					header: 'town_name'			, width: 90, sortable: true, fixed:false,dataIndex: 'ipr_town_name'		,
				},{
					header: 'raw_activities'	, width: 150, sortable: true, fixed:false,dataIndex: 'ipr_raw_activities'	,
				},{
					header: 'mapped_activities'	, width: 150, sortable: true, fixed:false,dataIndex: 'ipr_mapped_activities',
				},{
					header: 'postcode'			, width:  80, sortable: true, fixed:false,dataIndex: 'ipr_postcode'			,
				},{
					header: 'phone'				, width:  80, sortable: true, fixed:false,dataIndex: 'ipr_phone'			,
				},{
					header: 'email'				, width: 110, sortable: true, fixed:false,dataIndex: 'ipr_email'			,
				},{
					header: 'contact_title'		, width:  30, sortable: true, fixed:false,dataIndex: 'ipr_title'			,
				},{
					header: 'contact_firstname'	, width: 100, sortable: true, fixed:false,dataIndex: 'ipr_firstname'		,
				},{
					header: 'contact_lastname'	, width: 100, sortable: true, fixed:false,dataIndex: 'ipr_lastname'			,
				},{
					header: 'contact_function'	, width: 100, sortable: true, fixed:false,dataIndex: 'ipr_function'			,
				},{
					header: 'description'		, width: 200, sortable: true, fixed:false,dataIndex: 'ipr_description'
				}]),
				view				: new Ext.grid.GridView({
					forceFit			: true,
					getRowClass 		: function(record, rowIndex, p, store){
					},
				}),
				listeners			: {
				}
			}]
		});
		Ext.eu.sm.prospectImporter.importGridEditor.superclass.initComponent.call(this);
	}
});

Ext.reg('prospectImporter.importGridEditor',Ext.eu.sm.prospectImporter.importGridEditor);