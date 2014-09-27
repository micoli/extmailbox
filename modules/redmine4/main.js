Ext.define('Ext.modules.redmine4.main', {
	extend		: 'Ext.Panel',
	alias		: 'widget.redmine4_main',
	requires	: [
		'Ext.modules.redmine4.service',
		'Ext.modules.redmine4.issues'
	],

	refresh				: function(){
		var that = this;
	},

	initComponent		: function (){
		Ext.modules.redmine4.service.initProjects();
		var that = this;

		that.projectTreeId = Ext.id();

		//that.redmineConfig={
		//	url		: 'http://redmine.home.micoli.org:3000/',
		//	apiKey	: 'f2f7e1f362279aff0e5ae545f3f569d40c3b23a8'
		//}

		/*that.redmineService.on('projectsLoaded',function(projects){
			//console.log('projectsLoaded',projects);
			var tree = Ext.getCmp(that.projectTreeId);
			tree.setRootNode(new Ext.tree.AsyncTreeNode({
				text	:'Projects2',
				expanded:true,
				children: projects
			}));

			tree.getRootNode().render();
		});*/
		Ext.define('Redmine4.projectTree', {
			extend: 'Ext.data.Model',
			fields: [{
				"name"	: "text"
			},{
				"name"	: "id"
			}]
		});

		Ext.apply(this,{
			layout		: 'border',
			items		: [{
				region		: 'west',
				xtype		: 'treepanel',
				split		: true,
				width		: 200,
				id			: that.projectTreeId,
				store		: Ext.create('Ext.data.TreeStore', {
					model		: 'Redmine4.projectTree',
					text		: 'Projects',
					root		: {
						expanded	: true,
						leaf		: Ext.modules.redmine4.service.projectTree?false:true,
						children	: Ext.modules.redmine4.service.projectTree||[]
					}
				}),
				rootVisible	: false,
				columns		: [{
					xtype		: 'treecolumn', //this is so we know which column will show the tree
					text		: 'Project',
					flex		: 2,
					sortable	: true,
					dataIndex	: 'text'
				},{
					text		: 'id',
					dataIndex	: 'id',
					flex		: 1,
				}]
			},{
				region		: 'center',
				xtype		: 'tabpanel',
				activeTab	: 1,
				items		: [{
					xtype			: 'panel',
					title			: 'Home',
					closable		: false,
					html			: 'home',
					frame			: true
				},{
					xtype			: 'redmine4_issues',
					title			: 'Issues',
					closable		: false,
					frame			: true,
					//redmineService	: that.redmineService
				}]
			}]
		});
		this.callParent(this);
	}
});
