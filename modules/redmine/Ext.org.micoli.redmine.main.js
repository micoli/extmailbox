Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.main = Ext.extend(Ext.Panel,{
	refresh				: function(){
		var that = this;
	},


	initComponent		: function(){
		var that = this;

		that.projectsTreeId		= Ext.id();
		that.issuesTabPanelId	= Ext.id();

		//that.redmineConfig={
		//	url		: 'http://redmine.home.micoli.org:3000/',
		//	apiKey	: 'f2f7e1f362279aff0e5ae545f3f569d40c3b23a8'
		//}

		/*that.redmineService.on('initDone',function(projects){
			var tree = Ext.getCmp(that.projectsTreeId);
			tree.setRootNode(new Ext.tree.AsyncTreeNode({
				text	:'Projects2',
				expanded:true,
				children: that.redmineService.projects
			}));

			tree.getRootNode().render();
		});*/

		that.openIssue	= function(record){
			var issueTabPanel	= Ext.getCmp(that.issuesTabPanelId);
			var panel			= issueTabPanel.getItem(that.id+'-'+record.get('id'));
			var isNew			= false;
			if(!panel){
				isNew=true;

				var subject = record.get('subject');
				if(subject.length>30){
					subject = subject.substr(0,28)+"...";
				}

				panel = new Ext.org.micoli.redmine.issueEditor({
					title			: '#'+record.get('id')+':'+subject,
					id				: that.id+'-'+record.get('id'),
					closable		: true,
					xtype			: '',
					parentTabPanel	: issueTabPanel,
					redmineService	: that.redmineService,
				});
				issueTabPanel.add(panel);
			}
			panel.refresh(record)
			issueTabPanel.setActiveTab(panel);
		};

		Ext.apply(this,{
			layout		: 'border',
			items		: [{
				region		: 'west',
				xtype		: 'Ext.tree.ColumnTree',
				split		: true,
				width		: 200,
				id			: that.projectsTreeId,
				rootVisible	: false,
				loader		: new Ext.tree.TreeLoader({
					uiProviders	: {
						'col'		: Ext.tree.ColumnNodeUI
					}
				}),
				root		: new Ext.tree.AsyncTreeNode({
					text		: 'Projects',
					expanded	: true,
					leaf		: Ext.org.micoli.redmine.service.projectsTree?false:true,
					children	: Ext.org.micoli.redmine.service.projectsTree||[]
				}),
				columns		: [{
					header		: 'Folder',
					width		: 140,
					dataIndex	: 'task'
				},{
					header		: 'n',
					width		: 22,
					dataIndex	: 'nb'
				}]
			},{
				region			: 'center',
				layout			: 'border',
				border			: false,
				items			: [{
					xtype			: 'tabpanel',
					region			: 'north',
					border			: false,
					height			: 150,
					activeTab		: 1,
					items			: [{
						xtype			: 'panel',
						title			: 'Home',
						closable		: false,
						html			: 'home',
						frame			: true
					},{
						xtype			: 'org.micoli.redmine.issuesGrid',
						title			: 'Issues',
						closable		: false,
						border			: false,
						frame			: true,
						redmineService	: that.redmineService,
						openIssue		: that.openIssue
					}]
				},{
					xtype			: 'tabpanel',
					region			: 'center',
					id				: that.issuesTabPanelId,
					enableTabScroll	: true,
					split			: true,
					border			: false,
					activeTab		: 0,
					defaults		: {
						autoScroll		: true
					},
					items			: [{
						staticTab		: true,
						title			: 'Home',
						border			: false,
						frame			: true,
						html			: '<H1></H1>'
					}]
				}]
			}]
		});

		Ext.org.micoli.redmine.main.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('eu.sm.redmine.main', Ext.org.micoli.redmine.main);
