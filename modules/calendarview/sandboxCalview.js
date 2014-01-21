Ext.onReady(function(){
	var that = this;
	that.triggerTreeId='azaz';

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
	that.memStore = new Ext.data.JsonStore({
		fields : [
			{name: 'f1'},
			{name: 'f2'}
		],
		idProperty		: 'title',
		proxy	: new Ext.data.MemoryProxy(),
		autoLoad: false
	});
	that.memStore.loadData([{
		f1:"aa",
		f2:1
	},{
		f1:"bb",
		f2:2
	},{
		f1:"cc",
		f2:3
	},{
		f1:"dd",
		f2:4
	}]);

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
				xtype				: 'CalendarViewer',
				region				: 'center',
				eventStore			: that.eventStore,
				//dayModeEnabled		: false,
				showWeekend			: true,
				showViewsLabel		: false,
				controls			: ['|',{
					xtype				: 'triggertree',
					value				: '2.1',
					id					: that.triggerTreeId,
					listeners			:{
						beforeselect		: function(newValue,oldValue,node){
							console.log('beforeselect',newValue,oldValue,node);
						},
						select				: function(newValue,node){
							console.log('select',newValue,node);
						}
					},
					children			: [{
						text			: 'grp1',
						id				: '1',
						expanded		: true,
						children		: [{
							text			: 'grp 1.1',
							id				: '1.1',
							expanded		: true,
							leaf			: false,
							children		: [{
								text			: 'grp 1.1.1',
								id				: '1.1.1',
								leaf			: true
							},{
								text			: 'grp 1.1.2',
								id				: '1.1.2',
								leaf			: true
							}]
						},{
							text			: 'grp 1.2',
							id				: '1.2',
							leaf			: true
						}]
					},{
						text			: 'grp2',
						id				: '2',
						expanded		: true,
						children		: [{
							text			: 'grp 2.1',
							id				: '2.1',
							leaf			: true
						},{
							text			: 'grp 2.2',
							id				: '2.2',
							leaf			: true
						}]
					}],
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
						'== {title}'+
						'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
						'<p>{date_end:date("d/m/Y-H:i")}</p>'+
						'<p>{content}</p>'
				),
				tooltipFulldayTpl	: new Ext.XTemplate(
						'-- {title}'+
						'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
						'<p>{date_end:date("d/m/Y-H:i")}</p>'+
						'<p>{content}</p>'
				),
				//date				: new Date('2013-01-01'),
				listeners			: {
					datechanged : function(CalendarViewer,date,date1,date2){
//						console.log('datechanged',date.format('Y-m-d'),date1.format('Y-m-d'),date2.format('Y-m-d'));
					},
					eventclick : function(CalendarViewer,event){
						console.log('click',CalendarViewer,event);
					},
					eventcontextmenu : function(CalendarViewer,event){
						console.log('eventcontextmenu',CalendarViewer,event);
					},
					eventdblclick : function(CalendarViewer,event){
						console.log('dblclick',CalendarViewer,event);
					},
					dayclick : function(CalendarViewer,date){
						console.log('dayclick',date);
					},
					daycontextmenu : function(CalendarViewer,date){
						console.log('daycontextmenu',date);
					},
					daydblclick : function(CalendarViewer,date){
						console.log('daydblclick',date);
					},

				}
			},{
				region		: 'south',
				html		: 'south',
				frame		: true,
				split		: true,
				height		: 50,
			},{
				region			: 'east',
				split			: true,
				width			: 250,
				html			: '--'
			}]
	});
	Ext.QuickTips.init();
});
/*
{
	xtype			: 'arraytree',
	animate			: true,
	rootVisible		: false,
	containerScroll	: true,
	rootConfig		: {
		text			:'--',
		id				:'root'
	},
	children		: [{
		text			: 'Application Design',
		id				: 'design',
		expanded		: true,
		children		: [{
			text			: 'Complex Data Binding',
			id				: 'databind',
			expanded		: true,
			children		: [{
				text			: 'Run example1',
				leaf			: true
			},{
				text			: 'Run example2',
				leaf			: true
			}]
		},{
			text			: 'Complex Data Binding2',
			id				: 'databind',
			expanded		: true,
			children		: [{
				text			: 'Run example21',
				iconCls			: 'icon-run',
				leaf			: true
			},{
				text			: 'Run example22',
				iconCls			: 'icon-run',
				leaf			: true
			}]
		}],
	}],
}
*/