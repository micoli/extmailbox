Ext.onReady(function(){
	Ext.QuickTips.init();
	var mailGridCellActions=new Ext.ux.grid.CellActions({
		callbacks	: {
			'x-tbar-loading':function(grid, record, action, value) {
				alert("open client "+record.get('user_data_01'));
			}
		},
		align		: 'left'
	});
	new Ext.Viewport({
		layout:'border',
		items:[{
			region			: 'center',
			xtype			: 'mailbox.mailbox',
			mailLayout		: 'threePane',
			svcImapClass	: 'MailboxImapExt',
			svcSmtpClass	: 'MailboxSmtpExt',
			mailLayout		: 'gridOnNorth',//threePane || gridOnNorth
			gridConfig		: {
				pageSize		: 10,
				gridPlugins		: [mailGridCellActions],
				customListeners		:{
					postInit		: function(container){
						container.gridColumnModel.splice(2, 0, {
							header		: Ext.eu.sm.MailBox.i18n._("UD01"),
							width		:  40,
							sortable	: true,
							fixed		: true,
							dataIndex	: 'user_data_01',
							renderer	: function(v,meta,record){
								return v;
							},
							cellActions:[{
								iconCls:'x-tbar-loading',
								qtip:'open Client'
							}]
						});
					}
				}
			},
			viewMailConfig	: {
				displayInlineComponents	: false,
				customListeners		:{
					postLoadMessageContent	: function(container){
						Ext.getCmp(container.customToolbarClientButtonId).setText('client '+container.record.get('user_data_01'));
					},
					postInit				: function(container){
						container.customToolbarClientButtonId=Ext.id();
						container.viewTBar.splice(12,0,'-');
						container.viewTBar.splice(13,0,{
							xtype		: 'button',
							id			: container.customToolbarClientButtonId,
							text		: Ext.eu.sm.MailBox.i18n._('____'),
							handler		: function (cmp){
								alert('client '+ container.record.get('user_data_01'));
							}
						});
					}
				}
			}
		}]
	});
});