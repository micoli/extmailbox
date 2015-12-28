Ext.onReady(function() {
	Ext.QuickTips.init();

	var viewport = new Ext.Viewport({
		layout	: 'fit',
		items	: [{
			xtype		: 'tabpanel',
			activeTab	: 0,
			items		: [{
				title		: 'Rest - URL',
				xtype		: 'rest.mainPanel'
			}]
		}]
	});
});
