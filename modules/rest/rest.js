Ext.onReady(function() {
	Ext.QuickTips.init();
	var that = this;

	var viewport = new Ext.Viewport({
		layout	: 'border',
		items	: [{
			region	: 'center',
			xtype	: 'rest.mainPanel'
		}]
	});
});
