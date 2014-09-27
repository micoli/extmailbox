/**
 * @jira
 */

Ext.eu.sm.repartitionExportLM = Ext.extend(Ext.Panel,{
	refresh	: function(){
		var that = this;
		that.pivotGroupingStore.removeAll();
		that.pivotGroupingStore.load();
	},
	initComponent : function(){
		var that = this;
		that.pivotGroupingEditorGridPanelId = Ext.id();
		that.pivotGroupingStore = new Ext.data.GroupingStore({
			reader					: new Ext.data.JsonReader({
				root					: "retour",
//				id						: "lmc_id"
			},new Ext.data.Record.create([
				'category'				,
				'main_category'			,
				'tarif_base'			,
				'affiliate_code'		,
				'tarif_client'			,
				'lmc_prct'				,
				'totalCalc'
			])),
			baseParams 				: {
					'exw_action'	: 'local.batchAffilies.showConfLMC'
			},
			autoLoad 				: true,
			proxy					: new Ext.data.HttpProxy({
					url					: 'proxy.php'
			}),
			groupField 				: 'main_category',
			sortInfo				: {
				field 					: 'main_category',
				direction				: 'ASC'
			}
		});

		Ext.apply(this,{
			layout		: 'fit',
			items		:[{
				xtype			: 'eu.sm.pivoteditorgridpanel',
				id				: that.pivotGroupingEditorGridPanelId,
				tbar			: [{
					xtype			: 'button',
					text			: 'save',
					handler			: function(){
						var grid = Ext.getCmp(that.pivotGroupingEditorGridPanelId);
						console.log(grid.pivotGetModifiedRecords());
					}
				},'->',{
					xtype			: 'button',
					text			: 'reload',
					handler			: function(){
						that.refresh();
					}
				}],
				pivot			: {
					store			: that.pivotGroupingStore,
					groupBy			: 'category',
					values			: ['lmc_prct','tarif_client'],
					column			: 'affiliate_code',
					headerRenderer  : function(pivotValue,idx,field,fieldIdx){
						switch (field){
							case 'lmc_prct':
								return '<b>'+pivotValue+'</b>';
							break;
							case 'tarif_client':
								return 'tarif';
							break;
						}
					},
					columnModel				: [{
						header: 'xxxx'  , width: 200, sortable: true, fixed:false,dataIndex: 'lmc_prct',
						renderer	: function(value,meta){
							if(value==-1){
								meta.css='orange';//"repartition-export-lm-no-activity";
								return '-';
							}
							return value;
						},
						editorGenerator : function(pivotValue,idx){
							return new Ext.form.TextField();
						}
					},{
						header: 'xxxx'  , width: 200, sortable: true, fixed:false,dataIndex: 'tarif_client',
						renderer	: function(value,meta){
							if(value==-1){
								meta.css='orange';//"repartition-export-lm-no-activity";
								return '-';
							}
							return value;
						}
					}],
					postColumnModel		: [{
						header: '<b>total</b>'  , width: 100, sortable: true, fixed:true,dataIndex: 'totalCalc'
					}]

				},
				view 					: new Ext.grid.GroupingView({
						forceFit			: true,
						hideGroupedColumn	: true,
						groupTextTpl		: '{text}'
				}),
				listeners	: {
					beforeedit : function ( e ){
						if(e.value==-1){
							e.cancel=true;
						}
					},
					afteredit : function ( e ){
						var that = e.grid;
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
						e.record.set('totalCalc',total);
					}
				},
				forceFit: true,
				autoExpandColumn		:'col1',
				columns					: [{
					header: 'Categorie'		, width: 200, sortable: true, fixed:false,dataIndex: 'category'			,id : 'col1',renderer:function(value){
						return Ext.eu.sm.PPActivities['_'+value];
					}
				},{
					header: 'Groupe'		, width: 200, sortable: true, fixed:false,dataIndex: 'main_category',renderer:function(value){
						return Ext.eu.sm.PPActivities['_'+value];
					}
				}]
			}]
		});

		Ext.eu.sm.repartitionExportLM.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('Ext.eu.sm.repartitionExportLM', Ext.eu.sm.repartitionExportLM);
