Ext.onReady(function(){

	var that = this;

	that.eventStore = new Ext.data.JsonStore({
		fields			: [
			'idx',
			'title',{
				name:'date_begin',
				type:'date',
				dateFormat:'Y-m-d H:i:s'
			},{
				name:'date_end',
				type:'date',
				dateFormat:'Y-m-d H:i:s'
			},'text'],
		root			: 'data',
		idProperty		: 'idx',
		remoteSort		: true,
		autoLoad		: true,
		baseParams		: {
			'exw_action'	: 'local.calendar.getEvents'
		},
		proxy			: new Ext.data.HttpProxy({
			url				: 'proxy.php',
		}),
	});

	var viewport = new Ext.Viewport({
			layout		: 'border',
			frame		: true,
			tbar		:[{
				xtype		: 'button',
				text		: 'test',
				handler		: function(){
				}
			}],
			bbar		:[{
				xtype		: 'button',
				text		: 'test2',
				handler		: function(){
				}
			}],
			items		: [{
				xtype		: 'calendarView',
				region		: 'center',
				eventStore	: that.eventStore
			},{
				region		: 'south',
				html		: 'south',
				height		: 50,
				frame		: true,
				split		: true
			},{
				region		: 'east',
				frame		: true,
				html		: 'east',
				width		: 50,
				split		: true
			}]
	});
	Ext.QuickTips.init();
});