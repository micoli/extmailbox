Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.issuesColumn = function(){
	var that	= this;
	that.id		= that.dataIndex;
	(that.init || Ext.emptyFn).call(that);
};

Ext.extend(Ext.org.micoli.redmine.issuesColumn,{
	header		: "-",
	width		: 50,
	sortable	: true,
	fixed		: false,
});

Ext.org.micoli.redmine.issuesColumn.subject = Ext.extend(Ext.org.micoli.redmine.issuesColumn,{
	header		: 'Subject',
	dataIndex	: 'subject',
	width		: 200,
});

Ext.org.micoli.redmine.issuesColumn.project = Ext.extend(Ext.org.micoli.redmine.issuesColumn,{
	header		: 'Project',
	dataIndex	: 'project.name',
	width		: 180,
	fixed		: true
});

Ext.org.micoli.redmine.issuesColumn.tracker = Ext.extend(Ext.org.micoli.redmine.issuesColumn,{
	header		: 'Type',
	dataIndex	: 'tracker.name',
	width		: 60,
	fixed		: true
});

Ext.org.micoli.redmine.issuesColumn.user = Ext.extend(Ext.org.micoli.redmine.issuesColumn,{
	width		: 150,
	fixed		: true,
	renderer	: function (v,meta,record,rowIndex,colIndex) {
		return (v && v.name) ? v.name : '-'
	},
	editorInit	: function (){
		var that = this;
		return new Ext.form.ComboBox(Ext.org.micoli.redmine.service.enumerations.users.dynComboCfg)
	}
});

Ext.org.micoli.redmine.issuesColumn.author = Ext.extend(Ext.org.micoli.redmine.issuesColumn.user,{
	header		: 'Author',
	dataIndex	: 'author'
});

Ext.org.micoli.redmine.issuesColumn.assigned_to = Ext.extend(Ext.org.micoli.redmine.issuesColumn.user,{
	header		: 'Assignee',
	dataIndex	: 'assigned_to'
});

Ext.org.micoli.redmine.issuesColumn.priority = Ext.extend(Ext.org.micoli.redmine.issuesColumn,{
	header		: 'priority',
	dataIndex	: 'priority.name',
	width		: 50,
	fixed		: true
});

Ext.org.micoli.redmine.issuesColumn.date = Ext.extend(Ext.org.micoli.redmine.issuesColumn,{
	header		: '-',
	dataIndex	: 'date',
	width		: 70,
	fixed		: true,
	renderer	: Ext.util.Format.dateRenderer('d/m/Y')
});

Ext.org.micoli.redmine.issuesColumn.created_on = Ext.extend(Ext.org.micoli.redmine.issuesColumn.date,{
	header		: 'Created',
	dataIndex	: 'created_on'
});

Ext.org.micoli.redmine.issuesColumn.created_on = Ext.extend(Ext.org.micoli.redmine.issuesColumn.date,{
	header		: 'updated',
	dataIndex	: 'updated_on'
});

Ext.org.micoli.redmine.issuesColumn.start_date = Ext.extend(Ext.org.micoli.redmine.issuesColumn.date,{
	header		: 'Start',
	dataIndex	: 'start_date'
});

Ext.org.micoli.redmine.issuesColumn.done_ratio = Ext.extend(Ext.org.micoli.redmine.issuesColumn,{
	header		: 'Done',
	dataIndex	: 'done_ratio',
	width		: 80,
	fixed		: true,
	renderer	: function (val, meta, record, rowIndex, colIndex, store){
		var percent = val;
		var width = Ext.getCmp(store.extra.gridId).ownerCt.gridColumnModel[colIndex].width;
		var bar = 4-parseInt(percent/25);
		this.style = this.style + ";background-position: ";
		this.style = this.style + (percent==0?-120:(width*percent/100)-120);
		this.style = this.style +"px 50%; background-repeat:no-repeat;";
		meta.css = meta.css+' '+'progressBar-back-'+bar
		return val+'%';
	}
});

