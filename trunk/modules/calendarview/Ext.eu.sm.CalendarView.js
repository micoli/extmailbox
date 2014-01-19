Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView');
/*
Ext.eu.sm.CalendarView
Ext.eu.sm.CalendarView.View
	Ext.eu.sm.CalendarView.Weeks
		Ext.eu.sm.CalendarView.Views.Month
		Ext.eu.sm.CalendarView.Views.Week
		Ext.eu.sm.CalendarView.Views.TwoWeek
	Ext.eu.sm.CalendarView.Views.Day

	that.backDaysEventStore = new Ext.data.Store({
		reader	: new Ext.data.ArrayReader({}, Ext.data.Record.create([
			{name: 'date', type: 'date', dateFormat: 'Y-m-d'},
			{name: 'title'},
			{name: 'color'},
		])),
		id		: 'date',
		proxy	: new Ext.data.MemoryProxy(),
		autoLoad: true,
	});
*/
Ext.eu.sm.CalendarView = Ext.extend(Ext.Panel, {
	viewMode			: 'month',
	date				: new Date(),
	showWeekend			: true,
	controls			: [],
	enabledMode			: {
		'day'				: true,
		'week'				: true,
		'twoweek'			: true,
		'month'				: true,
	},
	showViewsLabel		: true,
	showRefresh			: true,
	showPrevNext		: true,
	showDatePicker		: true,
	showDateRange		: true,
	activeViews			: {},
	withTooltip			: true,

	tooltipTpl			: new Ext.XTemplate(
		'<h1>{title}</h1>'+
		'<p>From : {date_begin:date("d/m/Y H:i")}</p>'+
		'<p>To : {date_end:date("d/m/Y H:i")}</p>'+
		'<p>{content}</p>'
	),

	horizontalEventTpl	: new Ext.XTemplate(
		'{title}'+
		'<p>From : {date_begin:date("d/m/Y H:i")}</p>'+
		'<p>To : {date_end:date("d/m/Y H:i")}</p>'+
		'<p>{content}</p>'
	),

	fulldayEventTpl		: new Ext.XTemplate(
			'{title}'
	),

	dateDiff			: function (date1,date2,interval) {
		//http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
		var second=1000, minute=second*60, hour=minute*60, day=hour*24, week=day*7;
		date1 = new Date(date1);
		date2 = new Date(date2);
		var timediff = date2 - date1;
		if (isNaN(timediff)) return NaN;
		switch (interval) {
			case "years": return date2.getFullYear() - date1.getFullYear();
			case "months": return (
				( date2.getFullYear() * 12 + date2.getMonth() )
				-
				( date1.getFullYear() * 12 + date1.getMonth() )
			);
			case "weeks"  : return Math.floor(timediff / week);
			case "days"   : return Math.floor(timediff / day);
			case "hours"  : return Math.floor(timediff / hour);
			case "minutes": return Math.floor(timediff / minute);
			case "seconds": return Math.floor(timediff / second);
			default: return undefined;
		}
	},
	setDate				: function(){
		var that = this;
		that.load(that.date);
		Ext.getCmp(that.datePickerId).setText(that.date.format('d/m/Y'));
	},

	load				: function(date){
		var that = this;
		that.getLayout().activeItem.date = date
		that.eventStore.load({
			params	:{
				date_begin	:	that.getLayout().activeItem.dateBegin.format('Y-m-d H:i:s'),
				date_end	:	that.getLayout().activeItem.dateEnd.format('Y-m-d H:i:s'),
			}
		});
	},

	displayRange		: function(date,date1,date2){
		var that = this;
		if(Ext.getCmp(that.labelDateRangeFromId)){
			Ext.getCmp(that.labelDateRangeFromId).setText(date1.format('d/m/Y')==date.format('d/m/Y')?'-':date1.format('d/m/Y'));
			Ext.getCmp(that.labelDateRangeToId  ).setText(date2.format('d/m/Y')==date.format('d/m/Y')?'-':date2.format('d/m/Y'));
		}
		that.fireEvent('datechanged',that,date,date1,date2);
	},

	initComponent		: function(){
		var that = this;
		that.containerViewId		= Ext.id();
		that.labelDateRangeFromId	= Ext.id();
		that.labelDateRangeToId		= Ext.id();
		that.datePickerId			= Ext.id();
		that.menuModeId				= Ext.id();
		that.viewId					= {};
		that.menuMode				= [];
		that.items					= [];

		if(!that.tooltipFulldayTpl){
			that.tooltipFulldayTpl = that.tooltipTpl;
		}

		var n=0;
		for( var viewType in Ext.eu.sm.CalendarView.Views){
			var lowViewType = viewType.toLowerCase();
			if(that.enabledMode[lowViewType]){
				that.activeViews[lowViewType]	= Ext.eu.sm.CalendarView.Views[viewType].prototype;
				that.viewId		[lowViewType]	= Ext.id();
				that.items.push({
					xtype			: 'calendarView.views.'+lowViewType,
					id				: that.viewId[lowViewType],
					calendarView	: that,
					listeners		:{
						scope			: that,
						datechanged		: that.displayRange
					}
				});
				if(that.viewMode==lowViewType){
					that.activeItem=n;
				}
				n++;
				that.menuMode.push({
					xtype		: 'button',
					toggleGroup	: 'viewMode',
					iconCls		: that.activeViews[lowViewType].iconCls,
					text		: lowViewType,
					pressed		: (that.viewMode==lowViewType),
					handler		: (function(type){
						return function(){
							that.viewMode=type;
							Ext.getCmp(that.menuModeId).setIconClass(that.activeViews[type].iconCls);
							Ext.getCmp(that.menuModeId).setText(type);
							that.getLayout().setActiveItem(that.viewId[type]);
							that.setDate();
						}
					})(lowViewType)
				})
			}
		}

		that.addEvents(
			'datechanged',
			'dayclick',
			'daycontextmenu',
			'daydblclick',
			'eventclick',
			'eventcontextmenu',
			'eventdblclick'
		);

		Ext.apply(that,{
			layout		: 'card',
			tbar		: [/*{
				xtype		: 'button',
				iconCls		: 'calendarSelectIcon',
				toggleGroup	: 'viewMode',
				text		: that.showViewsLabel?'day':'',
				hidden		: !that.enabledMode['day'],
				pressed		: (that.viewMode=='day'),
				handler		: function(){
					that.viewMode='day';
					that.getLayout().setActiveItem(that.viewId['day']);
					that.setDate();
				}
			},*/new Ext.Toolbar.MenuButton({
				text	: that.viewMode,
				id		: that.menuModeId,
				iconCls	: that.activeViews[that.viewMode].iconCls,
				menu	: {
					items	:	that.menuMode
				}
			}),'|',{
				xtype		: 'button',
				iconCls		: 'calendarToday',
				handler		: function(){
					that.date = new Date();
					that.setDate();
				}
			},{
				xtype		: 'button',
				iconCls		: 'x-tbar-page-prev',
				hidden		: !that.showPrevNext,
				handler		: function(){
					that.getLayout().activeItem.getPrevDate(that.date);
					that.setDate();
				}
			},{
				xtype		: 'button',
				iconCls		: 'x-tbar-loading',
				hidden		: !that.showRefresh,
				handler		: function(){
					that.getLayout().activeItem.date = that.date;
					that.setDate();
				}
			},{
				xtype		: 'button',
				iconCls		: 'x-tbar-page-next',
				hidden		: !that.showPrevNext,
				handler		: function(){
					that.getLayout().activeItem.getNextDate(that.date);
					that.setDate();
				}
			},'|',{
				xtype		: 'label',
				width		: 100,
				hidden		: !that.showDateRange,
				id			: that.labelDateRangeFromId
			},{
				text		: that.date.format('d/m/Y'),
				iconCls		: 'calendarSelectIcon',
				hidden		: !that.showDatePicker,
				id			: that.datePickerId,
				menu		: new Ext.menu.DateMenu({
					startDay	: 1,
					listeners	: {
						show		: function(datePickerMenu){
							datePickerMenu.picker.setValue(that.date);
						}
					},
					handler 	: function(dp, date){
						that.date = date.clone();
						that.setDate();
					}
				})
			},{
				xtype		: 'label',
				width		: 100,
				hidden		: !that.showDateRange,
				id			: that.labelDateRangeToId
			}].concat(that.controls)
		});

		Ext.eu.sm.CalendarView.superclass.initComponent.call(this);
	}
});

Ext.reg('calendarView',Ext.eu.sm.CalendarView);