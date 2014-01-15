Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView');
/*
Ext.eu.sm.CalendarView
Ext.eu.sm.CalendarView.View
	Ext.eu.sm.CalendarView.Weeks
		Ext.eu.sm.CalendarView.Month
		Ext.eu.sm.CalendarView.Week
	Ext.eu.sm.CalendarView.Day
*/
Ext.eu.sm.CalendarView = Ext.extend(Ext.Panel, {
	viewMode			: 'month',
	date				: new Date(),
	showWeekend			: true,
	controls			: [],
	monthModeEnabled	: true,
	weekModeEnabled		: true,
	dayModeEnabled		: true,

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

		that.labelDateRangeFromId = Ext.id();
		that.labelDateRangeToId = Ext.id();
		that.datePickerId = Ext.id();
		that.viewMonthId = Ext.id();
		that.viewWeekId = Ext.id();
		that.viewDayId = Ext.id();

		that.addEvents('datechanged','dayclick','daycontextmenu','daydblclick','eventclick','eventcontextmenu','eventdblclick');

		that.viewId = Ext.id();
		Ext.apply(that,{
			layout		: 'card',
			tbar		: [{
				xtype		: 'button',
				text		: 'month',
				iconCls		: 'calendarSelectMonthIcon',
				toggleGroup	: 'viewMode',
				hidden		: !that.monthModeEnabled,
				pressed		: (that.viewMode=='month'),
				handler		: function(){
					that.viewMode='month';
					that.getLayout().setActiveItem(that.viewMonthId);
					that.setDate();
				}
			},{
				xtype		: 'button',
				text		: 'week',
				iconCls		: 'calendarSelectWeekIcon',
				toggleGroup	: 'viewMode',
				hidden		: !that.weekModeEnabled,
				pressed		: (that.viewMode=='week'),
				handler		: function(){
					that.viewMode='week';
					that.getLayout().setActiveItem(that.viewWeekId);
					that.setDate();
				}
			},{
				xtype		: 'button',
				text		: 'day',
				iconCls		: 'calendarSelectIcon',
				toggleGroup	: 'viewMode',
				hidden		: !that.dayModeEnabled,
				pressed		: (that.viewMode=='day'),
				handler		: function(){
					that.viewMode='day';
					that.getLayout().setActiveItem(that.viewDayId);
					that.setDate();
				}
			},'|',{
				xtype		: 'button',
				iconCls		: 'x-tbar-page-prev',
				handler		: function(){
					switch(that.viewMode){
						case 'day':
							that.date.setDate(that.date.getDate()-1);
						break;
						case 'week':
							that.date.setDate(that.date.getDate()-7);
						break;
						case 'month':
							that.date.setMonth(that.date.getMonth()-1);
						break;
					}
					that.setDate();
				}
			},{
				xtype		: 'button',
				iconCls		: 'x-tbar-loading',
				handler		: function(){
					that.getLayout().activeItem.date = that.date;
					that.setDate();
				}
			},{
				xtype		: 'button',
				iconCls		: 'x-tbar-page-next',
				handler		: function(){
					switch(that.viewMode){
						case 'day':
							that.date.setDate(that.date.getDate()+1);
						break;
						case 'week':
							that.date.setDate(that.date.getDate()+7);
						break;
						case 'month':
							that.date.setMonth(that.date.getMonth()+1);
						break;
					}
					that.setDate(that.date);
				}
			},'|',{
				xtype		: 'label',
				width		: 100,
				id			: that.labelDateRangeFromId
			},{
				text		: that.date.format('d/m/Y'),
				iconCls		: 'calendarSelectIcon',
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
				id			: that.labelDateRangeToId
			}].concat(that.controls),
			activeItem	: 0,
			items		: [{
				xtype		: 'calendarView.month',
				id			: that.viewMonthId,
				eventStore	: that.eventStore,
				calendarView: that,
				showWeekend	: that.showWeekend,
				listeners	:{
					scope		: that,
					datechanged	: that.displayRange
				}
			},{
				xtype		: 'calendarView.week',
				id			: that.viewWeekId,
				eventStore	: that.eventStore,
				calendarView: that,
				showWeekend	: that.showWeekend,
				listeners	:{
					scope		: that,
					datechanged	: that.displayRange
				}
			},{
				xtype		: 'calendarView.day',
				id			: that.viewDayId,
				eventStore	: that.eventStore,
				calendarView: that,
				listeners	:{
					scope		: that,
					datechanged	: that.displayRange
				}
			}]
		});

		if(that.tooltipTpl){
			that.items[0].tooltipTpl=that.tooltipTpl;
			that.items[1].tooltipTpl=that.tooltipTpl;
			that.items[2].tooltipTpl=that.tooltipTpl;
		}

		if(that.horizontalEventTpl){
			that.items[0].horizontalEventTpl=that.horizontalEventTpl;
			that.items[1].horizontalEventTpl=that.horizontalEventTpl;
			that.items[2].horizontalEventTpl=that.horizontalEventTpl;
		}

		Ext.eu.sm.CalendarView.superclass.initComponent.call(this);
	}
});

Ext.reg('calendarView',Ext.eu.sm.CalendarView);