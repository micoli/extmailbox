Ext.onReady(function(){
	Ext.QuickTips.init();

	new Ext.Viewport({
		layout:'border',
		items:[{
			region			: 'center',
			xtype			: 'mailbox.mailbox',
			mailLayout		: 'threePane',
			//mailLayout		: 'gridOnNorth',
			gridConfig		: {
				pageSize		: 25
			},
			viewMailConfig	: {
				displayInlineComponents	: false
			}
		}]
	});

});