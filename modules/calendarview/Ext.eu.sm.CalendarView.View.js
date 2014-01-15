Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView');

Ext.eu.sm.CalendarView.View = Ext.extend(Ext.Panel, {
	date				: new Date(),
	dateBegin			: null,
	dateEnd				: null,
	showWeekend			: true,
	domDates			: {},
	datesDom			: {},
	withTooltip			: true,
	maxColorClasses		: 18,
	contentSelectorClass: '',
	viewModeName		: '',

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
		if(!that.isActive(that.viewModeName)){
			return
		}
		that.refresh();
		that.cleanEvents();
		var gIdx=-1;
		that.eventStore.each(function(record){
			var numDays = Ext.eu.sm.CalendarView.prototype.dateDiff(record.get('date_begin'),record.get('date_end'),'days')+1;
			var dateEvent = new Date(record.get('date_begin').format('Y-m-d'));

			gIdx = (gIdx+1)%that.maxColorClasses;

			for(n=1;n<=numDays;n++){
				var parentDom = that.domDates[dateEvent.format('Y-m-d')];
				if(parentDom){
					if(that.showWeekend || (!that.showWeekend && dateEvent.getDay()!=0 && dateEvent.getDay()!=6)){
						that.createLinearEvent(parentDom, record,n,numDays,gIdx);
					}
				}
				dateEvent.setDate(dateEvent.getDate()+1);
				if (dateEvent>that.dateEnd){
					break;
				}
			}
		})
	},

	createLinearEvent	: function(parentDom,record,n,numDays,eventNum){
		var that = this;
		var containerContent = that.days[parentDom.index].child(that.contentSelectorClass);
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

		var colorClass = 'event-color-'+eventNum;
		if (!isNaN(record.get('colorIdx'))){
			colorClass = 'event-color-'+record.get('colorIdx');
		}

		var boxEvent = new Ext.BoxComponent({
			renderTo	: boxEventIdx,
			dataIdx		: record.get('idx'),
			autoEl		: {
				tag			: 'div',
				class		: 'event  evt-idx-'+record.get('idx')+' '+colorClass,
				style		: {
					'margin-left'	: ''+left+'px',
					'margin-right'	: ''+right+'px'
				},
				html	: that.horizontalEventTpl.apply(record.data)
			},
			listeners	: {
				render		: function(component) {
					if(that.withTooltip){
						new Ext.ToolTip({
							target	: component.el.id,
							html	: that.tooltipTpl.apply(record.data)
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