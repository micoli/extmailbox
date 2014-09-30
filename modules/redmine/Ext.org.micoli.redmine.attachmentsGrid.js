Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.attachmentsGrid = Ext.extend(Ext.grid.GridPanel,{
	addAttachment : function(record,addOrEdit){
		var that = this;
		that.openAttachmentEditor({
			id				: null,
			issue_id		: that.issue_id,
			date			: new Date()
		},'add');
	},

	openAttachmentEditor : function(record,addOrEdit){
		var that = this;
		that.uppanelid = Ext.id();

		var windowParams = {
			modalContainer		: that,
			title				: 'Add attachment',
			modalContainerBorder: -1,
			width				: 600,
			height				: 170,
			frame				: true,
			hideBorders			: true,
			border				: false,
			layout				: 'fit',
			cancelButton		: true,
			okButton			: false,
			items				: [/*{
				xtype			: 'uploadpanel',
				buttonsAt		: 'tbar',
				id				: that.uppanelid,
				url				: that.redmineService.requestPrm({url: 'uploads.json'}).url,
				maxFileSize		: 1048576,
				enableProgress	: true,
				listeners		: {
					fileadd			: function (uploader, store, record){
						uploader.uploader.upload();
					}
				}
			}*/]
//			that.attachmentsStore.removeAll();
//			that.attachmentsStore.load();
//			attachWin.destroy();
		}
		var attachWin = new Ext.ModalWindow(windowParams);
		attachWin.show();
	},

	reload				: function(){
		var that			= this;
		that.redmineService.request({
			method			: 'GET',
			url				: 'issues/'+that.issue_id+'.json',
			params			: {
				include			: 'attachments'
			},
			headers			: {
				Accept			: 'application/json'
			},
			success			: function (data){
				eval('var result = '+data.responseText);
				that.attachmentsStore.removeAll();
				that.attachmentsStore.loadData(result.issue);
			}
		});
	},

	initComponent		: function(){
		var that			= this;

		that.attachmentsStore = new Ext.data.JsonStore({
			fields			: [
				'id',
				{name:'filesize',type:'int'},
				'content_type',
				'description',
				'content_url',
				'author.id',
				'author.name',
				{name:'created_on',type:'date'},
			],
			root			: 'attachments',
			idProperty		: 'id',
			proxy			: new Ext.data.MemoryProxy({})
		});

		that.attachmentsStoreActions = new Ext.ux.grid.RowActions({
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
					Ext.Msg.alert('...todo...','todo');
					/*that.redmineService.request({
						method			: 'DELETE',
						url				: 'time_entries/'+record.get('id')+'.json',
						headers			: {
							Accept: 'application/json'
						},
						success			: function (response){
							console.log(arguments);
							that.attachmentsStore.removeAll();
							that.attachmentsStore.load();
						}
					});*/
				}
			}
		});

		Ext.apply(this,{
			store				: that.attachmentsStore,
			tbar				: [{
				xtype				: 'button',
				text				: 'add',
				handler				: function(){
					that.addAttachment();
				}
			},'->',{
				xtype				: 'button',
				text				: 'reload',
				handler				: function(){
					that.reload();
				}
			}],
			loadMask			: true,
			autoExpandColumn	: 'description',
			plugins				: [that.attachmentsStoreActions],
			cm					: new Ext.grid.ColumnModel([{
				id					: 'description',
				header				: 'description',
				dataIndex			: 'description',
				width				: 120,
				fixed				: false
			},{
				id					: 'filesize',
				header				: 'filesize',
				dataIndex			: 'filesize',
				width				: 120,
				align				: 'right',
				fixed				: false
			},{
				id					: 'user',
				header				: 'User',
				dataIndex			: 'author.name',
				width				: 120,
				fixed				: false
			},{
				id					: 'content_type',
				header				: 'content_type',
				dataIndex			: 'content_type',
				width				: 120,
				fixed				: false
			},{
				id					: 'created_on',
				header				: 'Created on',
				dataIndex			: 'created_on',
				fixed				: false,
			},that.attachmentsStoreActions]),
		});

		Ext.org.micoli.redmine.attachmentsGrid.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('org.micoli.redmine.attachmentsGrid', Ext.org.micoli.redmine.attachmentsGrid);
