
Ext.onReady(function(){

	var that = this;

	var viewport = new Ext.Viewport({
		layout	: 'border',
		items	: [{
			region		: 'center',
			xtype		: 'prospectImporter.main',
		}]
	});
});