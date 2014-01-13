Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView');

Ext.eu.sm.CalendarView = Ext.extend(Ext.Panel, {
	viewMode			: 'month',
	date				: new Date(),
	dateBegin			: null,
	dateEnd				: null,
	//http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
	dateDiff				: function (date1,date2,interval) {
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
					Ext.getCmp(that.viewId).refresh();
				}
			},{
				xtype		: 'button',
				text		: 'next',
				handler		: function(){
					that.date.setMonth(that.date.getMonth()+1);
					Ext.getCmp(that.viewId).date = that.date;
					Ext.getCmp(that.viewId).refresh();
				}
			}],
			bbar		:[{
			}],
			items		:[{
				region		: 'center',
				xtype		: 'calendarView.month',
				id			: that.viewId
			}]
		});
		Ext.eu.sm.CalendarView.superclass.initComponent.call(this);
	},
/*	zzonRender: function(ct, position){
		Ext.eu.sm.CalendarView.superclass.onRender.call(this, ct, this.maininput);

		this.addEvents('remove');

		this.addClass('bit-box');

		this.el = ct.createChild({ tag: 'div' });
		this.el.addClassOnOver('calendarView');
		console.log(this.el.getSize())
		console.log(this.el)
		console.log(this.getSize());
		this.el.setSize(this.getSize().width,this.getSize().height-this.tbar.getSize().height-this.bbar.getSize().height);
		//this.el.resize()

		Ext.apply(this.el, {
			'focus': function(){
				this.down('a.focusbutton').focus();
			},
			'dispose': function(){
				this.dispose();
			}.createDelegate(this)

		});
	}*/
});
Ext.reg('calendarView',Ext.eu.sm.CalendarView);


Ext.eu.sm.CalendarView.Month = Ext.extend(Ext.Panel, {
	date				: new Date(),
	dateBegin			: null,
	dateEnd				: null,
	showWeekend			: true,
	refresh				: function(auto){
		var that = this;
		//that.dateBegin = new Date(JSON.parse(JSON.stringify(that.date)));
		//that.dateBegin = new Date(that.date.format('Y-m-01'));
		that.dateBegin = that.date.getFirstDateOfMonth().clone();

		while (that.dateBegin.getDay()!=1){
			that.dateBegin.setDate(that.dateBegin.getDate()-1);
		}
		that.dateEnd = that.date.getLastDateOfMonth().clone();
		//that.dateEnd = new Date(JSON.parse(JSON.stringify(that.dateBegin)));
		//that.dateEnd.setDate(that.dateEnd.getDate()-1);
		//that.dateEnd.setMonth(that.dateEnd.getMonth()+1);
		//that.dateEnd.setDate(that.dateEnd.getDate()-1);
		while (that.dateEnd.getDay()!=0){
			that.dateEnd.setDate(that.dateEnd.getDate()+1);
		}
		that.numWeeks = Ext.eu.sm.CalendarView.prototype.dateDiff(that.dateBegin,that.dateEnd,'weeks')+1;
		console.log(that.numWeeks,'=',that.dateBegin.format('Y-m-d N'),'<',that.date.format('Y-m-d'),'>',that.dateEnd.format('Y-m-d N'));
		if(auto==undefined){
			this.lastSize=-1;
			that.setSize(that.getSize());
		}
	},

	initComponent		: function(){
		var that = this;
		that.refresh(false);
		Ext.apply(that,{
		});
		Ext.eu.sm.CalendarView.Month.superclass.initComponent.call(this);
	},
	onResize: function(ct, position){
		var that = this;
		console.log('resize');
		Ext.eu.sm.CalendarView.Month.superclass.onResize.call(this, ct, this.maininput);
		var containerSize = Ext.get(this.el.findParent('.x-panel-body-noheader')).getSize();
		console.log(containerSize);
		var dayHeight=parseInt(containerSize.height/that.numWeeks)-3;
		var dayWidth=parseInt(containerSize.width/(that.showWeekend?7:5));
		var n =0;
		var date = that.dateBegin.clone();
		for(var i=0;i<6;i++){
			for(var j=0;j<7;j++){
				that.days[n].setWidth(dayWidth);
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
						that.days[n].child(".calendarView-monthView-weekView-dayView-content").setHeight(dayHeight-14);
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
				that.weeks[i].setHeight(dayHeight);
				that.weeks[i].show();
			}
		}
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
				str+='<td class	= "calendarView-monthView-weekView-dayView day-'+(i+1)+'-'+(j+1)+'"><div class="calendarView-monthView-weekView-dayView-header"></div><div class="calendarView-monthView-weekView-dayView-content">a</div></td>';
			}
			str = str+'</tr>';
		}
		str = str+'</table>';
		that.elTable = ct.createChild(str);

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
		console.log(that.days);
		console.log('render');
		Ext.eu.sm.CalendarView.Month.superclass.onRender.call(this, ct, this.maininput);

	}
});
Ext.reg('calendarView.month',Ext.eu.sm.CalendarView.Month);
