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
		that.dateBegin = that.date.getFirstDateOfMonth().clone();

		while (that.dateBegin.getDay()!=1){
			that.dateBegin.setDate(that.dateBegin.getDate()-1);
		}
		that.dateEnd = that.date.getLastDateOfMonth().clone();
		while (that.dateEnd.getDay()!=0){
			that.dateEnd.setDate(that.dateEnd.getDate()+1);
		}
		that.numWeeks = Ext.eu.sm.CalendarViewer.prototype.dateDiff(that.dateBegin,that.dateEnd,'weeks')+1;
		//console.log(that.viewModeName,that.numWeeks,'=',that.dateBegin.format('Y-m-d N'),'<',that.date.format('Y-m-d'),'>',that.dateEnd.format('Y-m-d N'));
		that.fireEvent('datechanged',that.date,that.dateBegin,that.dateEnd);
	},

	getPrevDate			: function (date){
		date.setMonth(date.getMonth()-1);
	},

	getNextDate			: function (date){
		date.setMonth(date.getMonth()+1);
	},


});
Ext.reg('CalendarViewer.views.month',Ext.eu.sm.CalendarViewer.Views.Month);