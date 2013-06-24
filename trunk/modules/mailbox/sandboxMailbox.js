Ext.onReady(function(){
	Ext.QuickTips.init();

	new Ext.Viewport({
		layout:'border',
		items:[{
			region			:'center',
			xtype			: 'mailbox.mailbox',
			gridConfig		: {
				pageSize		: 25
			},
			viewMailConfig	: {
				viewInlineImg	: false
			}
		}]
	});

});