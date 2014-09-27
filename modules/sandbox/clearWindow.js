Ext.app.Modules.clearWindow = Ext.extend(Ext.app.Module, {
	id		: 'test-win2',
	init	: function(){
		var that = this;
		that.launcher = {
			text			: 'Test clearWindow',
			iconCls			:'icon-grid',
			iconDesktopCls	:'icon-grid',
			handler			: that.createWindow,
			scope			: that
		}
	},

	createWindow : function(){
		var that	= this;
		var desktop	= this.app.getDesktop();
		var win		= desktop.getWindow(this.id);
		if(!win){
			win = desktop.createWindow({
				id				: 'grid-win',
				title			: 'Test clearWindow',
				width			: 740,
				height			: 480,
				iconCls			: 'icon-grid',
				shim			: false,
				animCollapse	: false,
				constrainHeader	: true,
				layout			: 'fit',
				items			: [{
					html : 'test window'
				}]
			});
		}
		win.show();
	}
});