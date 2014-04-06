Ext.ns('Ext.eu.sm.prospectImporter');
Ext.eu.sm.prospectImporter.importGridEditor = Ext.extend(Ext.FormPanel, {
	refresh			: function(){
		var that = this;
		that.prospectStore.removeAll();
		that.prospectStore.load();
	},
	initComponent	: function (){
		var that = this;

		that.prospectStore = new Ext.data.JsonStore({
			fields			: [
				'batch_id'			,
				'company_name'		,
				'company_number'	,
				'address1'			,
				'address2'			,
				'town_name'			,
				'raw_activities'	,
				'mapped_activities'	,
				'postcode'			,
				'phone'				,
				'email'				,
				'contact_title'		,
				'contact_firstname'	,
				'contact_lastname'	,
				'contact_function'	,
				'description'
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

		that.gridSelectionModel	= new Ext.grid.CheckboxSelectionModel({
			singleSelect	: false,
			hidden			: false
		});

		Ext.apply(that,{
			layout	: 'border',
			items	:[{
				xtype				: 'grid',
				region				: 'center',
				store				: that.prospectStore,
				bbar				: new Ext.PagingToolbar({
					pageSize			: 25,
					store				: that.prospectStore,
					displayInfo			: true,
					displayMsg			: 'Displaying {0} - {1} of {2}',
					emptyMsg			: "Nothing to display"
				}),
				loadMask			: true,
				autoExpandColumn	: 'name',
				selectionModel		: that.gridSelectionModel,
				cm					: new Ext.grid.ColumnModel([
					that.gridSelectionModel,{
					header: 'id'				, width:  30, sortable: true, fixed:true,dataIndex: 'id'
				},{
					header: 'company_name'		, width: 200, sortable: true, fixed:false,dataIndex: 'company_name'		,
				},{
					header: 'company_number'	, width:  50, sortable: true, fixed:false,dataIndex: 'company_number'	,
				},{
					header: 'address1'			, width:  80, sortable: true, fixed:false,dataIndex: 'address1'			,
				},{
					header: 'address2'			, width:  80, sortable: true, fixed:false,dataIndex: 'address2'			,
				},{
					header: 'town_name'			, width: 90, sortable: true, fixed:false,dataIndex: 'town_name'		,
				},{
					header: 'raw_activities'	, width: 150, sortable: true, fixed:false,dataIndex: 'raw_activities'	,
				},{
					header: 'mapped_activities'	, width: 150, sortable: true, fixed:false,dataIndex: 'mapped_activities',
				},{
					header: 'postcode'			, width:  80, sortable: true, fixed:false,dataIndex: 'postcode'			,
				},{
					header: 'phone'				, width:  80, sortable: true, fixed:false,dataIndex: 'phone'			,
				},{
					header: 'email'				, width: 110, sortable: true, fixed:false,dataIndex: 'email'			,
				},{
					header: 'contact_title'		, width:  30, sortable: true, fixed:false,dataIndex: 'title'			,
				},{
					header: 'contact_firstname'	, width: 100, sortable: true, fixed:false,dataIndex: 'firstname'		,
				},{
					header: 'contact_lastname'	, width: 100, sortable: true, fixed:false,dataIndex: 'lastname'			,
				},{
					header: 'contact_function'	, width: 100, sortable: true, fixed:false,dataIndex: 'function'			,
				},{
					header: 'description'		, width: 200, sortable: true, fixed:false,dataIndex: 'description'
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