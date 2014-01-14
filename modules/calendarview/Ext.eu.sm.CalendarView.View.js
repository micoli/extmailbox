Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView');

Ext.eu.sm.CalendarView.View = Ext.extend(Ext.Panel, {
	date				: new Date(),
	dateBegin			: null,
	dateEnd				: null,
	showWeekend			: true,
	domDates			: {},
	withTooltip			: true,

	initComponent		: function(){
		var that = this;
		if(!that.tooltipTpl){
			that.tooltipTpl	= new Ext.XTemplate(
				'<h1>{title}</h1>'+
				'<p>From : {date_begin:date("d/m/Y H:i")}</p>'+
				'<p>To : {date_end:date("d/m/Y H:i")}</p>'+
				'<p>{content}</p>'
			);
		}
		if(!that.horizontalEventTpl){
			that.horizontalEventTpl = new Ext.XTemplate(
					'{title}'+
					'<p>From : {date_begin:date("d/m/Y H:i")}</p>'+
					'<p>To : {date_end:date("d/m/Y H:i")}</p>'+
					'<p>{content}</p>'
			);
		}


		Ext.eu.sm.CalendarView.View.superclass.initComponent.call(this);

		that.eventStore.on('load',function(store,records,options){
			that.displayEvents();
		});
	},

	isActive			: function(mode){
		var that = this;
		return that.calendarView.viewMode==mode;
	},

	getWeekDayName		: function(idx){
		return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][idx];
	},

	calcDates			: function(){
		var that = this;
		that.fireEvent('initdates',that.dateBegin,that.dateEnd);
	},

	refresh				: function(auto){
		var that = this;
		that.calcDates();
		if(auto==undefined){
			this.lastSize=-1;
			that.setSize(that.getSize());
			that.displayView();
		}
	},

	displayEvents		: function(){
		var that = this;
		that.refresh();
	},

	displayView			:  function(){
		var that = this;
	},

	onResize: function(ct, position){
		var that = this;
		Ext.eu.sm.CalendarView.View.superclass.onResize.call(this, ct, this.maininput);
		that.displayView();
	},

	afterRender: function(ct, position){
		var that = this;
		that.refresh();
		Ext.eu.sm.CalendarView.View.superclass.afterRender.call(that, ct);
	},
});