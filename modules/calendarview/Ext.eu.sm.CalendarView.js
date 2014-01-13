Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView');

Ext.eu.sm.CalendarView = Ext.extend(Ext.Panel, {
	viewMode			: 'month',
	date				: new Date(),
	dateBegin			: null,
	dateEnd				: null,

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
	initComponent		: function(){
		var that = this;
		that.viewId = Ext.id();
		Ext.apply(that,{
			layout		: 'fit',
			tbar		:[{
				xtype		: 'button',
				text		: 'previous',
				handler		: function(){
					that.date.setMonth(that.date.getMonth()-1);
					Ext.getCmp(that.viewId).date = that.date;
					that.eventStore.load();
					//Ext.getCmp(that.viewId).refresh();
				}
			},{
				xtype		: 'button',
				text		: 'refresh',
				handler		: function(){
					Ext.getCmp(that.viewId).date = that.date;
					that.eventStore.load();
					//Ext.getCmp(that.viewId).refresh();
				}
			},{
				xtype		: 'button',
				text		: 'next',
				handler		: function(){
					that.date.setMonth(that.date.getMonth()+1);
					Ext.getCmp(that.viewId).date = that.date;
					that.eventStore.load();
					//Ext.getCmp(that.viewId).refresh();
				}
			}],
			bbar		:[{
			}],
			items		:[{
				region		: 'center',
				xtype		: 'calendarView.month',
				id			: that.viewId,
				eventStore	: that.eventStore
			}]
		});
		Ext.eu.sm.CalendarView.superclass.initComponent.call(this);
	}
});
Ext.reg('calendarView',Ext.eu.sm.CalendarView);


