Ext.onReady(function(){

	var that = this;

	that.eventStore = new Ext.data.JsonStore({
		fields			: ['idx','title','date_begin','date_end','text'],
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
				store		: that.eventStore
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
});