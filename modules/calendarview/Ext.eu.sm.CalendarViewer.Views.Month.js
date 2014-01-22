Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarViewer.Views');

Ext.eu.sm.CalendarViewer.Views.Month = Ext.extend(Ext.eu.sm.CalendarViewer.Weeks, {
	iconCls				: 'calendarSelectMonthIcon',
	viewModeName		: 'month',
	viewClass			: 'monthView',
	maxWeeks			: 6,

	calcDates			: function(){
		var that = this;
		that.currentDay = (new Date()).format('Y-m-d');
		var d1,d2;
		d1 = that.CalendarViewer.date.getFirstDateOfMonth().clone();

		while (d1.getDay()!=1){
			d1.setDate(d1.getDate()-1);
		}
		d2 = that.CalendarViewer.date.getLastDateOfMonth().clone();
		while (d2.getDay()!=0){
			d2.setDate(d2.getDate()+1);
		}
		that.numWeeks = Ext.eu.sm.CalendarViewer.prototype.dateDiff(d1,d2,'weeks')+1;
		that.fireEvent('datechanged',that.CalendarViewer.date,d1,d2,that);
	},

	getPrevDate			: function (date){
		date.setMonth(date.getMonth()-1);
	},

	getNextDate			: function (date){
		date.setMonth(date.getMonth()+1);
	},


});
Ext.reg('CalendarViewer.views.month',Ext.eu.sm.CalendarViewer.Views.Month);