Ext.eu.sm.CalendarView.Month = Ext.extend(Ext.Panel, {
	date				: new Date(),
	dateBegin			: null,
	dateEnd				: null,
	showWeekend			: true,
	domDates			: {},
	refresh				: function(auto){
		var that = this;
		that.dateBegin = that.date.getFirstDateOfMonth().clone();

		while (that.dateBegin.getDay()!=1){
			that.dateBegin.setDate(that.dateBegin.getDate()-1);
		}
		that.dateEnd = that.date.getLastDateOfMonth().clone();
		while (that.dateEnd.getDay()!=0){
			that.dateEnd.setDate(that.dateEnd.getDate()+1);
		}
		that.numWeeks = Ext.eu.sm.CalendarView.prototype.dateDiff(that.dateBegin,that.dateEnd,'weeks')+1;
		console.log(that.numWeeks,'=',that.dateBegin.format('Y-m-d N'),'<',that.date.format('Y-m-d'),'>',that.dateEnd.format('Y-m-d N'));
		if(auto==undefined){
			this.lastSize=-1;
			that.setSize(that.getSize());
			that.displayView();
		}
	},

	initComponent		: function(){
		var that = this;
		that.refresh(false);

		Ext.apply(that,{
			listeners:{
				afterrender:function(){
					that.displayEvents();
				}
			}
		});

		Ext.eu.sm.CalendarView.Month.superclass.initComponent.call(this);
		that.eventStore.on('load',function(store,records,options){
			that.displayEvents();
		});
	},
	displayEvents		: function(){
		var that = this;
		that.refresh();
		Ext.each(that.days,function(v,k){
			//console.log(k,v.child(".calendarView-monthView-weekView-dayView-content"));
			var t = v.child(".calendarView-monthView-weekView-dayView-content").query('li');
			Ext.each(t,function(vv,kk){
				vv.remove();
			})
		});
		var gIdx=-1;
		that.eventStore.each(function(record){
			var diff = Ext.eu.sm.CalendarView.prototype.dateDiff(record.get('date_begin'),record.get('date_end'),'days')+1;
			var dateEvent = new Date(record.get('date_begin').format('Y-m-d'));
			//console.log(record.get('date_begin'),record.get('date_end'),diff);
			gIdx = (gIdx+1)%18;
			for(n=1;n<=diff;n++){
				var dom = that.domDates[dateEvent.format('Y-m-d')];
				if(dom){
					var containerContent = that.days[dom.index].child(".calendarView-monthView-weekView-dayView-content");
					var ggIdx = Ext.id();
					var li = containerContent.createChild('<li class="" id='+ggIdx+'></li>')
					var left=0;
					var right=0;
					if(n==1){
						left = parseInt(record.get('date_begin').format('H'))*60+parseInt(record.get('date_begin').format('m'))
						left = (that.dayWidth/(24*60))*left
					}else{
						left = 0
					}
					if(n==diff){
						right = parseInt(record.get('date_end').format('H'))*60+parseInt(record.get('date_end').format('m'))
						right = that.dayWidth - that.dayWidth/(24*60)*right
					}else{
						right = 0
					}
					left = parseInt(left);
					right = parseInt(right);
					var gg = new Ext.BoxComponent({
						renderTo : ggIdx,
						dataIdx : record.get('idx'),
						autoEl	: {
							tag		: 'div',
							class	: 'event  evt-idx-'+record.get('idx')+' event-color-'+(gIdx),
							style	: {
								'margin-left'	: ''+left+'px',
								'margin-right'	: ''+right+'px'
							},
							html	: record.get('title')
						},
						listeners: {
							render: function(component) {
								new Ext.ToolTip({
									target	: component.el.id,
									html	: record.get('title')
								});

								component.el.on('click',function(evt,dom){
									console.log('click',component.dataIdx);
								});

								component.el.on('dblclick',function(evt,dom){
									console.log('dblclick',component.dataIdx);
								});

								li.on('mouseover',function(evt,dom){
									Ext.each(that.elTable.select('.evt-idx-'+component.dataIdx),function(el){
										el.addClass('eventOver');
									})
								});

								li.on('mouseout',function(evt,dom){
									Ext.each(that.elTable.select('.evt-idx-'+component.dataIdx),function(el){
										el.removeClass('eventOver');
									});
								});
							}
						}
					});
					dateEvent.setDate(dateEvent.getDate()+1);
				}else{
					n=diff;
				}
			}
		})
	},
	displayView			:  function(){
		var that = this;
		var n = 0;
		var date = that.dateBegin.clone();
		that.domDates = {};
		for(var i=0;i<6;i++){
			for(var j=0;j<7;j++){
				that.domDates[date.format('Y-m-d')] = {
					index : n,
					class : 'day-'+(i+1)+'-'+(j+1),
				}
				that.days[n].setWidth(that.dayWidth);
				that.days[n].show();
				if((!that.showWeekend && j>=5) ||i>=that.numWeeks){
					that.days[n].setWidth(0);
					that.days[n].hide();
				}
				if(i<=that.numWeeks){
					that.days[n].child(".calendarView-monthView-weekView-dayView-header").dom.innerHTML=date.format('d/m');
					if(i>=that.numWeeks){
						that.days[n].child(".calendarView-monthView-weekView-dayView-content").setHeight(0);
					}else{
						that.days[n].child(".calendarView-monthView-weekView-dayView-content").setHeight(that.dayHeight-14);
					}
				}
				if(date.format('m')==that.date.format('m')){
					that.days[n].removeClass('outMonth');
				}else{
					that.days[n].addClass('outMonth');
				}
				date.setDate(date.getDate()+1);
				n++;
			}
			if(i>=that.numWeeks){
				that.weeks[i].setHeight(0);
				that.weeks[i].hide();
			}else{
				that.weeks[i].setHeight(that.dayHeight);
				that.weeks[i].show();
			}
		}
	},

	onResize: function(ct, position){
		var that = this;
		Ext.eu.sm.CalendarView.Month.superclass.onResize.call(this, ct, this.maininput);
		var containerSize = Ext.get(this.el.findParent('.x-panel-body-noheader')).getSize();
		that.dayHeight=parseInt(containerSize.height/that.numWeeks)-3;
		that.dayWidth=parseInt(containerSize.width/(that.showWeekend?7:5));
		that.displayView();
	},

	afterRender: function(ct, position){
		var that = this;
		that.refresh();
		Ext.eu.sm.CalendarView.Month.superclass.afterRender.call(that, ct);
	},

	onRender: function(ct, position){
		var that = this;
		var str = '<table class="calendarView-monthView">';
		that.el = ct.createChild({
			tag		: 'div' ,
			class	: 'calendarView-monthView-div'
		});

		for(var i=0;i<6;i++){
			str +='<tr class="calendarView-monthView-weekView week-'+(i+1)+'">';
			for(var j=0;j<7;j++){
				str+='<td class	= "calendarView-monthView-weekView-dayView day-'+(i+1)+'-'+(j+1)+'"><div class="calendarView-monthView-weekView-dayView-header"></div><ul class="calendarView-monthView-weekView-dayView-content"></ul></td>';
			}
			str = str+'</tr>';
		}
		str = str+'</table>';
		that.elTable = that.el.createChild(str);
		that.days=new Array(6*7);
		that.weeks=new Array(6);
		var n = 0;

		for(var i=0;i<6;i++){
			that.weeks[i]=that.elTable.child('.week-'+(i+1));
			for(var j=0;j<7;j++){
				that.days[n]=that.elTable.child('.day-'+(i+1)+'-'+(j+1));
				if(j>=5){
					that.days[n].addClass('weekend');
				}
				n++;
			}
		}
		Ext.eu.sm.CalendarView.Month.superclass.onRender.call(that, ct);
	}
});
Ext.reg('calendarView.month',Ext.eu.sm.CalendarView.Month);
