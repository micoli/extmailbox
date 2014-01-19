Ext.onReady(function(){
	var that = this;

	that.eventStore = new Ext.data.JsonStore({
		fields			: [
			'idx',
			'type',
			'eventClass',
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
				xtype				: 'calendarView',
				region				: 'center',
				eventStore			: that.eventStore,
				//dayModeEnabled		: false,
				showWeekend			: true,
				showViewsLabel		: false,
				controls			: ['|',{
					xtype				: 'button',
					text				: 'rr',
					handler				: function(){
						console.log(this);
					}
				}],
				horizontalEventTpl	: new Ext.XTemplate(
						'{title}'+
						'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
						'<p>{date_end:date("d/m/Y-H:i")}</p>'+
						'<p>{content}</p>'
				),
				tooltipTpl			: new Ext.XTemplate(
						'{title}'+
						'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
						'<p>{date_end:date("d/m/Y-H:i")}</p>'+
						'<p>{content}</p>'
				),
				tooltipFulldayTpl	: new Ext.XTemplate(
						'{title}'+
						'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
						'<p>{date_end:date("d/m/Y-H:i")}</p>'+
						'<p>{content}</p>'
				),
				//date				: new Date('2013-01-01'),
				listeners			: {
					datechanged : function(calendarView,date,date1,date2){
//						console.log('datechanged',date.format('Y-m-d'),date1.format('Y-m-d'),date2.format('Y-m-d'));
					},
					eventclick : function(calendarView,event){
						console.log('click',calendarView,event);
					},
					eventcontextmenu : function(calendarView,event){
						console.log('eventcontextmenu',calendarView,event);
					},
					eventdblclick : function(calendarView,event){
						console.log('dblclick',calendarView,event);
					},
					dayclick : function(calendarView,date){
						console.log('dayclick',date);
					},
					daycontextmenu : function(calendarView,date){
						console.log('daycontextmenu',date);
					},
					daydblclick : function(calendarView,date){
						console.log('daydblclick',date);
					},

				}
			},{
				region		: 'south',
				html		: 'south',
				height		: 50,
				frame		: true,
				split		: true
			},{
				region		: 'east',
				frame		: true,
				//html		: 'east',
				width		: 50,
				layout		: 'fit',
				items		:[{
					xtype		: 'panel',
				}],
				split		: true
			}]
	});
	Ext.QuickTips.init();
});