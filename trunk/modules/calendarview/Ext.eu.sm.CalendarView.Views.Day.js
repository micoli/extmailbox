Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarView.Views');

Ext.eu.sm.CalendarView.Views.Day = Ext.extend(Ext.eu.sm.CalendarView.View, {
	iconCls				: 'calendarSelectIcon',
	viewModeName		: 'day',
	viewClass			: 'dayViewContainer',

	calcDates			: function(){
		var that = this;
		that.currentDay = (new Date()).format('Y-m-d');
		that.dateBegin = that.date.clone();
		that.dateEnd = that.date.clone();

		console.log(that.viewModeName,1,'=',that.dateBegin.format('Y-m-d N'),'<',that.date.format('Y-m-d'),'>',that.dateEnd.format('Y-m-d N'));
		that.fireEvent('datechanged',that.date,that.dateBegin,that.dateEnd);
	},

	getPrevDate			: function (date){
		date.setDate(date.getDate()-1);
	},

	getNextDate			: function (date){
		date.setDate(date.getDate()+1);
	},

	displayView			:  function(){
		var that = this;
		var n = 0;
		var date = that.dateBegin.clone();
		that.domDates = {};
		that.datesDom = {};

		var dateYMD = date.format('Y-m-d');
		that.datesDom['calday-1-1']=dateYMD;
		that.domDates[dateYMD] = {
			index : n,
			class : 'calday-1-1',
		}

		that.days[0].setWidth(that.dayWidth);
		that.days[0].show();
		that.days[0][(parseInt(date.format('N'))>=6)?'addClass':'removeClass']('weekend');
		that.days[0][(dateYMD==that.currentDay)?'addClass':'removeClass']('currentDay');
		that.days[0].child(".dayView-header").child('.dayName').dom.innerHTML=that.getWeekDayName(parseInt(date.format('N'))-1);
		that.days[0].child(".dayView-header").child('.dayNum').dom.innerHTML=date.format('d');
		that.days[0].child(".dayView-header").child('.weekNum').dom.innerHTML=date.format('W');
		that.days[0].child(".dayView-content").setHeight(that.dayHeight-14);
		if(date.format('m')==that.date.format('m')){
			that.days[0].removeClass('outMonth');
		}else{
			that.days[0].addClass('outMonth');
		}
		that.weeks[0].setHeight(that.dayHeight);
		that.weeks[0].show();
	},

	onResize: function(ct, position){
		var that = this;
		Ext.eu.sm.CalendarView.Views.Day.superclass.onResize.call(this, ct, this.maininput);
		var containerSize = Ext.get(this.el.findParent('.x-panel-body')).getSize();
		that.dayHeight =(parseInt(containerSize.height)-16) - 5;
		that.dayWidth  = containerSize.width;
		that.displayView();
	},

	onRender: function(ct, position){
		var that = this;
		that.el = ct.createChild({
			tag		: 'div' ,
			class	: 'calendarView'
		});
		var str = '<table class="'+that.viewClass+'"><thead>';
		//var strDay= that.getWeekDayName(j);
		str += 	'<tr class="day-header">';
		str += 		'<th class="weekdayView calday-0-s"></th>';
		str += 	'</tr>';
		str += 	'</thead>';
		str += '<tbody>';
		str += '<tr class="weekView week-1">';
		str +=	'<td class="dayView calday-1-1">';
		str +=		'<div class="dayView-header">';
		str +='			<div class="weekNum"></div>'
		str +='			<div class="dayTitle"></div>'
		str +='			<div class="dayNum"></div>'
		str +='			<div class="dayName"></div>'
		str +='		</div>';
		str +='		<div class="dayView-fullday-content">'
		str +='			<ul class="dayView-content"></ul>';
		str +='		</div>';
		str +='	</td>';
		str += '</tr>';
		str +='</tbody></table>';

		that.elTable = that.el.createChild(str);

		that.days	= new Array(1);
		that.weeks	= new Array(1);
		var n = 0;
		that.weeks[0]=that.elTable.child('.week-1');
		that.days[0]=that.elTable.child('.calday-1-1');
		that.days[0].on('click',function(evt,dom){
			var res = this.dom.className.match(/calday-[0-9]{1,2}-[0-9]{1,2}/);
			that.calendarView.fireEvent('dayclick',that.calendarView,that.datesDom[res[0]]);
		});
		that.days[0].on('dblclick',function(evt,dom){
			var res = this.dom.className.match(/calday-[0-9]{1,2}-[0-9]{1,2}/);
			that.calendarView.fireEvent('daydblclick',that.calendarView,that.datesDom[res[0]]);
		});
		Ext.eu.sm.CalendarView.Views.Day.superclass.onRender.call(that, ct);
		that.calcDates();
	}

});
Ext.reg('calendarView.views.day',Ext.eu.sm.CalendarView.Views.Day);
