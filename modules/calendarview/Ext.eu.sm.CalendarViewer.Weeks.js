Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarViewer');

Ext.eu.sm.CalendarViewer.Weeks = Ext.extend(Ext.eu.sm.CalendarViewer.View, {
	maxWeeks			: 0,
	viewClass			: 'CalendarViewer-xxxView',

	displayView			:  function(){
		var that = this;
		var n = 0;
		var date = that.CalendarViewer.dateBegin.clone();
		that.domDates = {};
		that.datesDom = {};

		/*for(var j=6;j<=7;j++){
			var domDay = that.el.child('.day-header .calday-0-'+j);
			if(!that.CalendarViewer.showWeekend){
				domDay.setWidth(0);
				domDay.hide();
			}else{
				domDay.setWidth(that.dayWidth);
				domDay.show();
			}
		}*/

		for(var i=0;i<that.maxWeeks;i++){
			for(var j=0;j<7;j++){
				var dateYMD = date.format('Y-m-d');
				that.datesDom['calday-'+(i+1)+'-'+(j+1)]=dateYMD;
				that.domDates[dateYMD] = {
					index : n,
					class : 'calday-'+(i+1)+'-'+(j+1),
				}
				that.days[n].setWidth(that.dayWidth);
				that.days[n].setHeight(that.dayHeight);
				that.days[n].show();
				if((!that.CalendarViewer.showWeekend && j>=5) ||i>=that.numWeeks){
					that.days[n].setWidth(1);
					that.days[n].setHeight(0);
					that.days[n].hide();
				}
				that.days[n][(dateYMD==that.currentDay)?'addClass':'removeClass']('currentDay');
				if (j==0){
					that.days[n].child(".dayView-header").child('.weekNum').dom.innerHTML=date.format('W');
				}
				if (i<=that.numWeeks){
					if(that.CalendarViewer.showWeekend || (!that.CalendarViewer.showWeekend && date.getDay()!=0 && date.getDay()!=6) && i<that.numWeeks){
						var strDayName='';
						if(i==0){
							strDayName=that.getWeekDayName(parseInt(date.format('N'))-1)+' ';
						}
						that.days[n].child(".dayView-header").child('.dayNum').dom.innerHTML= strDayName + date.format('d');
					}
					if(i>=that.numWeeks){
						that.days[n].child(that.contentSelectorClass).setHeight(0);
					}else{
						that.days[n].child(that.contentSelectorClass).setHeight(that.dayHeight-18);
					}
				}
				if(date.format('m')==that.CalendarViewer.date.format('m')){
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
		Ext.eu.sm.CalendarViewer.Weeks.superclass.onResize.call(this, ct, this.maininput);
		var containerSize = Ext.get(this.el.findParent('.x-panel-body')).getSize();
		//that.dayHeight =(parseInt(containerSize.height)-16)/that.numWeeks - 5;
		that.dayHeight =parseInt(containerSize.height)/that.numWeeks-1;
		that.dayWidth  =parseInt(containerSize.width/(that.CalendarViewer.showWeekend?7:5))-1;
		that.displayView();
	},

	onRender: function(ct, position){
		var that = this;
		that.el = ct.createChild({
			tag		: 'div' ,
			class	: 'CalendarViewer '
		});

		var str = '<table class="'+that.viewClass+'"><thead>';
		/*str +='<tr class="'+that.viewClass+'-day-header">';
		for(var j=0;j<7;j++){
			var strDay='';
			if(that.CalendarViewer.showWeekend || (!that.CalendarViewer.showWeekend && j<5)){
				strDay = that.getWeekDayName(j);
			}

			str+='<th class="weekdayView calday-0-'+(j+1)+'">'+strDay+'</th>';
		}*/
		str = str+'</tr></thead>';
		str = str+'<tbody>';

		for(var i=0;i<that.maxWeeks;i++){
			str +='<tr class="weekView week-'+(i+1)+'">';
			for(var j=0;j<7;j++){
				var strDay='';
				if(j==0){
					strDay='<div class="weekNum"></div>'
				}
				strDay+='<ul class="dayView-fullday-content"></ul>'
				strDay+='<div class="dayTitle"></div>'
				strDay+='<div class="dayNum"></div>'
				if(i==0 && (that.CalendarViewer.showWeekend || (!that.CalendarViewer.showWeekend && j<5))){
					//strDay+='<div class="dayName">'+that.getWeekDayName(j)+'</div>'
				}
				str+='<td class="dayView calday-'+(i+1)+'-'+(j+1)+'">'+
						'<div class="dayView-header">'+strDay+'</div>'+
						'<div class="dayView-content-holder">'+
						'	<ul class="dayView-content"></ul>'+
						'</div>'+
					'</td>';
			}
			str = str+'</tr>';
		}
		str = str+'</tbody></table>';
		that.elTable = that.el.createChild(str);

		that.days	= new Array(that.maxWeeks*7);
		that.weeks	= new Array(that.maxWeeks);
		var n = 0;
		for(var i=0;i<that.maxWeeks;i++){
			that.weeks[i]=that.elTable.child('.week-'+(i+1));
			for(var j=0;j<7;j++){
				that.days[n]=that.elTable.child('.calday-'+(i+1)+'-'+(j+1));
				if(j>=5){
					that.days[n].addClass('weekend');
				}
				that.days[n].on('click',function(evt,dom){
					var res = this.dom.className.match(/calday-[0-9]{1,2}-[0-9]{1,2}/);
					that.CalendarViewer.fireEvent('dayclick',that.CalendarViewer,that.datesDom[res[0]]);
					evt. stopEvent();
				});
				that.days[n].on('contextmenu',function(evt,dom){
					var res = this.dom.className.match(/calday-[0-9]{1,2}-[0-9]{1,2}/);
					that.CalendarViewer.fireEvent('daycontextmenu',that.CalendarViewer,that.datesDom[res[0]]);
					evt. stopEvent();
				});
				that.days[n].on('dblclick',function(evt,dom){
					var res = this.dom.className.match(/calday-[0-9]{1,2}-[0-9]{1,2}/);
					that.CalendarViewer.fireEvent('daydblclick',that.CalendarViewer,that.datesDom[res[0]]);
					evt. stopEvent();
				});
				n++;
			}
		}
		Ext.eu.sm.CalendarViewer.Weeks.superclass.onRender.call(that, ct);
		that.calcDates();
	}
});