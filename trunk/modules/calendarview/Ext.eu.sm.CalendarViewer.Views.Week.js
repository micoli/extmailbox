Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarViewer.Views');

Ext.eu.sm.CalendarViewer.Views.Week = Ext.extend(Ext.eu.sm.CalendarViewer.Weeks, {
	iconCls				: 'calendarSelectWeekIcon',
	viewModeName		: 'week',
	viewClass			: 'weekView',
	maxWeeks			: 1,

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
		that.numWeeks = 1;
		//console.log(that.viewModeName,that.numWeeks,'=',that.dateBegin.format('Y-m-d N'),'<',that.date.format('Y-m-d'),'>',that.dateEnd.format('Y-m-d N'));
		that.fireEvent('datechanged',that.date,that.dateBegin,that.dateEnd);
	},

	getPrevDate			: function (date){
		date.setDate(date.getDate()-7);
	},

	getNextDate			: function (date){
		date.setDate(date.getDate()+7);
	},

});
Ext.reg('CalendarViewer.views.week',Ext.eu.sm.CalendarViewer.Views.Week);
