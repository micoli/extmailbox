Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarViewer.Views');

Ext.eu.sm.CalendarViewer.Views.Week = Ext.extend(Ext.eu.sm.CalendarViewer.Weeks, {
	iconCls				: 'calendarSelectWeekIcon',
	viewModeName		: 'week',
	viewClass			: 'weekView',
	maxWeeks			: 1,

	calcDates			: function(){
		var that = this;
		var d1,d2;
		that.currentDay = (new Date()).format('Y-m-d');
		d1 = that.CalendarViewer.date.clone();

		while (d1.getDay()!=1){
			d1.setDate(d1.getDate()-1);
		}
		d2 = that.CalendarViewer.date.clone();
		while (d2.getDay()!=0){
			d2.setDate(d2.getDate()+1);
		}
		that.numWeeks = 1;
		that.fireEvent('datechanged',that.CalendarViewer.date,d1,d2,that);
	},

	getPrevDate			: function (date){
		date.setDate(date.getDate()-7);
	},

	getNextDate			: function (date){
		date.setDate(date.getDate()+7);
	},

});
Ext.reg('CalendarViewer.views.week',Ext.eu.sm.CalendarViewer.Views.Week);
