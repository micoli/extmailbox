Ext.define('qd.system.fileExplorer', {
	extend		: 'Ext.Panel',
	alias		: 'widget.qd.system.fileExplorer',
	border		: false,
	timer		: null,

	initComponent : function() {
		var that			= this;
		that.explorer1id	= Ext.id();
		that.explorer2id	= Ext.id();

		Ext.apply(this, {
			layout		: 'border',
			items		: [{
				region				: 'center',
				xtype				: 'fileBrowser',
				root				: '/',
				id					: that.explorer1id,
				border				: false,
				viewPreview			: true,
				viewFiles			: true,
				viewFolders			: true,
				withSelection		: true,
				withEditing			: true,
				withFileRenaming	: true,
				tbarConfig			: [{
					xtype				: 'button',
					text				: 'test',
					handler				: function(){
						console.log('eee');
					}
				}],
				/*fileSelModel: {
					selType		: 'checkboxmodel',
					mode		: 'MULTI',
					listeners	: {
						selectionchange	: function( grid, selected, eOpts ){
							console.log( grid, selected, eOpts );
							//return true;
						}
					}
				},*/
				listeners : {
					selectionchanged: function(that,store,record,value){
						console.log(that,store,record,value);
					},
					folderclick		: function (filebrowser,root,record){
						console.log('folderclick',filebrowser,root,record);
					},
					folderdblclick	: function (filebrowser,root,record){
						console.log('folderdblclick',filebrowser,root,record);
					},
					fileclick		: function (filebrowser,root,record){
						console.log('fileclick',filebrowser,root,record);
					},
					filedblclick	: function (filebrowser,root,record){
						console.log('filedblclick',filebrowser,root,record);
					}
				}
			},{
				region		: 'east',
				width		: '50%',
				split		: true,
				xtype		: 'fileBrowser',
				root		: '/',
				id			: that.explorer2id,
				border		: false,
				viewPreview	: true,
				viewFiles	: true,
				viewFolders : true,
				listeners : {
					folderclick		: function (filebrowser,root,record){
						console.log('folderclick',filebrowser,root,record);
					},
					folderdblclick	: function (filebrowser,root,record){
						console.log('folderdblclick',filebrowser,root,record);
					},
					fileclick		: function (filebrowser,root,record){
						console.log('fileclick',filebrowser,root,record);
					},
					filedblclick	: function (filebrowser,root,record){
						console.log('filedblclick',filebrowser,root,record);
					}
				}
			}]
		});
		this.callParent(this);
	}
});