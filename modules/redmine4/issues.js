Ext.define('Ext.modules.redmine4.issues', {
	extend		: 'Ext.Panel',
	alias		: 'widget.redmine4_issues',
	requires	: [
		'Ext.grid.feature.Grouping',
		'Ext.modules.redmine4.issuesColumn',
		'Ext.modules.redmine4.issueEditor',
	],

	initComponent		: function(){
		var that			= this;
		that.mainGridId		= Ext.id();
		that.issueEditorId	= Ext.id();
		that.pageSize		= 25;
		that.renderers		= {};

		that.groupColumn	= 'project.name';

		Ext.define('redmine4.user', {
			extend	: 'Ext.data.Model',
			fields	: [
				'id',
				'login',
				'mail',
				'lastname',
				'firstname',
				'fullname'
			]
		});

		Ext.define('redmine4.issue', {
			extend	: 'Ext.data.Model',
			fields	: [
				'id',
				'subject',
				'description',

				'assigned_to',
				//'assigned_to.id',
				//{name:'assigned_to.name',defaultValue:'-'},

				'author',
				//'author.id',
				//'author.name',

				//'project',
				'project.id',
				'project.name',

				//'tracker',
				'tracker.id',
				'tracker.name',

				//'priority',
				'priority.id',
				'priority.name',

				//'status',
				'status.id',
				'status.name',

				{name:'done_ratio'	,type:'int'},
				{name:'created_on'	,type:'date'},
				{name:'start_date'	,type:'date'},
				//'due_date',
				{name:'updated_on'	,type:'date'}
			]
		});

		that.issuesStore = Ext.create('Ext.data.Store', {
			model	: 'redmine4.issue',
			autoLoad: true,
			proxy	: Ext.modules.redmine4.service.request({
				type	: 'ajax',
				url		: 'issues.json',
				method	: 'GET',
				reader	: {
					type			: 'json',
					root			: 'issues',
					totalProperty	: 'total_count',
					id				: 'id',
				}
			}),
			listeners:{
				load : function(){
					console.log(arguments);
				}
			},
			extra			: {
				gridId			: that.mainGridId
			},
			sortInfo		: {
				field			: 'created_on',
				direction		: 'DESC'
			}
		});

		that.usersStore = Ext.create('Ext.data.Store', {
			model	: 'redmine4.user',
			autoLoad: false,
			proxy	: Ext.modules.redmine4.service.request({
				type	: 'ajax',
				url		: 'userss.json',
				method	: 'GET',
				reader	: {
					type			: 'json',
					root			: 'users',
					totalProperty	: 'total_count',
					id				: 'id',
				}
			}),
			listeners		: {
				load			: function(store,records){
					Ext.each(records,function(v){
						v.set('fullname',v.get('firstname')+' '+v.get('lastname'))
					})
					/*
					var combo = Ext.getCmp(that.accountComboId);
					that.account = records[0].get('account');
					combo.setValue(that.account);
					combo.fireEvent('select',combo,records[0],0);
					 */
				}
			}
		});

		function getColumnModel(col){
			return  Ext.modules.redmine4.issuesColumn.getConfig({
				gridId	: that.mainGridId,
				col		: col
			});
		}

		that.gridColumnModel = [
			getColumnModel('tracker'),
			getColumnModel('priority'),
			getColumnModel('created_on'),
			getColumnModel('project'),
			getColumnModel('subject'),
			getColumnModel('author'),
			getColumnModel('assigned_to'),
			getColumnModel('done_ratio')
		];

		that.cellEditing = new Ext.grid.plugin.CellEditing({
			clicksToEdit: 1
		});

		Ext.apply(this,{
			layout	: 'border',
			items	: [{
				xtype				: 'grid',
				region				: 'north',
				split				: true,
				height				: 120,
				id					: that.mainGridId,
				store				: that.issuesStore,
				plugins				: [that.cellEditing],
				features			: [{
					ftype				: 'grouping',
					groupHeaderTpl		: '<span class="RedmineHeaderGroupName">{columnName}</span>: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
					hideGroupedHeader	: true,
					startCollapsed		: true,
				}],
				bbar				: new Ext.PagingToolbar({
					pageSize			: that.pageSize,
					store				: that.issuesStore,
					displayInfo			: true,
					displayMsg			: 'Displaying issues {0} - {1} of {2}',
					emptyMsg			: "No issues to display"
				}),
				loadMask			: true,
				autoExpandColumn	: 'subject',
				//selType				: 'checkboxmodel',
				columns				: that.gridColumnModel,
				viewConfig			: {
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
						beforerefresh		: function(view){
							//that.groupColType = view.getGroupField()?view.ds.fields.get(view.getGroupField()).type:null;
						},
						refresh : function(view){
							//Ext.getCmp(that.issueEditorId).refresh(Ext.getCmp(that.mainGridId).getStore().getAt(0));
						}
					}
				},

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
					itemclick	: function(grid,record){
						Ext.getCmp(that.issueEditorId).refresh(record);
					}
				}
			},{
				region			: 'center',
				xtype			: 'redmine4_issueEditor',
				id				: that.issueEditorId
			}]
		});
		this.callParent(this);
	}
});