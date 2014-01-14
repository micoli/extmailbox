Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView');

Ext.eu.sm.CalendarView.Month = Ext.extend(Ext.eu.sm.CalendarView.View, {
	calcDates			: function(){
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
		console.log('viewMonth',that.numWeeks,'=',that.dateBegin.format('Y-m-d N'),'<',that.date.format('Y-m-d'),'>',that.dateEnd.format('Y-m-d N'));
		that.fireEvent('initdates',that.dateBegin,that.dateEnd);
	},

	displayEvents		: function(){
		var that = this;
		if(!that.isActive('month')){
			return
		}
		that.refresh();
		Ext.each(that.days,function(v,k){
			var t = v.child(".calendarView-monthView-dayView-content").query('li');
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
					var containerContent = that.days[dom.index].child(".calendarView-monthView-dayView-content");
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
					var colorClass = 'event-color-'+gIdx;
					if (!isNaN(record.get('colorIdx'))){
						colorClass = 'event-color-'+record.get('colorIdx');
					}
					var gg = new Ext.BoxComponent({
						renderTo : ggIdx,
						dataIdx : record.get('idx'),
						autoEl	: {
							tag		: 'div',
							class	: 'event  evt-idx-'+record.get('idx')+' '+colorClass,
							style	: {
								'margin-left'	: ''+left+'px',
								'margin-right'	: ''+right+'px'
							},
							html	: that.eventTpl.apply(record.data)
						},
						listeners: {
							render: function(component) {
								if(that.withTooltip){
									new Ext.ToolTip({
										target	: component.el.id,
										html	: that.tooltipTpl.apply(record.data)
									});
								}

								component.el.on('click',function(evt,dom){
									that.calendarView.fireEvent('eventclick',that.calendarView,record.data);
									evt. stopEvent();
								});

								component.el.on('dblclick',function(evt,dom){
									that.calendarView.fireEvent('eventdblclick',that.calendarView,record.data);
									evt. stopEvent();
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
		that.datesDom = {};
		for(var i=0;i<6;i++){
			for(var j=0;j<7;j++){
				that.datesDom['calday-'+(i+1)+'-'+(j+1)]=date.format('Y-m-d');
				that.domDates[date.format('Y-m-d')] = {
					index : n,
					class : 'calday-'+(i+1)+'-'+(j+1),
				}
				that.days[n].setWidth(that.dayWidth);
				that.days[n].show();
				if((!that.showWeekend && j>=5) ||i>=that.numWeeks){
					that.days[n].setWidth(0);
					that.days[n].hide();
				}
				if(i<=that.numWeeks){
					that.days[n].child(".calendarView-monthView-dayView-header").dom.innerHTML=date.format('d');
					if(i>=that.numWeeks){
						that.days[n].child(".calendarView-monthView-dayView-content").setHeight(0);
					}else{
						that.days[n].child(".calendarView-monthView-dayView-content").setHeight(that.dayHeight-14);
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
		that.dayHeight =(parseInt(containerSize.height)-16)/that.numWeeks - 4;
		that.dayWidth  =parseInt(containerSize.width/(that.showWeekend?7:5));
		that.displayView();
	},

	onRender: function(ct, position){
		var that = this;
		that.el = ct.createChild({
			tag		: 'div' ,
			class	: 'calendarView-monthView-div'
		});

		var str = '<table class="calendarView-monthView">';
		str +='<tr class="calendarView-monthView-day-header">';
		for(var j=0;j<7;j++){
			str+='<td class	= "calendarView-monthView-weekdayView">'+that.getWeekDayName(j)+'</td>';
		}
		str = str+'</tr>';

		for(var i=0;i<6;i++){
			str +='<tr class="calendarView-monthView-weekView week-'+(i+1)+'">';
			for(var j=0;j<7;j++){
				str+='<td class="calendarView-monthView-dayView calday-'+(i+1)+'-'+(j+1)+'">'+
						'<div class="calendarView-monthView-dayView-header"></div>'+
						'<ul class="calendarView-monthView-dayView-content"></ul>'+
					'</td>';
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
				that.days[n]=that.elTable.child('.calday-'+(i+1)+'-'+(j+1));
				if(j>=5){
					that.days[n].addClass('weekend');
				}
				that.days[n].on('click',function(evt,dom){
					var res = this.dom.className.match(/calday-[0-9]{1,2}-[0-9]{1,2}/);
					that.calendarView.fireEvent('dayclick',that.calendarView,that.datesDom[res[0]]);
				});
				that.days[n].on('dblclick',function(evt,dom){
					var res = this.dom.className.match(/calday-[0-9]{1,2}-[0-9]{1,2}/);
					that.calendarView.fireEvent('daydblclick',that.calendarView,that.datesDom[res[0]]);
				});
				n++;
			}
		}
		Ext.eu.sm.CalendarView.Month.superclass.onRender.call(that, ct);
		that.calcDates();
	}
});
Ext.reg('calendarView.month',Ext.eu.sm.CalendarView.Month);
