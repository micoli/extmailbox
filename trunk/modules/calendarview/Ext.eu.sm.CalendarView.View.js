Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView');
//http://stackoverflow.com/questions/11311410/visualization-of-calendar-events-algorithm-to-layout-events-with-maximum-width
//http://jsbin.com/akudop/edit#javascript,html,live
Ext.eu.sm.CalendarView.View = Ext.extend(Ext.Panel, {
	date						: new Date(),
	dateBegin					: null,
	dateEnd						: null,
	domDates					: {},
	datesDom					: {},
	withTooltip					: true,
	maxColorClasses				: 18,
	contentSelectorClass		: '.dayView-content-holder',
	contentFulldaySelectorClass	: '.dayView-fullday-content',
	viewModeName				: '',

	initComponent		: function(){
		var that = this;

		Ext.eu.sm.CalendarView.View.superclass.initComponent.call(this);

		that.calendarView.eventStore.on('load',function(store,records,options){
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
		if(!that.isActive(that.viewModeName)){
			return
		}
		that.refresh();
		that.cleanEvents();
		var gIdx=-1;
		that.calendarView.eventStore.each(function(record){
			var firstDateDisplayed= record.get('date_begin');
			if(firstDateDisplayed<that.dateBegin){
				firstDateDisplayed = that.dateBegin;
			}
			var numDays = Ext.eu.sm.CalendarView.prototype.dateDiff(firstDateDisplayed,record.get('date_end'),'days')+1;
			var dateEvent = new Date(firstDateDisplayed.format('Y-m-d'));
			gIdx = (gIdx+1)%that.maxColorClasses;
			for(n=1;n<=numDays;n++){
				var parentDom = that.domDates[dateEvent.format('Y-m-d')];
				if(parentDom){
					if(that.calendarView.showWeekend || (!that.calendarView.showWeekend && dateEvent.getDay()!=0 && dateEvent.getDay()!=6)){
						switch(record.get('type')){
							case 'event':
								that.createLinearEvent(parentDom, record,n,numDays,gIdx);
							break;
							case 'day':
								that.createDayEvent(parentDom, record,n,numDays,gIdx);
							break;
						}
					}
				}
				dateEvent.setDate(dateEvent.getDate()+1);
				if (dateEvent>that.dateEnd){
					break;
				}
			}
		})
	},

	attachListenersOnEvent	: function (component,parentDom,li,record,type){
		var that = this;
		var html;
		switch(type){
			case 'linear':
				html = that.calendarView.tooltipTpl.apply(record.data);
			break;
			case 'fullday':
				html =  that.calendarView.tooltipFulldayTpl.apply(record.data);
			break;
		}

		if(that.calendarView.withTooltip){
			new Ext.ToolTip({
				target	: component.el.id,
				html	: html
			});
		}

		component.el.on('click',function(evt,parentDom){
			that.calendarView.fireEvent('eventclick',that.calendarView,record.data);
			evt. stopEvent();
		});

		component.el.on('contextmenu',function(evt,parentDom){
			that.calendarView.fireEvent('eventcontextmenu',that.calendarView,record.data);
			evt. stopEvent();
		});

		component.el.on('dblclick',function(evt,parentDom){
			that.calendarView.fireEvent('eventdblclick',that.calendarView,record.data);
			evt. stopEvent();
		});

		li.on('mouseover',function(evt,parentDom){
			Ext.each(that.elTable.select('.evt-idx-'+component.dataIdx),function(el){
				el.addClass('eventOver');
			})
		});

		li.on('mouseout',function(evt,parentDom){
			Ext.each(that.elTable.select('.evt-idx-'+component.dataIdx),function(el){
				el.removeClass('eventOver');
			});
		});
	},

	createLinearEvent		: function (parentDom,record,n,numDays,eventNum){
		var that = this;
		var containerContent = that.days[parentDom.index].child(that.contentSelectorClass).child('.dayView-content');
		var boxEventIdx = Ext.id();
		var li = containerContent.createChild('<li id='+boxEventIdx+'></li>');
		var left  = 0;
		var right = 0;

		if(n==1){
			left = parseInt(record.get('date_begin').format('H'))*60+parseInt(record.get('date_begin').format('m'));
			left = parseInt((that.dayWidth/(24*60))*left);
		}
		if(n==numDays){
			right = parseInt(record.get('date_end').format('H'))*60+parseInt(record.get('date_end').format('m'));
			right = parseInt(that.dayWidth - that.dayWidth/(24*60)*right);
		}

		var eventClass = 'event-color-'+eventNum;
		if (record.get('eventClass')){
			if(!isNaN(record.get('eventClass'))){
				eventClass = 'event-color-'+record.get('eventClass');
			}else{
				eventClass = record.get('eventClass');
			}
		}

		if(n==1){
			eventClass+=' roundLeft';
		}
		if(n==numDays){
			eventClass+=' roundRight';
		}
		var boxEvent = new Ext.BoxComponent({
			renderTo	: boxEventIdx,
			dataIdx		: record.get('idx'),
			autoEl		: {
				tag			: 'div',
				class		: 'event range-event evt-idx-'+record.get('idx')+' '+eventClass,
				style		: {
					'margin-left'	: ''+left+'px',
					'margin-right'	: ''+right+'px'
				},
				html	: that.calendarView.horizontalEventTpl.apply(record.data)
			},
			listeners	: {
				render		: function(component) {
					that.attachListenersOnEvent(component,parentDom,li,record,'linear');
				}
			}
		});
	},

	createDayEvent			: function (parentDom,record,n,numDays,eventNum){
		var that = this;
		var containerContent = that.days[parentDom.index].child(that.contentFulldaySelectorClass);
		var boxEventIdx = Ext.id();
		var li = containerContent.createChild('<li id='+boxEventIdx+'></li>');

		var eventClass = 'event-color';
		if (record.get('eventClass')){
			if(!isNaN(record.get('eventClass'))){
				eventClass = 'event-color-'+record.get('eventClass');
			}else{
				eventClass = record.get('eventClass');
			}
		}

		var boxEvent = new Ext.BoxComponent({
			renderTo	: boxEventIdx,
			dataIdx		: record.get('idx'),
			autoEl		: {
				tag			: 'div',
				class		: 'event fullday-event evt-idx-'+record.get('idx')+' '+eventClass,
				html	: that.calendarView.fulldayEventTpl.apply(record.data)
			},
			listeners	: {
				render		: function(component) {
					that.attachListenersOnEvent(component,parentDom,li,record,'fullday');
				}
			}
		});
	},

	cleanEvents		: function(){
		var that = this;
		Ext.each(that.days,function(v,k){
			var t = v.child(that.contentSelectorClass).query('li');
			Ext.each(t,function(vv,kk){
				vv.remove();
			})
			var t = v.child(that.contentFulldaySelectorClass).query('li');
			Ext.each(t,function(vv,kk){
				vv.remove();
			})
		});
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