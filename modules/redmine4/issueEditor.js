/*Ext.ns('Ext.eu.sm.redmine');
Ext.ux.ExtForm = Ext.extend(Ext.FormPanel,{
	createForm: function(){
		delete this.initialConfig.listeners;
		return new Ext.ux.ExtBasicForm(null, this.initialConfig);
	},
});
Ext.reg('Ext.ux.ExtForm',Ext.ux.ExtForm);

Ext.ux.ExtBasicForm = Ext.extend(Ext.form.BasicForm,{
	findField : function(id,that){
		if(!that){
			that = this;
		}
		if(that.items && that.items.get){
			var field = that.items.get(id);
			if(!field){
				that.items.each(function(f){
					if(f.isFormField && (f.dataIndex == id || f.id == id || f.getName() == id)){
						field = f;
						return false;
					}
					if(f.items){
						var fi = that.findField.call(f,id);
						if(fi){
							field=fi;
							return false;
						}
					}
				});
			}
		}else{
			return null;
		}
		//console.log(id,field);
		return field || null;
	}
});

*/
Ext.define('Ext.modules.redmine4.issueEditor', {
	extend		: 'Ext.Panel',
	alias		: 'widget.redmine4_issueEditor',
	requires	: [
		//'Ext.modules.redmine4.issueEditor',
	],
	flattenStruct	: function (o,res,prefix,exclude){

		var that = this;
		res		= res		|| {};
		exclude	= exclude	|| [];
		prefix	= prefix?prefix+'.':'';

		if (typeof o == "object") {
			for (var k in o){
				if(exclude.indexOf(prefix+k) != -1){
					res[prefix+k] = o[k];
				}else{
					if(o.hasOwnProperty(k) && typeof o[k] != 'function'){
						if (typeof o[k] == "object") {
							if (o[k] instanceof Array) {
								that.flattenStruct(o[k], res, k,exclude);
							}else{
								that.flattenStruct(o[k], res, prefix+k,exclude);
							}
						}else{
							res[prefix+k] = o[k];
						}
					}
				}
			}
		}
		return res;
	},

	refresh			: function(record){
		var that	= this;
		//console.log ('open '+ record.get('id'))
		Ext.Ajax.request(Ext.modules.redmine4.service.request({
			url		: 'issues/'+record.get('id')+'.json',
			params	: {
				include : 'journals,attachments,children'
			},
			method	: 'GET',
			success	: function(data){
				eval('var result = '+data.responseText);
				that.issue = result.issue;//that.flattenStruct(result.issue,null,null,['journals','edits','attachments']);
				console.log(that.issue);
				var model = new redmine4.issue(that.issue);
				console.log(model);
				var form = Ext.getCmp(that.mainFormId).getForm();
				form.loadRecord(model);
				return;


				that.journalsStore.removeAll();
				if(that.issue.journals){
					that.journalsStore.loadData(that.issue);
				}
			}
		}));
	},

	initComponent	: function(){
		var that				= this;
		that.mainFormId			= Ext.id();
		that.journalGridId		= Ext.id();
		that.detailTabpanelId	= Ext.id();
		that.descriptionCardId	= Ext.id();
		that.descriptionRendId	= Ext.id();
		that.descriptionTextId	= Ext.id();


/*		that.journalsStore = new Ext.data.GroupingStore({
			autoLoad		: false,
			remoteGroup		: false,
			groupField		: '',
			reader			: new Ext.data.JsonReader({
				root			: 'journals',
				id				: 'id',
			},[
				'id',
				'notes',
				'details',
				'user',
				{name:'created_on',type:'date'},
			]),
			listeners	:{
				load : function(){
					//console.log(this,arguments)
				}
			},
			sortInfo		: {
				field			: 'created_on',
				direction		: 'DESC'
			},
			proxy			: new Ext.data.MemoryProxy({})
		});

*/
		Ext.apply(this,{
			frame	: true,
			items	: [{
				xtype		: 'form',
				frame	: true,
				id			: that.mainFormId,
				items		: [{
					xtype		: 'textfield',
					fieldLabel	: 'Subject',
					name		: 'subject',
					anchor		: '98%'
				},{
					layout		:'column',
					items		: [{
						columnWidth	:.5,
						layout		: 'form',
						items		: [{
							xtype		: 'textfield',
							fieldLabel	: 'Status',
							name		: 'status.name',
							anchor		: '95%'
						},{
							xtype		: 'textfield',
							fieldLabel	: 'Priority',
							name		: 'priority.name',
							anchor		: '95%'
						},{
							xtype		: 'textfield',
							fieldLabel	: 'Author',
							name		: 'author.name',
							anchor		: '95%',
							readOnly	: true,
							listeners	: {
								dblclick	: function (field){
									console.log(arguments);
								}
							}
						},{
							xtype		: 'textfield',
							fieldLabel	: 'Assignee',
							name		: 'assigned_to.name',
							anchor		: '95%',
							readOnly	: true,
							listeners	: {
								dblclick	: function (field){
									console.log(arguments);
								}
							}
						}]
					},{
						columnWidth	:.5,
						layout		: 'form',
						items		: [{
							xtype		: 'datefield',
							fieldLabel	: 'Start date',
							name		: 'start_date',
							anchor		: '95%'
						},{
							xtype		: 'datefield',
							fieldLabel	: 'Due date',
							name		: 'due_date',
							anchor		: '95%'
						},{
							//xtype		: 'eu.sm.form.renderedField',
							xtype		: 'displayfield',
							fieldLabel	: '% done',
							name		: 'done_ratio',
							anchor		: '95%',
							listeners	: {
								afterrender : function(ct){
									var field = this;
									this.el.on('click',function(){
										var cmp = this;
										var sm = new Ext.grid.RowSelectionModel({
											singleSelect	: true
										});
										cmp.attachedCmp = new Ext.eu.attachedWindow({
											resizeTriggerCmp: this,
											stickCmp		: this,
											resizable		: false,
											frame			: true,
											hideBorders		: true,
											border			: false,
											height			: 150,
											layout			: 'fit',
											width			: Math.min(120,ct.getWidth()),
											items			: [{
												xtype			: 'grid',
												hideHeaders		: true,
												store			: new Ext.data.SimpleStore({
													fields			: ['prct'],
													data			: [[0],[10],[20],[30],[40],[50],[60],[70],[80],[90],[100]]
												}),
												autoExpandColumn	: 'prct',
												sm					: sm,
												cm					: new Ext.grid.ColumnModel([{
													header				: '-',
													dataIndex			: 'prct',
													align				: 'right',
													id					: 'prct',
													width				: '100%',
													fixed				: false,
													stripeRows			: true,
													renderer			: function(v){
														return v+' %';
													}
												}]),
												listeners	: {
													render		: function(grid){
														setTimeout(function(){
															var valIndex = grid.getStore().find('prct',field.getValue());
															grid.getView().focusRow({rowIndex:valIndex});
															grid.getView().focusEl.focus();
															grid.getSelectionModel().selectRow(valIndex);
														},100);
													},
													rowdblclick		: function(grid,rowIndex,e){
														field.setValue(grid.getStore().getAt(rowIndex).data.prct);
														cmp.attachedCmp.hide();
													},
													keypress		: function(grid,rowIndex,e){
														console.log(arguments);
														//field.setValue(grid.getStore().getAt(rowIndex).data.prct);
														//cmp.attachedCmp.hide();
													}
												}
											}]
										});
										cmp.attachedCmp.show();
									});
								}
							},
							renderer	: function (percent,field) {
								//var width = Math.min(120,field.getWidth());
								var width = 120;
								var bar = 4-parseInt(percent/25);
								var style='';
								style = style + ';width: '+width+'px';
								style = style + ';background-position: '+(percent==0?-120:(width*percent/100)-120)+'px 50%';
								style = style + '; background-repeat:no-repeat;';
								return '<div class="progressBar-back-'+bar+'" style="'+style+'">'+percent+' %</div>';
							}
						}]
					}]
				}/*,{
					xtype		: 'tabpanel',
					id			: that.detailTabpanelId,
					activeTab	: 0,
					anchor		: '100% -10',
					items		: [{
						xtype		: 'eu.sm.redmine.noteEditor',
						title		: 'Description',
						dataIndex	: 'description'
					},{
						title				: 'Journal',
						xtype				: 'editorgrid',
						height				: 150,
						split				: true,
						id					: that.journalGridId,
						store				: that.journalsStore,
						loadMask			: true,
						autoExpandColumn	: 'note',
						sm					: that.gridSelectionModel,
						cm					: new Ext.grid.ColumnModel([{
							header				: 'User',
							dataIndex			: 'user',
							width				: 150,
							fixed				: true,
							renderer			: function (user){
								return user.name;
							}
						},{
							header				: 'Notes',
							dataIndex			: 'notes',
							id					: 'notes',
							fixed				: false,
						},{
							header				: 'created_on',
							dataIndex			: 'created_on',
							width				: 150,
							fixed				: true,
						}]),
						view				: new Ext.grid.GroupingView({
							enableNoGroups		: false,
							enableGroupingMenu	: false,
							startCollapsed		: false,
							hideGroupedColumn	: false,
							autoFill			: true,
							enableRowBody		: true,
							showPreview			: true,
							forceFit			: true,
							showGroupName		: true,
							groupMode			: 'display',
							enableRowBody		: true,
							getRowClass			: function (record, index, rowParams, store ){
								if(record.data.notes){
									rowParams.body = '<div class="textile">'+textile(record.data.notes)+'</div>';
								}
								rowParams.cols = 3
							},
							getGroup			: function(v, r, groupRenderer, rowIndex, colIndex, ds){
								// colIndex of your date column
								if (that.groupColType=='date') {
									// group only by date
									return v.format('Y-m-d D');
								}else {
									// default grouping
									var g = groupRenderer ? groupRenderer(v, {}, r, rowIndex, colIndex, ds) : String(v);
									if(g === ''){
										g = this.cm.config[colIndex].emptyGroupText || this.emptyGroupText;
									}
									return g;
								}
							},
							listeners	:	{
								refresh : function(view){
									//Ext.getCmp(that.issueEditorId).refresh(Ext.getCmp(that.mainGridId).getStore().getAt(0));
								}
							}
						}),

						preEditValue : function(r, field){
							var value = r.data[field];
							if(field=='assigned_to'){
								value = r.data[field].name;
							}
							return this.autoEncode && typeof value == 'string' ? Ext.util.Format.htmlDecode(value) : value;
						},

						listeners	:	{
							beforeedit : function(e){
							},
							rowclick	: function(grid,rowIndex,e){
								//Ext.getCmp(that.issueEditorId).refresh(grid.getStore().getAt(rowIndex));
							}
						}
					}]
				}*/]
			}]
		});
		this.callParent(this);
	}
});
