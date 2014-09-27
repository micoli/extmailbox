Ext.ns('Ext.eu.sm.prospectImporter');
Ext.eu.sm.prospectImporter.campaignEditor = Ext.extend(Ext.Panel, {
	refresh			: function(){
		var that = this;
		that.campaignStore.removeAll();
		that.campaignStore.load();
	},
	initComponent	: function (){
		var that = this;
		that.mainGridId			= Ext.id();
		that.formEditorId		= Ext.id();

		that.campaignStore		= new Ext.data.JsonStore({
			fields			: [
				'cam_id'			,
				'cam_name'			,
				'cam_message'		,
				'cam_start'			,
				'cam_end'			,
				'cam_active'		,
				'cam_autoaffect'	,
				'cam_injection'		,
				'cam_type'			,
				'cam_comm_points'	,
				'cam_percent_rep'	,
				'cam_percent_sup'	,
			],
			root			: 'data',
			idProperty		: 'cam_id',
			totalProperty	: 'total',
			remoteSort		: true,
			autoLoad		: false,
			baseParams		: {
				'exw_action'	: 'local.prospectImporter.getCampaign'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
			}),
		});

		Ext.apply(that,{
			layout	: 'border',
			items	: [{
				xtype				: 'grid',
				id					: that.mainGridId,
				region				: 'center',
				store				: that.campaignStore,
				loadMask			: true,
				tbar				: [{
					xtype				: 'button',
					text				: 'add',
					handler				: function(){
						var form = Ext.getCmp(that.formEditorId);
						form.getForm().reset();
						form.find('name','cam_id')[0].setValue(-1);
						form.setDisabled(false);
					}
				},'->',{
					xtype				: 'button',
					text				: 'reload',
					handler				: function(){
						var form = Ext.getCmp(that.formEditorId);
						that.refresh();
						form.setDisabled(true);
					}
				}],
				autoExpandColumn	: 'name',
				cm					: new Ext.grid.ColumnModel([{
					header: 'id'			, width:  30, sortable: true, fixed:true	,dataIndex: 'cam_id'
				},{
					header: 'name'			, width: 250, sortable: true, fixed:false	,dataIndex: 'cam_name','id':'name'
				},{
					header: 'message'		, width: 190, sortable: true, fixed:false	,dataIndex: 'cam_message'
				},{
					header: 'start'			, width:  80, sortable: true, fixed:true	,dataIndex: 'cam_start'		, renderer : Ext.util.Format.dateRenderer('d/m/Y')
				},{
					header: 'end'			, width:  80, sortable: true, fixed:true	,dataIndex: 'cam_end'		, renderer : Ext.util.Format.dateRenderer('d/m/Y')
				},{
					header: 'active'		, width:  30, sortable: true, fixed:true	,dataIndex: 'cam_active'	, renderer : function(v){return (v=='1')?'X':''}
				},{
					header: 'autoaffect'	, width:  30, sortable: true, fixed:true	,dataIndex: 'cam_autoaffect', renderer : function(v){return (v=='1')?'X':''}
				},{
					header: 'injection'		, width:  110, sortable: true, fixed:false	,dataIndex: 'cam_injection'
				},{
					header: 'type'			, width:  70, sortable: true, fixed:true	,dataIndex: 'cam_type'		, renderer : function(v){return (v=='1')?'Inbound':'Outbound'}
				},{
					header: 'comm_points'	, width:  70, sortable: true, fixed:true	,dataIndex: 'cam_comm_points'
				},{
					header: 'percent_rep'	, width:  70, sortable: true, fixed:true	,dataIndex: 'cam_percent_rep'
				},{
					header: 'percent_sup'	, width:  70, sortable: true, fixed:true	,dataIndex: 'cam_percent_sup'
				}]),
				view				: new Ext.grid.GridView({
					forceFit			: true,
					getRowClass 		: function(record, rowIndex, p, store){
					},
				}),
				listeners			: {
					rowClick			: function (grid,rowIndex,e){
						var record = grid.getStore().getAt(rowIndex);
						Ext.getCmp(that.formEditorId).setDisabled(false);
						Ext.getCmp(that.formEditorId).getForm().loadRecord(record);
					}
				}
			},{
				xtype				: 'form',
				id					: that.formEditorId,
				region				: 'south',
				layout				: 'column',
				frame				: true,
				autoHeight			: true,
				disabled			: true,
				defaults			: {
					columnWidth			: .25,
					xtype				: 'panel',
					layout				: 'form',
					autoHeight			: true,
					labelWidth			: 100,
				},
				items		: [{
					items				:[{
						xtype		: 'textfield'		,
						fieldLabel	: 'Id',
						name		: 'cam_id'			,
						readOnly	: true				,
						width		: 40,
					},{
						xtype		: 'textfield'		,
						fieldLabel	: 'Name'			,
						name		: 'cam_name'		,
						width		: 200,
					},{
						xtype		: 'textfield'		,
						fieldLabel	: 'Message'			,
						name		: 'cam_message'		,
						width		: 200,
					}]
				},{
					items		:[{
						xtype		: 'datefield'		,
						fieldLabel	: 'Start'			,
						name		: 'cam_start'
					},{
						xtype		: 'datefield'		,
						fieldLabel	: 'End'				,
						name		: 'cam_end'
					},{
						xtype		: 'textfield'		,
						fieldLabel	: 'Injection'		,
						name		: 'cam_injection'	,
						width		: 200,
					}]
				},{
					items		: [{
						xtype			: 'combo'			,
						fieldLabel		: 'Type'			,
						name			: 'cam_type'		,
						store			: new Ext.data.SimpleStore({
							fields	: ['key', 'value'],
							data	: [[1,'inbound'],[0,'outbound']]
						}),
						width			: 130,
						displayField	: 'value',
						valueField		: 'key',
						typeAhead		: true,
						forceSelection	: true,
						selectOnFocus	: true,
						mode			: 'local',
						triggerAction	: 'all',
						emptyText		: 'Select a type...',
					},{
						xtype			: 'checkbox'		,
						fieldLabel		: 'Active'			,
						name			: 'cam_active'		,
						inputValue		: '1'				,
						uncheckedValue	: '0'
					},{
						xtype			: 'checkbox'		,
						fieldLabel		: 'Auto-affect'		,
						name			: 'cam_autoaffect'	,
						inputValue		: '1'				,
						uncheckedValue	: '0'
					}]
				},{
					defaults	:{
						width		: 80
					},
					items		: [{
						xtype		: 'numberfield'		,
						fieldLabel	: 'Commission points',
						name		: 'cam_comm_points'	,
						minValue	: 0					,
						maxValue	: 50				,
						decimalPrecision	: 3
					},{
						xtype		: 'textfield'		,
						fieldLabel	: 'Percent rep'		,
						name		: 'cam_percent_rep'	,
						minValue	: 0					,
						maxValue	: 50				,
						decimalPrecision	: 3
					},{
						xtype		: 'numberfield'		,
						fieldLabel	: 'Percent sup'		,
						name		: 'cam_percent_sup'	,
						minValue	: 0					,
						maxValue	: 50				,
						decimalPrecision	: 3
					}]
				}],
				buttons			:[{
					xtype			: 'button',
					text			: 'save',
					handler			: function(){
						var form =Ext.getCmp(that.formEditorId);
						if (!form.getForm().isValid()){
							return;
						}
						var values = Ext.apply({
							cam_autoaffect	: 0,
							cam_active		: 0
						},form.getForm().getValues());

						values.cam_start	= form.find('name','cam_start'	)[0].getValue().format('Y-m-d').trim();
						values.cam_end		= form.find('name','cam_end'	)[0].getValue().format('Y-m-d').trim();
						console.log(values);

						form.setDisabled(true)
						Ext.Ajax.request({
							url		: 'proxy.php',
							params	: Ext.apply({
								exw_action	: 'local.prospectImporter.setCampaign',
							},values),
							success	: function(data){
								var result = JSON.parse(data.responseText);
								if(result.data && !result.error){
									that.campaignStore.removeAll();
									that.campaignStore.loadData(result)
								};
							},
							failure	: function(data){
								console.log(data);
								alert('failure on saving');
							}
						});
					}
				}]
			}]
		});
		Ext.eu.sm.prospectImporter.campaignEditor.superclass.initComponent.call(this);
	}
});

Ext.reg('prospectImporter.campaignEditor',Ext.eu.sm.prospectImporter.campaignEditor);