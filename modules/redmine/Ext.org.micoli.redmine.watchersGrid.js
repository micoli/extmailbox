Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.watchersGrid = Ext.extend(Ext.grid.GridPanel,{
	addWatcher : function(record,addOrEdit){
		var that = this;
		that.watcherComboId = Ext.id();

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
			items				:[{
				xtype				: 'form',
				frame				: true,
				items				: [Ext.apply({
					fieldLabel			: 'Watcher',
					dataIndex			: 'watcher',
					id					: that.watcherComboId
				},Ext.org.micoli.redmine.service.enumerations.users.dynComboCfg)]
			}],
			callbackOK			: function (win){
				var cmb = Ext.getCmp(that.watcherComboId);
				if(typeof cmb.getValue() != 'string'){
					that.redmineService.request({
						method			: 'POST',
						url				: 'issues/'+that.issue_id+'/watchers.json',
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
			Ext.getCmp(that.watcherComboId).focus();
		},100)
	},

	reload				: function(){
		var that			= this;
		that.redmineService.request({
			method			: 'GET',
			url				: 'issues/'+that.issue_id+'.json',
			params			: {
				include			: 'watchers'
			},
			headers			: {
				Accept			: 'application/json'
			},
			success			: function (data){
				eval('var result = '+data.responseText);
				that.watchersStore.removeAll();
				that.watchersStore.loadData(result.issue);
			}
		});
	},

	initComponent		: function(){
		var that			= this;

		that.watchersStore = new Ext.data.JsonStore({
			fields			: [
				'id',
				'name'
			],
			root			: 'watchers',
			idProperty		: 'id',
			proxy			: new Ext.data.MemoryProxy({})
		});

		that.watchersStoreActions = new Ext.ux.grid.RowActions({
			header			: 'Actions',
			autoWidth		: true,
			keepSelection	: true,
			actions			: [{
				tooltip			: 'Delete',
				qtip			: 'delete',
				iconCls			: 'icon-delete',
			}],
			callbacks:{
				'icon-delete'			: function(grid, record, action, row, col) {
					that.redmineService.request({
						method			: 'DELETE',
						url				: 'issues/'+that.issue_id+'/watchers/'+record.get('id')+'.json',
						headers			: {
							Accept: 'application/json'
						},
						success			: function (response){
							that.reload();
						}
					});
				}
			}
		});

		Ext.apply(this,{
			store				: that.watchersStore,
			loadMask			: true,
			autoExpandColumn	: 'name',
			plugins				: [that.watchersStoreActions],
			tbar				: [{
				text				: 'add',
				xtype				: 'button',
				handler				: function (){
					that.addWatcher();
				}
			},'->',{
				text				: 'reload',
				xtype				: 'button',
				handler				: function (){
					that.reload();
				}
			}],
			cm					: new Ext.grid.ColumnModel([{
				id					: 'name',
				header				: 'Name',
				dataIndex			: 'name',
				fixed				: false
			},that.watchersStoreActions]),
			listeners	:	{
				beforeedit : function(e){
				},
				rowclick	: function(grid,rowIndex,e){
					//Ext.getCmp(that.issueEditorId).refresh(grid.getStore().getAt(rowIndex));
				}
			}
		});

		Ext.org.micoli.redmine.watchersGrid.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('org.micoli.redmine.watchersGrid', Ext.org.micoli.redmine.watchersGrid);
