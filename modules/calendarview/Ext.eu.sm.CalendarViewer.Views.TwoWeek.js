Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarViewer.Views');

Ext.eu.sm.CalendarViewer.Views.TwoWeek = Ext.extend(Ext.eu.sm.CalendarViewer.Weeks, {
	iconCls				: 'calendarSelectTwoWeekIcon',
	viewModeName		: 'twoweek',
	viewClass			: 'twoweekView',
	maxWeeks			: 2,

	calcDates			: function(){
		var that = this;
		that.currentDay = (new Date()).format('Y-m-d');
		that.CalendarViewer.dateBegin = that.CalendarViewer.date.clone();

		while (that.CalendarViewer.dateBegin.getDay()!=1){
			that.CalendarViewer.dateBegin.setDate(that.CalendarViewer.dateBegin.getDate()-1);
		}
		that.CalendarViewer.dateEnd = that.CalendarViewer.date.clone();
		while (that.CalendarViewer.dateEnd.getDay()!=0){
			that.CalendarViewer.dateEnd.setDate(that.CalendarViewer.dateEnd.getDate()+1);
		}
		that.numWeeks = 2;
		that.fireEvent('datechanged',that.CalendarViewer.date,that.CalendarViewer.dateBegin,that.CalendarViewer.dateEnd,that);
	},

	getPrevDate			: function (date){
		date.setDate(date.getDate()-7);
	},

	getNextDate			: function (date){
		date.setDate(date.getDate()+7);
	},

});
Ext.reg('CalendarViewer.views.twoweek',Ext.eu.sm.CalendarViewer.Views.TwoWeek);
