Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.CalendarViewer');

Ext.eu.sm.CalendarViewer.Views.List = Ext.extend(Ext.grid.GridPanel, {
	maxWeeks			: 6,
	viewModeName		: 'list',
	iconCls				: 'calendarSelectListIcon',
	viewClass			: 'CalendarViewer-ListView',

	calcDates			: function(){
		var that = this;
		that.currentDay = (new Date()).format('Y-m-d');
		var d1,d2;
		d1 = that.CalendarViewer.date.getFirstDateOfMonth().clone();

		while (d1.getDay()!=1){
			d1.setDate(d1.getDate()-1);
		}
		d2 = that.CalendarViewer.date.getLastDateOfMonth().clone();
		while (d2.getDay()!=0){
			d2.setDate(d2.getDate()+1);
		}
		that.numWeeks = Ext.eu.sm.CalendarViewer.prototype.dateDiff(d1,d2,'weeks')+1;
		that.fireEvent('datechanged',that.CalendarViewer.date,d1,d2,that);
	},

	getPrevDate			: function (date){
		date.setMonth(date.getMonth()-1);
	},

	getNextDate			: function (date){
		date.setMonth(date.getMonth()+1);
	},

	initComponent		: function(){
		var that = this;

		that.storeFields = [];

		that.CalendarViewer.eventStore.recordType.prototype.fields.each(function(v,k){
			that.storeFields.push(Ext.apply({},v));
		});

		that.storeFields=that.storeFields.concat([{
			name	: 'date_week',
			type	: 'int'
		},{
			name	: 'date_week_begin',
			type	: 'date'
		},{
			name	: 'date_week_end',
			type	: 'date'
		}]);

		that.gridStore =  new Ext.data.GroupingStore({
			reader		: new Ext.data.JsonReader({}, that.storeFields),
			groupField	: 'date_week',
			//groupOnSort	: true,
			sortInfo	: {
				field		: 'date_begin',
				direction	: 'ASC'
			}
		});

		Ext.apply(that,{
			store		: that.gridStore,
			border		: false,
			columns		: [{
				dataIndex		: 'date_week',
				sortable		: false,
				hidden			: true,
				groupRenderer	: function(groupFieldValue,unused,record,rowIndex,colIndex,store){
					return '['+record.get('date_week')+'] '+record.get('date_week_begin').format('d/m/Y') +' - '+record.get('date_week_end').format('d/m/Y');
				}
			},{
				dataIndex		: 'date_begin',
				header			: 'Dates',
				width			: 200,
				sortable		: false,
				fixed			: true,
				renderer		: function (value,meta,record){
					var date1fmt = record.data.date_begin.format('Ymd');
					var date2fmt = record.data.date_end.format('Ymd');
					var str = '';
					if(date1fmt==date2fmt){
						str = record.data.date_begin.format('d/m/Y H:i')+'-'+record.data.date_end.format('H:i')
					}else{
						str = record.data.date_begin.format('d/m/Y H:i')+'-'+record.data.date_end.format('d/m/Y H:i')
					}
					return str;
				}
			},{
				dataIndex		:'title',
				header			: 'title',
				width			: 20,
				sortable		: false,
				renderer		: function (value,meta,record){
					meta.attr = 'ext:qtip="' + value + '"';
					return (record.get('eventClass')?'<span class="x-form-cb-label-classpreview '+ record.get('eventClass')+'"></span>':'')+value;
				}
			}],

			view	: new Ext.grid.GroupingView({
				forceFit			: true,
				hideGroupedColumn	: false,
				showGroupName		: false,
				enableNoGroups		: false,
				enableGroupingMenu	: false,
				startCollapsed		: false,
				autoFill			: true,
				/*getRowClass			: function (record,index,rowParams,store){
					return record.get('eventClass');
				}*/
				//groupTextTpl	: '{text} {}'
			})
		});


		Ext.eu.sm.CalendarViewer.Views.List.superclass.initComponent.call(this);

		that.CalendarViewer.eventStore.on('load',function(store,records,options){
			that.displayEvents();
		});
		that.on('rowclick'			,function(grid,rowIndex,evt ){
			var record = grid.getStore().getAt(rowIndex);
			that.CalendarViewer.fireEvent('eventclick',that.CalendarViewer,record.data);
			evt. stopEvent();
		});
		that.on('rowdblclick'		,function(grid,rowIndex,evt ){
			var record = grid.getStore().getAt(rowIndex);
			that.CalendarViewer.fireEvent('eventdblclick',that.CalendarViewer,record.data);
			evt. stopEvent();
		});
		that.on('rowcontextmenu'	,function(grid,rowIndex,evt ){
			var record = grid.getStore().getAt(rowIndex);
			that.CalendarViewer.fireEvent('eventcontextmenu',that.CalendarViewer,record.data);
			evt. stopEvent();
		});

	},

	isActive			: function(mode){
		var that = this;
		return that.CalendarViewer.viewMode==mode;
	},

	displayEvents		: function(){
		var that = this;
		if(!that.isActive(that.viewModeName)){
			return
		}

		that.gridStore.removeAll();
		//that.gridStore.suspendEvents();
		that.CalendarViewer.eventStore.each(function(record){
			var newRecord = new that.gridStore.recordType(record.data);
			var date = record.get('date_begin');
			if(date<that.CalendarViewer.dateBegin){
				date=that.CalendarViewer.dateBegin;
			}
			if(date>that.CalendarViewer.dateEnd){
				date=that.CalendarViewer.dateEnd;
			}

			var date_week_begin	= date.clone();
			while (date_week_begin.getDay()!=1){
				date_week_begin.setDate(date_week_begin.getDate()-1);
			}

			var date_week_end	= date.clone();
			while (date_week_end.getDay()!=0){
				date_week_end.setDate(date_week_end.getDate()+1);
			}

			newRecord.set(that.gridStore.groupField,date.format('W'));
			newRecord.set('date_week_begin',date_week_begin);
			newRecord.set('date_week_end',date_week_end);
			that.gridStore.addSorted(new that.gridStore.recordType(record.data));
		});
		//that.gridStore.resumeEvents();
		that.gridStore;
	},

	afterRender: function(ct, position){
		var that = this;
		that.refresh();
		Ext.eu.sm.CalendarViewer.Views.List.superclass.afterRender.call(that, ct);
	},

	refresh				: function(auto){
		var that = this;
		that.calcDates();
		if(auto==undefined){
			this.lastSize=-1;
			that.setSize(that.getSize());
			that.displayEvents();
		}
	},

});

Ext.reg('CalendarViewer.views.list',Ext.eu.sm.CalendarViewer.Views.List);
