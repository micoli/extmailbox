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

Ext.eu.sm.PivotEditorGridPanel = Ext.extend(Ext.grid.EditorGridPanel,{
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
					pivotValues[that.pivotMap[field]]=record[field];
					delete record[field];
				}
			}
			record.pivotValues = pivotValues;
			modifieds.push(record);
		})
		return modifieds;
	},

	pivotReconfigure		: function(){
		var that = this;
		var pivotValues=[];
		var columns=[];
		var fields;
		var record;
		var groupByValue;
		var newRecord;

		columns = this.initColumns.slice(0);

		that.pivot.store.each(function(v,k){
			var val = v.get(that.pivot.column);
			if(pivotValues.indexOf(val)==-1){
				pivotValues.push(val);
			}
		});
		pivotValues.sort();
		that.pivotMap={};
		fields = that.templateFields.slice(0);//fast copy
		for (var i in pivotValues){
			if(pivotValues.hasOwnProperty(i)){
				fields.push({
					name	: that.pivotPrefix+i
				});
				that.pivotMap[that.pivotPrefix+i] = pivotValues[i];
				var columnModel=Ext.applyIf({
					dataIndex	: that.pivotPrefix+i,
					id			: that.pivotPrefix+i,
					header		: that.pivot.headerRenderer?that.pivot.headerRenderer(pivotValues[i],i):(''+ that.pivot.columnModel.header || '')+' '+ i
				},that.pivot.columnModel);
				if(columnModel.editorGenerator){
					columnModel.editor=columnModel.editorGenerator(pivotValues[i],i);
				}
				columns.push(columnModel);
			}
		}

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
				that.store.addSorted(record);
			}
			record.set(that.pivotPrefix+pivotValues.indexOf(v.get(that.pivot.column)),v.get(that.pivot.value));
			record.dirty	= false;
			delete record.modified
		});
		that.store.modified=[];
		that.store.resumeEvents();
		that.reconfigure(that.store,new Ext.grid.ColumnModel(columns));
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
			if (field.name!=that.pivot.value && field.name!=that.pivot.column){
				that.templateFields.push(field);
				that.templateFieldsColName.push(field.name);
			}
		});
		//console.log(that.pivot.store);
		//console.log(that.templateFields,that.templateFieldsColName);
	},

	initComponent : function(){
		var that = this;
		var fields;
		var index;

		that.initStaticFields();

		that.createInternalStore({
			fields	: that.templateFields,
			id		: that.pivot.groupBy
		});

		that.pivot.store.on('load',function(store,records,options){
			that.pivotReconfigure();
		});

		if(Ext.isArray(this.columns)){
			this.colModel = new Ext.grid.ColumnModel(this.columns);
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