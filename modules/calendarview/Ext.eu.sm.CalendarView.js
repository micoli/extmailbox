Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView');

Ext.eu.sm.CalendarView = Ext.extend(Ext.Panel, {
	viewMode			: 'month',
	date				: new Date(),

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

	displayRange		: function(date1,date2){
		var that = this;
		if(Ext.getCmp(that.labelDateRangeId)){
			Ext.getCmp(that.labelDateRangeId).setText(date1.format('d/m/Y')+' - '+date2.format('d/m/Y'));
		}
	},

	initComponent		: function(){
		var that = this;

		that.labelDateRangeId = Ext.id();
		that.viewMonthId = Ext.id();
		that.viewWeekId = Ext.id();

		that.addEvents('dayclick','eventclick','eventdblclick');

		that.viewId = Ext.id();
		Ext.apply(that,{
			layout		: 'card',
			tbar		:[{
				xtype		: 'button',
				text		: 'previous',
				iconCls		: 'x-tbar-page-prev',
				handler		: function(){
					switch(that.viewMode){
						case 'month':
							that.date.setMonth(that.date.getMonth()-1);
						break;
						case 'week':
							that.date.setDate(that.date.getDate()-7);
						break;
					}
					that.load(that.date);
				}
			},{
				xtype		: 'button',
				text		: 'refresh',
				iconCls		: 'x-tbar-loading',
				handler		: function(){
					that.getLayout().activeItem.date = that.date;
					that.load(that.date);
				}
			},{
				xtype		: 'button',
				iconCls		: 'x-tbar-page-next',
				text		: 'next',
				handler		: function(){
					switch(that.viewMode){
						case 'month':
							that.date.setMonth(that.date.getMonth()+1);
						break;
						case 'week':
							that.date.setDate(that.date.getDate()+7);
						break;
					}
					that.load(that.date);
				}
			},'|',{
				xtype		: 'label',
				id			: that.labelDateRangeId
			},'|',{
				text		: 'date',
				iconCls		: 'calendarSelectIcon',
				menu		: new Ext.menu.DateMenu({
					startDay	: 1,
					handler 	: function(dp, date){
						that.date = date.clone();
						that.load(that.date);
					}
				})
			},{
				xtype		: 'button',
				text		: 'month',
				iconCls		: 'calendarSelectMonthIcon',
				toggleGroup	: 'viewMode',
				pressed		: (that.viewMode=='month'),
				handler		: function(){
					that.viewMode='month';
					that.getLayout().setActiveItem(that.viewMonthId);
					that.load(that.date);
				}
			},{
				xtype		: 'button',
				text		: 'week',
				iconCls		: 'calendarSelectWeekIcon',
				toggleGroup	: 'viewMode',
				pressed		: (that.viewMode=='week'),
				handler		: function(){
					that.viewMode='week';
					that.getLayout().setActiveItem(that.viewWeekId);
					that.load(that.date);
				}
			}],
			activeItem	: 0,
			items		: [{
				xtype		: 'calendarView.month',
				id			: that.viewMonthId,
				eventStore	: that.eventStore,
				calendarView: that,
				listeners	:{
					scope		: that,
					initdates	: that.displayRange
				}
			},{
				xtype		: 'calendarView.week',
				id			: that.viewWeekId,
				eventStore	: that.eventStore,
				calendarView: that,
				listeners	:{
					scope		: that,
					initdates	: that.displayRange
				}
			}]
		});
		if(that.tooltipTpl){
			that.items[0].tooltipTpl=that.tooltipTpl;
			that.items[1].tooltipTpl=that.tooltipTpl;
		}
		if(that.monthEventTpl){
			that.items[0].eventTpl=that.monthEventTpl;
		}
		if(that.weekEventTpl){
			that.items[1].eventTpl=that.weekEventTpl;
		}
		Ext.eu.sm.CalendarView.superclass.initComponent.call(this);
	}
});

Ext.reg('calendarView',Ext.eu.sm.CalendarView);