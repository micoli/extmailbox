Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.timeTrackersGrid = Ext.extend(Ext.grid.GridPanel,{
	addTimeTracker : function(record,addOrEdit){
		var that = this;
		that.openLogEditor({
			id				: null,
			issue_id		: that.issue_id,
			date			: new Date(),
			hours			: 1,
			activity_id		: Ext.org.micoli.redmine.service.enumerations.defaultTimeEntryActivity.id
		},'add');
	},
	openLogEditor : function(record,addOrEdit){
		var that = this;
		var windowParams = {
			modalContainer		: that,
			title				: '',
			modalContainerBorder: -1,
			width				: 600,
			height				: 170,
			frame				: true,
			hideBorders			: true,
			border				: false,
			layout				: 'fit',
			cancelButton		: false,
			okButton			: false,
			items				: [{
				xtype				: 'eu.sm.redmine.timeLogEditor',
				redmineService		: that.redmineService,
				addOrEdit			: addOrEdit,
				listeners			: {
					render				: function(form){
						console.log(record);
						form.setValues(record);
					},
					saved				: function(){
						that.timeTrackersStore.removeAll();
						that.timeTrackersStore.load();
						attachWin.destroy();
					},
					cancel				: function(){
						attachWin.destroy();
					}
				}
			}]
		}
		var attachWin = new Ext.ModalWindow(windowParams);
		attachWin.show();
	},

	initComponent		: function(){
		var that			= this;

		that.timeTrackersStore = new Ext.data.JsonStore({
			fields			: [
				'id',
				'activity.id',
				'activity.name',
				'comments',
				'user.id',
				'user.name',
				'project.id',
				'project.name',
				'hours',
				{name:'created_on',type:'date'},
				{name:'updated_on',type:'date'},
				{name:'spent_on',type:'date'},

			],
			root			: 'time_entries',
			idProperty		: 'id',
			proxy			: new Ext.data.HttpProxy(that.redmineService.requestPrm({
				method			: 'GET',
				url				: 'issues/0/time_entries.json',
			}))
		});

		that.timeTrackersStoreActions = new Ext.ux.grid.RowActions({
			header			: 'Actions',
			autoWidth		: true,
			keepSelection	: true,
			actions			: [{
				tooltip			: 'Edit',
				qtip			: 'edit',
				iconCls			: 'icon-application_edit',
			},{
				tooltip			: 'Delete',
				qtip			: 'delete',
				iconCls			: 'icon-delete',
			}],
			callbacks:{
				'icon-application_edit'	: function(grid, record, action, row, col) {
					//console.log('Callback: icon-application_edit', 'You have clicked row: <b>{0}</b>, action: <b>{0}</b>', row, action);
					that.openLogEditor({
						issue_id		: that.issue_id,
						id				: record.get('id'),
						date			: record.get('spent_on'),
						hours			: record.get('hours'),
						activity_id		: record.get('activity.id'),
						comments		: record.get('comments')
					},'edit');
				},
				'icon-delete'			: function(grid, record, action, row, col) {
					that.redmineService.request({
						method			: 'DELETE',
						url				: 'time_entries/'+record.get('id')+'.json',
						headers			: {
							Accept: 'application/json'
						},
						success			: function (response){
							console.log(arguments);
							that.timeTrackersStore.removeAll();
							that.timeTrackersStore.load();
						}
					});
					console.log('Callback: icon-delete', 'You have clicked row: <b>{0}</b>, action: <b>{0}</b>', row, action);
				}
			}
		});

		Ext.apply(this,{
			store				: that.timeTrackersStore,
			tbar				: [{
				xtype				: 'button',
				text				: 'add',
				handler				: function(){
					that.addTimeTracker();
				}
			},'->',{
				xtype				: 'button',
				text				: 'reload',
				handler				: function(){
					that.timeTrackersStore.removeAll();
					that.timeTrackersStore.load();
				}
			}],
			loadMask			: true,
			autoExpandColumn	: 'comments',
			plugins				: [that.timeTrackersStoreActions],
			cm					: new Ext.grid.ColumnModel([{
				id					: 'activity',
				header				: 'Activity',
				dataIndex			: 'activity.name',
				width				: 120,
				fixed				: false
			},{
				id					: 'project',
				header				: 'Project',
				dataIndex			: 'project.name',
				width				: 120,
				fixed				: false
			},{
				id					: 'user',
				header				: 'User',
				dataIndex			: 'user.name',
				width				: 120,
				fixed				: false
			},{
				id					: 'hours',
				header				: 'Hours',
				dataIndex			: 'hours',
				width				: 120,
				fixed				: false
			},{
				id					: 'comments',
				header				: 'comments',
				dataIndex			: 'comments',
				width				: 120,
				fixed				: false
			},{
				id					: 'spent_on',
				header				: 'spent_on',
				dataIndex			: 'spent_on',
				fixed				: false,
			},that.timeTrackersStoreActions]),
			listeners	:	{
				beforeedit : function(e){
				},
				rowclick	: function(grid,rowIndex,e){
					//Ext.getCmp(that.issueEditorId).refresh(grid.getStore().getAt(rowIndex));
				}
			}
		});

		Ext.org.micoli.redmine.timeTrackersGrid.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('org.micoli.redmine.timeTrackersGrid', Ext.org.micoli.redmine.timeTrackersGrid);
