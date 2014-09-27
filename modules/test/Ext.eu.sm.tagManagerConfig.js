/**
 * @jira
 */

Ext.eu.sm.tagManagerConfig = Ext.extend(Ext.Panel,{
	refresh				: function(){
		var that = this;

		var sTxtSite = Ext.getCmp(that.searchSiteId).getValue();
		that.pivotStore.baseParams['wtf_site']=sTxtSite;

		var sTxtTag = Ext.getCmp(that.searchTagId).getValue();
		that.pivotStore.baseParams['wtf_tag' ]=sTxtTag;
		that.pivotStore.removeAll();
		that.pivotStore.load();
	},

	cellEdit			: function (grid,record,row,col){
		var that = this;
		var store=grid.getStore();
		var pivotRecord=that.pivotGrid.getPivotRecord(record,col);
		that.openConfigEditor(pivotRecord||new store.recordType({
			wtf_disabled	: false,
			wtf_site		: record.get('wtf_site'),
			wtf_tag			: grid.getPivotColValue(col),
		}));
	},

	initComponent		: function(){
		var that = this;
		that.pivotEditorGridPanelId = Ext.id();
		that.searchSiteId = Ext.id();
		that.searchTagId = Ext.id();
		that.tagConfigurators={};
		Ext.Ajax.request({
			url		: 'proxy.php',
			params	: {
				exw_action	: 'local.tagManagerConfig.getTagConfigurators',
			},
			success	: function(data){
				var result = JSON.parse(data.responseText);
				that.tagConfigurators	= result.tagConfigurators;
				that.sites				= [[null,'----']];
				Ext.each(result.sites||[],function(v){
					that.sites.push([v,v]);
				});

				that.pivotStore.load();
			}
		});

		that.pivotStore = new Ext.data.Store({
			reader					: new Ext.data.JsonReader({
				root					: "data",
			},new Ext.data.Record.create([
				'wtf_site'			,
				'wtf_tag'			,
				'wtf_config'		,
				'wtf_disabled'		,
				'wtf_last_update'	,
				'wtf_parent_site'
			])),
			baseParams 				: {
				'exw_action'	: 'local.tagManagerConfig.getTagConfigs'
			},
			proxy					: new Ext.data.HttpProxy({
				url					: 'proxy.php'
			}),
			sortInfo				: {
				field 					: 'wtf_site',
				direction				: 'ASC'
			},
			autoLoad 				: false
		});

		that.cellConfigTpl = new Ext.XTemplate(
			'<div class="ux-cell-value">'
				+'<tpl>{value}</tpl>'
				+'<div class="ux-cell-actions" style="width:{width}px">'
					+'<tpl if="editable"><div class="ux-cell-action add">&#160;</div></tpl>'
				+'</div>'
			+'</div>');
		that.cellConfigTpl.compile();

		that.openConfigEditor = function (record) {
			var wtfParentId			= Ext.id();
			var wtfDisabledId		= Ext.id();
			var wtfConfigId			= Ext.id();
			var switchEditorButtonId= Ext.id();

			var manageConfigFormVisibility = function(wtfParentSite){
				Ext.getCmp(wtfConfigId).items.each(function(v,k){
					if(v.id!=wtfDisabledId && v.id!=wtfParentId){
						v[wtfParentSite?'disable':'enable']();
					}
				})
				var v = Ext.getCmp(switchEditorButtonId);
				if(v){
					v[wtfParentSite?'disable':'enable']();
				}
			}

			var loadData = function(record){
				console.log(record.data);
				//Ext.getCmp(wtfDisabledId	).rgSetValue(record.get('wtf_disabled')?0:1);
				Ext.getCmp(wtfDisabledId	).setValue(record.get('wtf_disabled'));
				Ext.getCmp(wtfParentId		).setValue(record.get('wtf_parent_site'));
				manageConfigFormVisibility(record.get('wtf_parent_site'));
			}

			var editorWin = new Ext.Window({
				modalContainer		: that,
				title				: 'tag editor : ['+record.get('wtf_tag')+' on '+record.get('wtf_site')+']',
				maximizable			: true,
				resizable			: true,
				width				: 700,
				height				: 400,
				layout				: 'fit',
				items				: [{
					xtype 				: 'eu.sm.dynamicForm',
					id					: wtfConfigId,
					rawSourceEditor		: false,
					tbar				: ['->',{
						xtype				: 'button',
						id					: switchEditorButtonId,
						text				: 'Switch editor',
						handler				: function(){
							Ext.getCmp(wtfConfigId).switchEditor();
						}
					}],
					buttons				: [{
						text				: 'Save',
						handler				: function(){
							//record.set('wtf_disabled'	,Ext.getCmp(wtfDisabledId).rgGetValue()==1?0:1);
							record.set('wtf_disabled'	,Ext.getCmp(wtfDisabledId).getValue());
							record.set('wtf_parent_site',Ext.getCmp(wtfParentId).getValue());
							record.set('wtf_config'		,JSON.stringify(Ext.getCmp(wtfConfigId).getData(),null,4));
							/*console.log(JSON.stringify(
								Ext.getCmp(wtfConfigId).getData()
							,null,4));*/
							//console.log(record.data);
							Ext.Ajax.request({
								url		: 'proxy.php',
								params	: {
									exw_action	: 'local.tagManagerConfig.setTagConfig',
									record		: JSON.stringify(record.data)
								},
								success	: function(response){
									var data = JSON.parse(response.responseText);
									if(data.success){
										editorWin.close();
										delete editorWin;
										that.refresh();
									}
								}
							});

						}
					},{
						text				: 'Cancel',
						handler				: function(){
							editorWin.close();
							delete editorWin;
						}
					}],
					frame				: true,
					dataSource			: record.get('wtf_config')||{},
					dynamicConfig		: that.tagConfigurators[record.get('wtf_tag')]||[],
					items				: [{
						xtype				: 'combo',
						fieldLabel			: 'Parent Site',
						name				: 'wtf_parent_site',
						id					: wtfParentId,
						width				: 300,
						xtype				: 'combo',
						displayField		: 'label',
						valueField			: 'val',
						mode				: 'local',
						triggerAction		: 'all',
						emptyText			: 'Select a value...',
						value				: record.get('wtf_parent_site')||null,
						typeAhead			: true,
						forceSelection		: false,
						selectOnFocus		: false,
						store				: new Ext.data.SimpleStore({
							fields				: ['val','label'],
							data				: that.sites
						}),
						listeners			: {
							select				: function (combo, selectedRecord, index){
								manageConfigFormVisibility(selectedRecord.get('val'));
								console.log('select',arguments);
							}
						}
					},{
						xtype		: 'checkbox',
						fieldLabel	: 'Disabled',
						id			: wtfDisabledId/*,
						items		: [{
							boxLabel: 'Yes'	, name: 'rb-auto', inputValue: 1
						},{
							boxLabel: 'No'	, name: 'rb-auto', inputValue: 0
						}]*/
					}]
				}],
				listeners	: {
					render		: function(){
						loadData(record);
					}
				}
			});
			editorWin.show();
		}

		Ext.apply(this,{
			layout		: 'fit',
			items		: [{
				xtype			: 'eu.sm.lockingpivoteditorgridpanel',
				id				: that.pivotEditorGridPanelId,
				tbar			: ['Site : ',{
					xtype			: 'textfield',
					id				: that.searchSiteId,
					width			: 100,
					enableKeyEvents	: true,
					listeners		: {
						'keyup'		: function(cmp,e) {
							var val = cmp.getValue();
							if(e.getCharCode() == 13){
								that.refresh();
							}
						}
					}
				},'Tag : ',{
					xtype			: 'textfield',
					id				: that.searchTagId,
					width			: 100,
					enableKeyEvents	: true,
					listeners		: {
						'keyup'		: function(cmp,e) {
							var val = cmp.getValue();
							if(e.getCharCode() == 13){
								that.refresh();
							}
						}
					}
				},'->',{
					xtype			: 'button',
					text			: 'reload',
					handler			: function(){
						that.refresh();
					}
				}],
				preReconfigure:function(grid){
					that.actionTpl=[];
				},
				postReconfigure:function(grid){
					//that.cellActions.init(grid);
				},
				selModel		: new Ext.grid.CellSelectionModel(),
				pivot			: {
					store			: that.pivotStore,
					groupBy			: 'wtf_site',
					values			: ['wtf_config'],
					column			: 'wtf_tag',
					headerRenderer  : function(pivotValue,idx,field,fieldIdx){
						switch (field){
							case 'wtf_config':
								return '<b>'+pivotValue+'</b>';
							break;
						}
					},
					columnModel				: [{
						header: 'xxxx'  , width: 100, sortable: true, fixed:false,dataIndex: 'wtf_config',renderer : function (v,meta,record,row,col){
							//console.log(this,arguments);
							var pivotRecord=that.pivotGrid.getPivotRecord(record,col);
							var val=v;
							var editable=0;
							if(pivotRecord){
								if(pivotRecord.get('wtf_disabled')==1){
									meta.css='wtf-tag-disabled';
									val = 'disabled';
								}else{
									if(pivotRecord.get('wtf_parent_site')!=''){
										val = record.get('wtf_parent_site');
									}else{
										if(pivotRecord.get('wtf_config')){
											val = pivotRecord.get('wtf_config')
										}
									}
								}
							}
							return that.cellConfigTpl.apply({
								value	: val||'&nbsp;',
								width	: 16,
								editable: editable
							});
						},
						editorGenerator : function(pivotValue,idx){
							return new Ext.form.TextField();
						}
					}],
					/*postColumnModel		: [{
						header: '<b>total</b>'  , width: 100, sortable: true, fixed:true,dataIndex: 'totalCalc'
					}]*/

				},
				listeners	: {
					celldblclick	: function(grid,row,col){
						var c = grid.getColumnModel().config[col];
						if(c.dataIndex){
							var record, dataIndex, value, action;
							record = grid.store.getAt(row);
							value = record.get(c.dataIndex);
							that.cellEdit(grid,record,row,col);
						}
					},
					beforeedit		: function ( e ){
						/*if(e.value==-1){
							e.cancel=true;
						}*/
					},
					afteredit 	: function ( e ){
						/*var that = e.grid;
						var total=0;
						for(var colName in that.pivotMap){
							if (that.pivotMap.hasOwnProperty(colName)){
								var colDef = that.pivotMap[colName];
								if(colDef.colName == 'lmc_prct'){
									var v = parseInt(e.record.get(colName));
									if(v!=-1){
										total+=v;
									}
								}
							}
						}
						e.record.set('totalCalc',total);*/
					},
					render			: function(){
						var grid = Ext.getCmp(that.pivotEditorGridPanelId);
						grid.on('click', function(e){
							var target=Ext.get(e.getTarget());
							if(target.hasClass('ux-cell-action')){
								var t = e.getTarget('div.ux-cell-action');
								var row = e.getTarget('.x-grid3-row');
								var col = grid.view.findCellIndex(target.dom.parentNode.parentNode);
								var c = grid.getColumnModel().config[col];
								var record, dataIndex, value, action;
								if(t) {
									record = grid.store.getAt(row.rowIndex);
									dataIndex = c.dataIndex;
									value = record.get(dataIndex);
									action = t.className.replace(/ux-cell-action /, '');
									that.cellEdit(grid,record,row.rowIndex,col);
								}
								e.stopPropagation();
								e.stopEvent();
							}
						});
					}
				},
				forceFit				: true,
				columns					: [{
					header: 'Site'		, width: 100, sortable: true, fixed:true,dataIndex: 'wtf_site'			,id : 'col2',locked:true
				}]
			}]
		});

		Ext.eu.sm.repartitionExportLM.superclass.initComponent.apply(this, arguments);
		that.pivotGrid = Ext.getCmp(that.pivotEditorGridPanelId);
	}
});

Ext.reg('Ext.eu.sm.tagManagerConfig', Ext.eu.sm.tagManagerConfig);
