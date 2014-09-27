// journal format
// user to user old node new note open detail for note .....
// save issue
// add icons to button

Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.issueEditor = Ext.extend(Ext.Panel,{
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
		that.record = record;
		that.redmineService.request({
			url		: 'issues/'+record.get('id')+'.json',
			params	: {
				include : 'journals,attachments,children,relations,changesets,watchers'
			},
			method	: 'GET',
			success	: function(data){
				eval('var result = '+data.responseText);

				that.issue = that.flattenStruct(result.issue,null,null,['journals','edits','attachments','watchers','relations','changesets','watchers']);
				Ext.getCmp(that.mainFormId).getForm().loadRecord({
					data	: that.issue
				});
				/*Ext.getCmp(that.fieldColumnLayoutId).items.items[2].add(new Ext.form.TextField({
					fieldLabel	: 'azerty1',
					name		: 'toto1',
					stateful	: false
				}));
				Ext.getCmp(that.fieldColumnLayoutId).items.items[0].add(new Ext.form.TextField({
					fieldLabel	: 'azerty2',
					name		: 'toto2',
					stateful	: false
				}));
				Ext.getCmp(that.fieldColumnLayoutId).doLayout();
				console.log(Ext.getCmp(that.fieldColumnLayoutId).items);
				*/

				that.journalsStore.removeAll();
				if(that.issue.journals){
					that.journalsStore.loadData(that.issue);
				}

				var watcherCmp = Ext.getCmp(that.watchersGridId);
				watcherCmp.watchersStore.removeAll();
				watcherCmp.issue_id = that.issue.id;
				if(that.issue.watchers){
					watcherCmp.watchersStore.loadData(that.issue);
				}

				var timeTrackersCmp = Ext.getCmp(that.timeTrackersGridId);
				timeTrackersCmp.issue_id = that.issue.id;
				timeTrackersCmp.timeTrackersStore.removeAll();
				timeTrackersCmp.timeTrackersStore.proxy.conn.url=that.redmineService.requestPrm({url: 'issues/'+record.get('id')+'/time_entries.json'}).url;
				timeTrackersCmp.timeTrackersStore.load();
			}
		});
	},

	initComponent	: function(){
		var that				= this;
		that.mainFormId			= Ext.id();
		that.journalGridId		= Ext.id();
		that.watchersGridId		= Ext.id();
		that.timeTrackersGridId	= Ext.id();
		that.detailTabpanelId	= Ext.id();
		that.fieldColumnLayoutId= Ext.id();

		that.journalsStore = new Ext.data.GroupingStore({
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
				{name:'created_on',type:'date'/*,dateFormat: 'n/j h:ia'*/},
			]),
			listeners	:{
				load : function(){
				}
			},
			sortInfo		: {
				field			: 'created_on',
				direction		: 'DESC'
			},
			proxy			: new Ext.data.MemoryProxy({})
		});

		Ext.apply(this,{
			layout		: 'border',
			frame		: true,
			border		: false,
			items		: [{
				xtype			: 'Ext.ux.ExtForm',
				layout			: 'form',
				region			: 'north',
				height			: 160,
				border			: false,
				id				: that.mainFormId,
				trackResetOnLoad: true,
				tbar			: [{
					xtype			: 'button',
					text			: 'Assign',
					iconCls			: 'icon-user-assign',
					handler			: function (cmp){
						var watcherComboId = Ext.id();

						var windowParams = {
							modalContainer		: that,
							title				: '',
							modalContainerBorder: -1,
							width				: 300,
							height				: 90,
							frame				: true,
							hideBorders			: true,
							okButton			: true,
							cancelButton		: true,
							border				: false,
							layout				: 'fit',
							items				: [{
								xtype				: 'form',
								frame				: true,
								items				: [Ext.apply({
									fieldLabel			: 'Assignee',
									id					: watcherComboId
								},Ext.org.micoli.redmine.service.enumerations.users.dynComboCfg)]
							}],
							callbackOK			: function (win){
								var cmb = Ext.getCmp(watcherComboId);
								if(typeof cmb.getValue() != 'string'){
									that.redmineService.request({
										method			: 'POST',
										url				: 'issues/'+that.issue.id+'.json',
										params			: {
											user_id			: cmb.getValue()
										},
										headers			: {
											Accept			: 'application/json'
										},
										success			: function (response){
											that.reload();
										}
									});
								}
							}
						}
						var attachWin = new Ext.ModalWindow(windowParams);
						attachWin.show();
						setTimeout(function(){
							Ext.getCmp(watcherComboId).focus();
						},100)
					}
				},{
					xtype		: 'button',
					text		: 'Add watchers',
					iconCls		: 'icon-user-add',
					handler		: function (cmp){
						var tab = Ext.getCmp(that.watchersGridId);
						Ext.getCmp(that.detailTabpanelId).setActiveTab(tab);
						tab.addWatcher();
					}
				},{
					xtype		: 'button',
					text		: 'Log time',
					iconCls		: 'icon-time',
					handler		: function (cmp){
						var tab = Ext.getCmp(that.timeTrackersGridId);
						Ext.getCmp(that.detailTabpanelId).setActiveTab(tab);
						tab.addTimeTracker();
					}
				},'->',{
					xtype			: 'button',
					text			: 'save',
					iconCls			: 'issue_save',
					handler			: function (cmp){
						var form = Ext.getCmp(that.mainFormId).getForm();
						/*console.log(form,form.isDirty(),form.getValues());
						for(var key in form.mapById){
							if(form.mapById.hasOwnProperty(key)){
								console.log(key,'||',form.mapById[key].isDirty(),'||',form.mapById[key].getValue(),'||',form.mapById[key].originalValue);
							}
						}
						return;*/
						var modifiedValues = {};
						var values = form.getValues();
						for(var key in values){
							if(values.hasOwnProperty(key)){
								if (form.findField(key).isDirty()){
									modifiedValues[key]=values[key];
								}
								//console.log(key,'||',form.findField(key).isDirty(),'||',values[key],'||',form.findField(key).originalValue);
							}
						}
						console.log('modifiedValues',modifiedValues);
					}
				},{
					xtype			: 'button',
					iconCls			: 'issue_pin_yellow',
					enableToggle	: true,
					pressed			: false,
					handler			: function (cmp){
						if(cmp.pressed){
							Ext.fly(that.parentTabPanel.getTabEl(that)).removeClass('x-tab-strip-closable');
						}else{
							Ext.fly(that.parentTabPanel.getTabEl(that)).addClass('x-tab-strip-closable');
						}
					}
				}],
				items		: [{
					xtype		: 'textfield',
					fieldLabel	: 'Subject',
					dataIndex	: 'subject',
					name		: 'subject',
					anchor		: '98%'
				},{
					layout		: 'column',
					anchor		: '98% -5',
					defaults	: {
						defaults	:{
							width		: 100
						}
					},
					id			: that.fieldColumnLayoutId,
					items		: [{
						columnWidth	:.3,
						layout		: 'form',
						items		: [{
							xtype		: 'datefield',
							fieldLabel	: 'Start date',
							dataIndex	: 'start_date',
							name		: 'start_date',
						}/*,Ext.apply({
							fieldLabel	: 'Status',
							dataIndex	: 'status.id',
							name		: 'status.id',
						},Ext.org.micoli.redmine.service.enumerations.issue_statuses.comboCfg
						)*/,Ext.apply({
							fieldLabel	: 'Author',
							dataIndex	: 'author.id',
							name		: 'author.id'
						},Ext.org.micoli.redmine.service.enumerations.users.dynComboCfg)]
					},{
						columnWidth	:.3,
						layout		: 'form',
						items		: [{
							xtype		: 'datefield',
							fieldLabel	: 'Due date',
							dataIndex	: 'due_date',
							name		: 'due_date',
						},Ext.apply({
							fieldLabel	: 'Priority',
							dataIndex	: 'priority.id',
							name		: 'priority.id'
						},Ext.org.micoli.redmine.service.enumerations.issue_priorities.comboCfg),Ext.apply({
							fieldLabel	: 'Assignee',
							dataIndex	: 'assigned_to.id',
							name		: 'assigned_to.id',
						},Ext.org.micoli.redmine.service.enumerations.users.dynComboCfg)]
					},{
						columnWidth	:.3,
						layout		: 'form',
						items		: [{
							xtype		: 'eu.sm.form.renderedPercentageField',
							fieldLabel	: '% done',
							dataIndex	: 'done_ratio',
							name		: 'done_ratio'
						},{
							fieldLabel	: 'Spent Hours',
							xtype		: 'textfield',
							dataIndex	: 'spent_hours',
							name		: 'spent_hours'
						}]
					}]
				}]
			},{
				xtype		: 'tabpanel',
				region		: 'center',
				id			: that.detailTabpanelId,
				activeTab	: 3,
				items		: [{
					xtype				: 'eu.sm.redmine.noteEditor',
					title				: 'Description',
					dataIndex			: 'description',
					redmineService		: that.redmineService
				},{
					title				: 'Journal',
					xtype				: 'editorgrid',
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
								rowParams.body = '<div class="textile">'+textile((''+record.data.notes).replace(/\r/g,''))+'</div>';
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
				},{
					title				: 'Watchers',
					xtype				: 'org.micoli.redmine.watchersGrid',
					id					: that.watchersGridId,
					redmineService		: that.redmineService
				},{
					title				: 'Time tracker',
					xtype				: 'org.micoli.redmine.timeTrackersGrid',
					id					: that.timeTrackersGridId,
					redmineService		: that.redmineService
				}]
			}]
		});
		Ext.org.micoli.redmine.issueEditor.superclass.initComponent.call(this);
	}
});

Ext.reg('org.micoli.redmine.issueEditor', Ext.org.micoli.redmine.issueEditor);