Ext.org.micoli.redmine.issuesGrid = Ext.extend(Ext.Panel,{
	initComponent		: function(){
		var that			= this;
		that.mainGridId		= Ext.id();
		that.pageSize		= 25;
		that.renderers		= {};

		that.groupColumn	= 'project.name';
		that.issuesStore = new Ext.data.GroupingStore({
			extra			: {
				gridId			: that.mainGridId
			},
			remoteSort		: true,
			autoLoad		: true,
			remoteGroup		: false,
			groupField		: that.groupColumn,
			reader			: new Ext.data.JsonReader({
				root			: 'issues',
				totalProperty	: 'total_count',
				id				: 'id',
			}, [
				'id',
				'subject',

				'assigned_to',
				'author',

				'project.id',
				'project.name',

				'tracker.id',
				'tracker.name',

				'priority.id',
				'priority.name',

				'status.id',
				'status.name',

				{name:'done_ratio',type:'int'},
				'description',

				{name:'created_on',type:'date'},
				{name:'start_date',type:'date'},
				{name:'updated_on',type:'date'},

			]),
			listeners	:{
				load : function(){
				}
			},
			baseParams		: {
			},
			sortInfo		: {
				field			: 'created_on',
				direction		: 'DESC'
			},
			proxy			: new Ext.data.HttpProxy(that.redmineService.requestPrm({
				method			: 'GET',
				url				: 'issues.json'
			}))
		});

		that.gridSelectionModel	= new Ext.grid.CheckboxSelectionModel({
			singleSelect	: false,
			hidden			: true
		});

		function getColumnModel(col){
			var col =  new Ext.org.micoli.redmine.issuesColumn[col]({
				gridId:that.mainGridId
			});
			if(col.editorInit){
				col.editor = col.editorInit.call(that)
			}
			return col;
		}

		that.gridColumnModel = [
			that.gridSelectionModel,
			getColumnModel('tracker'),
			getColumnModel('priority'),
			getColumnModel('created_on'),
			getColumnModel('project'),
			getColumnModel('subject'),
			getColumnModel('author'),
			getColumnModel('assigned_to'),
			getColumnModel('done_ratio')
		];

		Ext.apply(this,{
			layout	: 'border',
			items	: [{
				xtype				: 'editorgrid',
				region				: 'center',
				split				: true,
				height				: 100,
				id					: that.mainGridId,
				store				: that.issuesStore,
				bbar				: new Ext.PagingToolbar({
					pageSize			: that.pageSize,
					store				: that.issuesStore,
					displayInfo			: true,
					displayMsg			: 'Displaying issues {0} - {1} of {2}',
					emptyMsg			: "No issues to display"
				}),
				loadMask			: true,
				autoExpandColumn	: 'subject',
				sm					: that.gridSelectionModel,
				cm					: new Ext.grid.ColumnModel(that.gridColumnModel),
				view				: new Ext.grid.GroupingView({
					enableNoGroups		: false,
					enableGroupingMenu	: false,
					startCollapsed		: false,
					hideGroupedColumn	: false,
					autoFill			: true,
					enableRowBody		: true,
					showPreview			: true,
					forceFit			: true,
					showGroupName		: true,
					groupMode			: 'display',
					doRender			: function(cs, rs, ds, startRow, colCount, stripe){
						if(rs.length < 1){
							return '';
						}
						var groupField = this.getGroupField();
						var colIndex = this.cm.findColumnIndex(groupField);

						this.enableGrouping = !!groupField;

						if(!this.enableGrouping || this.isUpdating){
							return Ext.grid.GroupingView.superclass.doRender.apply(
									this, arguments);
						}
						var gstyle = 'width:'+this.getTotalWidth()+';';

						var gidPrefix = this.grid.getGridEl().id;
						var cfg = this.cm.config[colIndex];
						var groupRenderer = cfg.groupRenderer || cfg.renderer;
						var prefix = this.showGroupName ?
									'<span class="RedmineHeaderGroupName">'+(cfg.groupName || cfg.header)+'</span>: ' : '';

						var groups = [], curGroup, i, len, gid;
						for(i = 0, len = rs.length; i < len; i++){
							var rowIndex = startRow + i;
							var r = rs[i],
								gvalue = r.data[groupField],
								g = this.getGroup(gvalue, r, groupRenderer, rowIndex, colIndex, ds);
							if(!curGroup || curGroup.group != g){
								gid = gidPrefix + '-gp-' + groupField + '-' + Ext.util.Format.htmlEncode(g);
								// if state is defined use it, however state is in terms of expanded
								// so negate it, otherwise use the default.
								var isCollapsed  = typeof this.state[gid] !== 'undefined' ? !this.state[gid] : this.startCollapsed;
								var gcls = isCollapsed ? 'x-grid-group-collapsed' : '';
								curGroup = {
									group: g,
									gvalue: gvalue,
									text: prefix + g,
									groupId: gid,
									startRow: rowIndex,
									rs: [r],
									cls: gcls,
									style: gstyle
								};
								groups.push(curGroup);
							}else{
								curGroup.rs.push(r);
							}
							r._groupId = gid;
						}

						var buf = [];
						for(i = 0, len = groups.length; i < len; i++){
							var g = groups[i];
							this.doGroupStart(buf, g, cs, ds, colCount);
							buf[buf.length] = Ext.grid.GroupingView.superclass.doRender.call(
									this, cs, g.rs, ds, g.startRow, colCount, stripe);

							this.doGroupEnd(buf, g, cs, ds, colCount);
						}
						return buf.join('');
					},
					getRowClass 		: function(record, rowIndex, p, store){
						/*if(record.get('seen')==0){
							return 'x-grid3-row-collapsed mailUnseen';
						}*/
						return 'x-grid3-row-collapsed';
					},
					listeners			: {
						refresh:function(){
						},
						beforerefresh		: function(view){
							that.groupColType = view.getGroupField()?view.ds.fields.get(view.getGroupField()).type:null;
						}
					},
					getGroup			: function(v, r, groupRenderer, rowIndex, colIndex, ds){
						// colIndex of your date column
						if (that.groupColType=='date') {
							// group only by date
							return v.format('Y-m-d D');
						}else {
							// default grouping
							var g = groupRenderer ? groupRenderer(v, {}, r, rowIndex, colIndex, ds) : String(v);
							if(g === ''){
								g = this.cm.config[colIndex].emptyGroupText || this.emptyGroupText;
							}
							return g;
						}
					},
					listeners	:	{
						refresh : function(view){
							that.openIssue(Ext.getCmp(that.mainGridId).getStore().getAt(0));
							that.openIssue(Ext.getCmp(that.mainGridId).getStore().getAt(1));
							//Ext.getCmp(that.issuesTabPanelId).refresh(Ext.getCmp(that.mainGridId).getStore().getAt(0));
						}
					}
				}),

				preEditValue : function(r, field){
					var value = r.data[field];
					if(field=='assigned_to'){
						value = r.data[field].name;
					}
					return this.autoEncode && typeof value == 'string' ? Ext.util.Format.htmlDecode(value) : value;
				},

				listeners	:	{
					beforeedit : function(e){
					},
					rowclick	: function(grid,rowIndex,e){
						that.openIssue(grid.getStore().getAt(rowIndex));
						//Ext.getCmp(that.issuesTabPanelId).refresh(grid.getStore().getAt(rowIndex));
					}
				}
			}]
		});

		Ext.org.micoli.redmine.issuesGrid.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('org.micoli.redmine.issuesGrid', Ext.org.micoli.redmine.issuesGrid);