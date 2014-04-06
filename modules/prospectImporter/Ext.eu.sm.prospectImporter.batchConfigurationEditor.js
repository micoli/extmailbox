Ext.ns('Ext.eu.sm.prospectImporter');
Ext.eu.sm.prospectImporter.batchConfigurationEditor = Ext.extend(Ext.FormPanel, {
	refresh			: function (){
		var that = this;
		that.grpActivitiesStore.load();
		that.campaignStore.removeAll();
		that.batchStore.removeAll();
		that.campaignStore.load({
			callback : function(){
				that.batchStore.load();
			}
		});
	},

	initComponent	: function (){
		var that = this;

		that.uploadButtonId		= Ext.id();
		that.batchGridId		= Ext.id();
		that.formEditorId		= Ext.id();
		that.mappingGridId		= Ext.id();

		that.campaignStore		= new Ext.data.JsonStore({
			root			: 'data',
			idProperty		: 'cam_id',
			totalProperty	: 'total',
			fields			: [
				'cam_id'			,
				'cam_name'			,
				'cam_comm_points'	,
				'cam_percent_rep'	,
				'cam_percent_sup'	,
			],
			autoLoad		: false,
			baseParams		: {
				'exw_action'	: 'local.prospectImporter.getCampaign'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
			}),
		});

		that.grpActivitiesStore		= new Ext.data.JsonStore({
			root			: 'data',
			idProperty		: 'grp_id',
			totalProperty	: 'total',
			fields			: [
				'grp_id'		,
				'grp_cat_key'	,
				'grp_cat_name'
			],
			remoteSort		: true,
			autoLoad		: false,
			baseParams		: {
				'exw_action'	: 'local.prospectImporter.getGrpActivities'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
			}),
		});

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
			}),
		});

		that.mappingStore	= new Ext.data.JsonStore({
			fields			: [
				'original_id'	,
				'mapped_id'		,
			],
			root			: 'data',
			baseParams		: {
				'exw_action'	: 'local.prospectImporter.getIPBRawMapping'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
			}),
			listeners		: {
				update			: function(){

				}
			}
		});
		that.getMappingVars = function(){
			var aToExport=[];
			that.mappingStore.each(function(v,k){
				aToExport.push(v.data)
			})
			return aToExport;
		}

		Ext.apply(that,{
			frame			: true,
			layout			: 'border',
			items			: [{
				xtype				: 'grid',
				region				: 'west',
				width				: 400,
				id					: that.batchGridId,
				store				: that.batchStore,
				loadMask			: true,
				tbar				: [{
					xtype				: 'button',
					text				: 'add',
					handler				: function(){
						var form = Ext.getCmp(that.formEditorId);
						form.getForm().reset();
						form.find('name','ipb_id'		)[0].setValue(-1);
						form.find('name','ipb_batch_id'	)[0].setValue('B-'+(new Date()).format('Ymd-His'));
						that.mappingStore.removeAll();
						form.setDisabled(false);
					}
				},'->',{
					xtype				: 'button',
					text				: 'reload',
					handler				: function(){
						that.refresh();
						var form = Ext.getCmp(that.formEditorId);
						form.setDisabled(true);
					}
				}],
				autoExpandColumn	: 'ipb_batch_id',
				cm					: new Ext.grid.ColumnModel([{
					header: 'id'				, width:  30, sortable: true, fixed:true	,dataIndex: 'ipb_id'
				},{
					header: 'ipb_batch_id'		, width: 250, sortable: true, fixed:false	,dataIndex: 'ipb_batch_id','id':'ipb_batch_id'
				},{
					header: 'ipb_campaign_id'	, width: 200, sortable: true, fixed:false	,dataIndex: 'ipb_campaign_id',renderer:function(v){
						var idx = that.campaignStore.find('cam_id',parseInt(v));
						if(idx!==-1){
							return that.campaignStore.getAt(idx).get('cam_name');
						}
						return '---';
					}
				}]),
				listeners			: {
					rowClick			: function (grid,rowIndex,e){
						var record = grid.getStore().getAt(rowIndex);
						Ext.getCmp(that.formEditorId).setDisabled(false);
						Ext.getCmp(that.formEditorId).getForm().loadRecord(record);
						that.mappingStore.load({
							params	: {
								'ipb_id': record.get('ipb_id')
							}
						});
					}
				}
			},{
				region		: 'center',
				xtype		: 'form',
				fileUpload	: true,
				id			: that.formEditorId,
				disabled	: true,
				bodyStyle	: 'padding: 10px 10px 0 10px;',
				items		: [{
					xtype		: 'textfield'		,
					fieldLabel	: 'Id'				,
					name		: 'ipb_id'			,
					readOnly	: true				,
					width		: 40,
				},{
					xtype		: 'textfield'		,
					fieldLabel	: 'batch ID'		,
					name		: 'ipb_batch_id'	,
					width		: 200,
				},{
					xtype			: 'combo',
					fieldLabel		: 'Campaign',
					name			: 'ipb_campaign_id',
					store			: that.campaignStore,
					valueField		: 'cam_id',
					displayField	: 'cam_name',
					emptyText		: 'Select a campaign...',
					mode			: 'local',
					triggerAction	: 'all',
					typeAhead		: true,
					forceSelection	: true,
					selectOnFocus	: true,
				},{
					xtype				: 'tabpanel',
					activeItem			: 0,
					border				: true,
					width				: 700,
					height				: 300,
					items				: [{
						xtype				: 'editorgrid',
						title				: 'Mapping',
						id					: that.mappingGridId,
						store				: that.mappingStore,
						loadMask			: true,
						tbar				: [{
							xtype				: 'button',
							text				: 'reload',
							handler				: function(){
								that.mappingStore.removeAll();
								that.mappingStore.reload();
							}
						}/*,{
							xtype				: 'button',
							text				: 'save',
							handler				: function(){
								Ext.Ajax.request({
									url		: 'proxy.php',
									params	: {
										exw_action		: 'local.prospectImporter.setIPBRawMapping',
										ipb_id			: Ext.getCmp(that.formEditorId).find('name','ipb_id')[0].getValue(),
										ipb_act_mapping	: JSON.stringify(that.getMappingVars())
									},
									success	: function(data){
										var result = JSON.parse(data.responseText);
										if(result.success){
											that.mappingStore.removeAll();
											that.mappingStore.reload();
										};
									},
									failure	: function(data){
										console.log(data);
										alert('failure on saving');
									}
								});
							}
						}*/],
						autoExpandColumn	: 'expand',
						cm					: new Ext.grid.ColumnModel([{
							header: 'id'			, width: 350, sortable: true, fixed:true	,dataIndex: 'original_id'	,id:'expand'
						},{
							header: 'mapped id'		, width: 350, sortable: true, fixed:false	,dataIndex: 'mapped_id'		,
							editor: new Ext.form.MultiSelectField({
								name			: 'ipb_campaign_id',
								store			: that.grpActivitiesStore,
								valueField		: 'grp_id',
								displayField	: 'grp_cat_name',
								emptyText		: 'Select activities...',
								mode			: 'local',
								triggerAction	: 'all',
								typeAhead		: true,
								forceSelection	: true,
								selectOnFocus	: true,
								singleSelect	: false,
							}),
							renderer:function(v){
								if((v+'').trim()!=''){
									var aAct = (v+'').split(',');
									var str = '';
									var sepa = '';
									Ext.each(aAct,function(vv,kk){
										var i = that.grpActivitiesStore.find('grp_id',vv);
										if(i!=-1){
											vv = that.grpActivitiesStore.getAt(i).get('grp_cat_name');
										}
										str = str+sepa+vv;
										sepa = ', ';
									});
									return str;
								}
								return '--';
							}
						}]),
					},{
						title			: 'upload',
						layout			: 'form',
						frame			: true,
						border			: false,
						items			: [{
							xtype			: 'fileuploadfield',
							emptyText		: 'Select an file',
							fieldLabel		: 'Prospect File',
							name			: 'fileupload',
							width			: 200,
							buttonCfg		: {
								text		: '',
								iconCls		: 'upload-icon'
							}
						},{
							xtype			: 'button',
							id				: that.uploadButtonId,
							text			: 'sendFile',
							handler			: function (button){
								var form = Ext.getCmp(that.formEditorId);
								form.getForm().submit({
									url			: 'proxy.php',
									params		: {
										ipb_id			: form.find('name','ipb_id'	)[0].getValue(),
										exw_action		: "local.prospectImporter.importFile"
									},
									waitMsg		: 'Uploading your file...',
									success		: function(fp, o){
										alert('Success Processed file "'+o.result.success+'" "'+o.result.filename+'" on the server');
									},
									failure		: function(fp, o){
										alert('Success Processed file "'+o.result.success+'" "'+o.result.filename+'" on the server');
									}
								});
							}
						}]
					}]
				},{
					xtype			: 'button',
					text			: 'save',
					handler			: function (button){
						var form =Ext.getCmp(that.formEditorId);

						if (!form.getForm().isValid()){
							return;
						}
						form.setDisabled(false);
						var values = form.getForm().getValues();
						values.ipb_campaign_id = form.find('name','ipb_campaign_id')[0].getValue();
						values.ipb_act_mapping =  JSON.stringify(that.getMappingVars())
						console.log(values);

						form.setDisabled(true);

						Ext.Ajax.request({
							url		: 'proxy.php',
							params	: Ext.apply({
								exw_action	: 'local.prospectImporter.setBatch',
							},values),
							success	: function(data){
								var result = JSON.parse(data.responseText);
								if(result.data && !result.error){
									that.batchStore.removeAll();
									that.batchStore.loadData(result);
									form.getForm().reset();
									that.mappingStore.removeAll();
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
		Ext.eu.sm.prospectImporter.batchConfigurationEditor.superclass.initComponent.call(this);
	}
});

Ext.reg('prospectImporter.batchConfigurationEditor',Ext.eu.sm.prospectImporter.batchConfigurationEditor);