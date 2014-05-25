Ext.ns('Ext.eu.sm');
/**
	pivot		: {
		store			: that.pivotStore,
		pivotGroupBy	: 'key',
		pivotValue		: 'value',
		pivotColumn		: 'subkey',
		columnModel		: {
			header: 'xxxx'	, width: 200, sortable: true, fixed:false,dataIndex: 'value',id:'value'
		}
	}
 */

Ext.eu.sm.PivotEditorGridPanel = Ext.extend(Ext.grid.LockingGridPanel,{
	pivotPrefix				: 'pivotValue_',
	pivotMap				: {},
	templateFields			: [],
	templateFieldsColName	: [],

	pivotGetModifiedRecords	: function(){
		var that = this;
		var modifieds = [];
		Ext.each(that.store.getModifiedRecords(),function(v,k){
			var record = v.getChanges();
			var pivotValues={};
			record[that.pivot.groupBy]=v.id;
			for(var field in record){
				if (record.hasOwnProperty(field) && that.pivotMap.hasOwnProperty(field)){
					var c = that.pivotMap[field]
					if(!pivotValues[c.pivotValue]){
						pivotValues[c.pivotValue]={};
					}
					pivotValues[c.pivotValue][c.colName]=record[field];
					delete record[field];
				}
			}
			record.pivotValues = pivotValues;
			modifieds.push(record);
		})
		return modifieds;
	},

	getPivotRecord			: function(record,col){
		var that = this;
		var pivotRecord=null;
		if(record.pivotData.byId['_'+(col-that.initColumns.length)]){
			pivotRecord=record.pivotData.byId['_'+(col-that.initColumns.length)];
		}
		return pivotRecord;
	},

	getPivotColValue		: function (col){
		var that = this;
		return that.pivotValues[col-that.initColumns.length];
	},

	pivotReconfigure		: function(){
		var that		= this;
		var columns		= [];
		var fields		;
		var record		;
		var newRecord	;
		var groupByValue;
		that.pivotValues	= [];

		columns = this.initColumns.slice(0);

		that.pivot.store.each(function(v,k){
			var val = v.get(that.pivot.column);
			if(that.pivotValues.indexOf(val)==-1){
				that.pivotValues.push(val);
			}
		});

		that.pivotValues.sort();
		that.pivotMap = {};
		fields = that.templateFields.slice(0);//fast copy
		for (var i in that.pivotValues){
			if(that.pivotValues.hasOwnProperty(i)){
				Ext.each(that.pivot.values,function (pivotColName,pivotFieldIdx) {
					fields.push({
						name	: that.pivotPrefix+i+'_'+pivotColName
					});
					that.pivotMap[that.pivotPrefix+i+'_'+pivotColName] = {
						pivotValue	: that.pivotValues[i],
						colName		: pivotColName
					}
					var columnModel=Ext.applyIf({
						dataIndex	: that.pivotPrefix+i+'_'+pivotColName,
						id			: that.pivotPrefix+i+'_'+pivotColName,
						header		: that.pivot.headerRenderer?that.pivot.headerRenderer(that.pivotValues[i],i,pivotColName,pivotFieldIdx):(''+ that.pivot.columnModel.header || '')+' '+ i
					},that.pivot.columnModel[pivotFieldIdx]);
					if(columnModel.editorGenerator){
						columnModel.editor=columnModel.editorGenerator(that.pivotValues[i],i);
					}
					columns.push(columnModel);
				})
			}
		}
		Ext.each(that.pivot.postColumnModel||[],function(columnModel){
			columns.push(columnModel);
		});

		that.createInternalStore({
			fields		: fields,
			id			: that.templateFieldsColName.indexOf(that.pivot.groupBy),
		});

		that.store.suspendEvents();

		that.store.removeAll();
		that.pivot.store.each(function(v,k){
			groupByValue=v.get(that.pivot.groupBy);
			if(!(record = that.store.getById(groupByValue))){
				record={};
				Ext.each(fields,function(field){
					record[field.name]=(that.templateFieldsColName.indexOf(field.name)>-1)?v.get(field.name):'';
				})
				record = new that.store.recordType(record,groupByValue);
				record.pivotData={byVal:{},byId:{},tagOffset:[]}
				that.store.addSorted(record);
			}
			Ext.each(that.pivot.values,function(pivotColName,pivotFieldIdx){
				record.set(that.pivotPrefix+that.pivotValues.indexOf(v.get(that.pivot.column))+'_'+pivotColName,v.get(pivotColName));
				record.pivotData.byVal['_'+v.get(that.pivot.column)]=v;
				record.pivotData.byId['_'+that.pivotValues.indexOf(v.get(that.pivot.column))]=v;
			});
			record.dirty	= false;
			delete record.modified
		});
		that.store.modified=[];
		that.store.resumeEvents();
		that.preReconfigure(that);
		that.reconfigure(that.store,new Ext.grid.LockingColumnModel(columns));
		that.postReconfigure(that);
	},

	preReconfigure : function(){
	},

	postReconfigure : function(){
	},

	createInternalStore : function (cfg){
		var that = this;
		if(that.pivot.store.groupField){
			that.store = new Ext.data.GroupingStore({
				reader			: new Ext.data.ArrayReader({
					id: cfg.id
				},
				Ext.data.Record.create(cfg.fields)),
				proxy			: new Ext.data.MemoryProxy({}),
				groupField		: that.pivot.store.groupField,
				sortInfo		: that.pivot.store.sortInfo
			});
		}else{
			that.store = new Ext.data.SimpleStore(Ext.apply({
				proxy	: new Ext.data.MemoryProxy({}),
				listeners	: {
					update		: function (store,record,options){
						//debugger;
					}
				}
			},cfg));
		}
	},

	initStaticFields	: function(){
		var that = this;
		that.templateFields = [];
		that.templateFieldsColName = [];
		Ext.each(that.pivot.store.fields.items,function(v,k){
			var field = new Ext.data.Field(v);
			if (that.pivot.values.indexOf(field.name)==-1 && field.name!=that.pivot.column){
				that.templateFields.push(field);
				that.templateFieldsColName.push(field.name);
			}
		});
	},

	initComponent : function(){
		var that = this;
		var fields;
		var index;

		that.initStaticFields();
		that.getView();

		that.pivot.values		=(that.pivot.values			instanceof Array)?that.pivot.values		:[that.pivot.values		];
		that.pivot.columnModel	=(that.pivot.columnModel	instanceof Array)?that.pivot.columnModel:[that.pivot.columnModel];

		that.createInternalStore({
			fields	: that.templateFields,
			id		: that.pivot.groupBy
		});

		that.pivot.store.on('load',function(store,records,options){
			that.pivotReconfigure();
		});

		if(Ext.isArray(this.columns)){
			this.colModel = new Ext.grid.LockingColumnModel(this.columns);
			this.cm = this.colModel;
			this.initColumns = this.columns;
			delete this.columns;
		}
		Ext.eu.sm.PivotEditorGridPanel.superclass.initComponent.call(this);

		if(that.pivot.store.getCount()>0){
			that.pivotReconfigure();
		}
	}
});

Ext.reg('eu.sm.pivoteditorgridpanel',Ext.eu.sm.PivotEditorGridPanel);