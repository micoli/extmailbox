Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView.Views');

Ext.eu.sm.CalendarView.Views.TwoWeek = Ext.extend(Ext.eu.sm.CalendarView.Weeks, {
	iconCls				: 'calendarSelectTwoWeekIcon',
	viewModeName		: 'twoweek',
	viewClass			: 'twoweekView',
	maxWeeks			: 2,

	calcDates			: function(){
		var that = this;
		that.currentDay = (new Date()).format('Y-m-d');
		that.dateBegin = that.date.clone();

		while (that.dateBegin.getDay()!=1){
			that.dateBegin.setDate(that.dateBegin.getDate()-1);
		}
		that.dateEnd = that.date.clone();
		while (that.dateEnd.getDay()!=0){
			that.dateEnd.setDate(that.dateEnd.getDate()+1);
		}
		that.numWeeks = 2;
		console.log(that.viewModeName,that.numWeeks,'=',that.dateBegin.format('Y-m-d N'),'<',that.date.format('Y-m-d'),'>',that.dateEnd.format('Y-m-d N'));
		that.fireEvent('datechanged',that.date,that.dateBegin,that.dateEnd);
	},

	getPrevDate			: function (date){
		date.setDate(date.getDate()-14);
	},

	getNextDate			: function (date){
		date.setDate(date.getDate()+14);
	},

});
Ext.reg('calendarView.views.twoweek',Ext.eu.sm.CalendarView.Views.TwoWeek);
