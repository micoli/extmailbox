if (true){
	Ext.ns('Ext.eu.sm');

	Ext.eu.sm.CXD = Ext.extend(Ext.Panel, {
		readOnly			: false,
		initComponent		: function(){
			var that = this;

			that.treeUsersId = Ext.id();
			that.calendarViewerId = Ext.id();

			that.getUsersList = function(){
				var userListId=[];
				var tree = Ext.getCmp(that.treeUsersId);
				if(tree){
					var allChecked = tree.getChecked();
					if (allChecked.length>0){
						Ext.each(allChecked,function(v,k){
							userListId.push(v.attributes.id);
						});
					}
				}
				return userListId;
			}

			that.eventStore = new Ext.data.JsonStore({
				fields			: [
					'idx',
					'type',
					'eventClass',
					'title',{
						name:'date_begin',
						type:'date',
						dateFormat:'Y-m-d H:i:s'
					},{
						name:'date_end',
						type:'date',
						dateFormat:'Y-m-d H:i:s'
					},'text'],
				root			: 'data',
				idProperty		: 'idx',
				autoLoad		: false,
				baseParams		: {
					'exw_action'	: 'local.calendar.getEvents'
				},
				proxy			: new Ext.data.HttpProxy({
					url				: 'proxy.php',
					method			: 'GET'
				}),
				listeners		: {
					beforeload		: function (store,options){
						store.baseParams.userList = that.getUsersList();
					}
				}
			});

			that.memStoreEventType = new Ext.data.JsonStore({
				fields		: ['id','value'],
				idProperty	: 'id',
				proxy		: new Ext.data.MemoryProxy(),
				autoLoad	: false
			});

			that.memStoreEventType.loadData([{
				id		: "ghost",
				value	: "ghost"
			},{
				id		: "rainy",
				value	: "rainy"
			},{
				id		: "allowance",
				value	: "allowance"
			},{
				id		: "contest",
				value	: "contest"
			}]);

			Ext.apply(that,{
				layout		: 'border',
				items		: [{
					xtype				: 'CalendarViewer',
					id					: that.calendarViewerId,
					eventStore			: that.eventStore,
					region				: 'center',
					showWeekend			: true,
					showViewsLabel		: false,
					controls			: ['|'],
					horizontalEventTpl	: new Ext.XTemplate(
						'{title}'+
						'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
						'<p>{date_end:date("d/m/Y-H:i")}</p>'+
						'<p>{content}</p>'
					),
					tooltipTpl			: new Ext.XTemplate(
						'== {title}'+
						'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
						'<p>{date_end:date("d/m/Y-H:i")}</p>'+
						'<p>{content}</p>'
					),
					tooltipFulldayTpl	: new Ext.XTemplate(
						'-- {title}'+
						'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
						'<p>{date_end:date("d/m/Y-H:i")}</p>'+
						'<p>{content}</p>'
					),
					//date				: new Date('2013-01-01'),
					listeners			: {
						datechanged : function(CalendarViewer,date,date1,date2){
	//						console.log('datechanged',date.format('Y-m-d'),date1.format('Y-m-d'),date2.format('Y-m-d'));
						},
						eventclick : function(CalendarViewer,event){
							console.log('click',CalendarViewer,event);
						},
						eventcontextmenu : function(CalendarViewer,event){
							console.log('eventcontextmenu',CalendarViewer,event);
						},
						eventdblclick : function(CalendarViewer,event){
							console.log('dblclick',CalendarViewer,event);
						},
						dayclick : function(CalendarViewer,date){
							console.log('dayclick',date);
						},
						daycontextmenu : function(CalendarViewer,date){
							console.log('daycontextmenu',date);
						},
						daydblclick : function(CalendarViewer,date){
							console.log('daydblclick',date);
						}
					}
				},{
					region			: 'west',
					split			: true,
					width			: 200,
					frame			: true,
					items			: [{
						title				: 'Groups',
						xtype				: 'treepanel',
						id					: that.treeUsersId,
						height				: 250,
						rootVisible			: false,
						autoScroll			: true,
						onlyOneChecked		: false,
						listeners			: {
							checkchange			: function(node, checked){
								var tree = node.getOwnerTree();
								var allChecked = tree.getChecked();
								if (allChecked.length==0){
									node.attributes.checked=true;
									node.ui.checkbox.checked=true;
								}else{
									Ext.each(allChecked,function(v,k){
										if (v.attributes.id!=node.attributes.id && (v.attributes.level!=node.attributes.level||tree.onlyOneChecked)){
											v.attributes.checked=false;
											v.ui.checkbox.checked=false;
										}
									});
								}
								that.eventStore.load();
							}
						},
						loader		: new Ext.tree.TreeLoader({
							dataUrl		: 'proxy.php',
							clearOnLoad	: true,
							baseParams	: {
								exw_action	: 'local.calendar.getUsers'
							},
							baseAttrs	: {
								leaf		: true,
								expanded	: false,
								checked		: false,
								level		: 'C'
							},
							listeners			: {
								load				: function(treeLoader,node){
									that.eventStore.load();
									/*console.log(node);
									setTimeout(function(){
										var tree = node.getOwnerTree();
										var sel = Ext.eu.sm.treeUtils.findDeepChildNode(tree.getRootNode(),'id','2.1');
										sel.attributes.checked=true;
										sel.ui.checkbox.checked=true;
									},200);*/
								},
							},

						}),
						root		: new Ext.tree.AsyncTreeNode({
							expanded	: true,
							leaf		: false,
							text		: ''
						})
					},{
						xtype			: 'form',
						title			: 'Types',
						height			: 200,
						hideLabels		: true,
						items			: [{
							xtype			: 'checkboxgroup',
							fieldLabel		: 'Single Column',
							itemCls			: 'x-check-group-alt',
							columns			: 1,
							defaults		: {
								checked			: true,
								listeners		: {
									check			: function(){
										that.eventStore.load();
									}
								}
							},
							items			: [{
								boxLabel: 'Ghost'	,
								name	: 'ghost'
							},{
								boxLabel: 'Rainy'	,
								name	: 'rainy'
							},{
								boxLabel: 'Allowance',
								name	: 'allowance'
							},{
								boxLabel: 'Contest'	,
								name	: 'contest'
							}]
						}]
					}]
				},{
					region			: 'east',
					split			: false,
					width			: 250,
					xtype			: 'form',
					frame			: true,
					items			: [{
						xtype			: 'combo',
						fieldLabel		: 'Type',
						width			: 100,
						store			: that.memStoreEventType,
						displayField	: 'id',
						valueField		: 'value',
						typeAhead		: true,
						mode			: 'local',
						forceSelection	: true,
						triggerAction	: 'all',
						emptyText		: 'Select a state...',
						selectOnFocus	: true,
					}]
				}]
			});

			Ext.eu.sm.CXD.superclass.initComponent.call(this);
		}
	});
	Ext.reg('CXD',Ext.eu.sm.CXD);

	Ext.onReady(function(){
		var that = this;

		var viewport = new Ext.Viewport({
			layout		: 'border',
			frame		: true,
			items		:[{
				xtype		: 'CXD',
				region		: 'center',
			}]
		});
		Ext.QuickTips.init();
	});
}else{
	Ext.onReady(function(){
		var that = this;
		that.triggerTreeId='azaz';

		that.eventStore = new Ext.data.JsonStore({
			fields			: [
				'idx',
				'type',
				'eventClass',
				'title',{
					name:'date_begin',
					type:'date',
					dateFormat:'Y-m-d H:i:s'
				},{
					name:'date_end',
					type:'date',
					dateFormat:'Y-m-d H:i:s'
				},'text'],
			root			: 'data',
			idProperty		: 'idx',
			remoteSort		: true,
			autoLoad		: true,
			baseParams		: {
				'exw_action'	: 'local.calendar.getEvents'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
			}),
		});

		that.memStore = new Ext.data.JsonStore({
			fields : [
				{name: 'f1'},
				{name: 'f2'}
			],
			idProperty		: 'title',
			proxy	: new Ext.data.MemoryProxy(),
			autoLoad: false
		});
		that.memStore.loadData([{
			f1:"aa",
			f2:1
		},{
			f1:"bb",
			f2:2
		},{
			f1:"cc",
			f2:3
		},{
			f1:"dd",
			f2:4
		}]);

		var viewport = new Ext.Viewport({
				layout		: 'border',
				frame		: true,
				tbar		:[{
					xtype		: 'button',
					text		: 'test',
					handler		: function(){
					}
				}],
				bbar		:[{
					xtype		: 'button',
					text		: 'test2',
					handler		: function(){
					}
				}],
				items		: [{
					xtype				: 'CalendarViewer',
					region				: 'center',
					eventStore			: that.eventStore,
					//dayModeEnabled		: false,
					showWeekend			: true,
					showViewsLabel		: false,
					controls			: ['|',{
						xtype				: 'triggertree',
						value				: '2.1',
						id					: that.triggerTreeId,
						listeners			:{
							beforeselect		: function(newValue,oldValue,node){
								console.log('beforeselect',newValue,oldValue,node);
							},
							select				: function(newValue,node){
								console.log('select',newValue,node);
							}
						},
						children			: [{
							text			: 'grp1',
							id				: '1',
							expanded		: true,
							children		: [{
								text			: 'grp 1.1',
								id				: '1.1',
								expanded		: true,
								leaf			: false,
								children		: [{
									text			: 'grp 1.1.1',
									id				: '1.1.1',
									leaf			: true
								},{
									text			: 'grp 1.1.2',
									id				: '1.1.2',
									leaf			: true
								}]
							},{
								text			: 'grp 1.2',
								id				: '1.2',
								leaf			: true
							}]
						},{
							text			: 'grp2',
							id				: '2',
							expanded		: true,
							children		: [{
								text			: 'grp 2.1',
								id				: '2.1',
								leaf			: true
							},{
								text			: 'grp 2.2',
								id				: '2.2',
								leaf			: true
							}]
						}],
						handler				: function(){
							console.log(this);
						}
					}],
					horizontalEventTpl	: new Ext.XTemplate(
							'{title}'+
							'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
							'<p>{date_end:date("d/m/Y-H:i")}</p>'+
							'<p>{content}</p>'
					),
					tooltipTpl			: new Ext.XTemplate(
							'== {title}'+
							'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
							'<p>{date_end:date("d/m/Y-H:i")}</p>'+
							'<p>{content}</p>'
					),
					tooltipFulldayTpl	: new Ext.XTemplate(
							'-- {title}'+
							'<p>{date_begin:date("d/m/Y-H:i")}</p>'+
							'<p>{date_end:date("d/m/Y-H:i")}</p>'+
							'<p>{content}</p>'
					),
					//date				: new Date('2013-01-01'),
					listeners			: {
						datechanged : function(CalendarViewer,date,date1,date2){
	//						console.log('datechanged',date.format('Y-m-d'),date1.format('Y-m-d'),date2.format('Y-m-d'));
						},
						eventclick : function(CalendarViewer,event){
							console.log('click',CalendarViewer,event);
						},
						eventcontextmenu : function(CalendarViewer,event){
							console.log('eventcontextmenu',CalendarViewer,event);
						},
						eventdblclick : function(CalendarViewer,event){
							console.log('dblclick',CalendarViewer,event);
						},
						dayclick : function(CalendarViewer,date){
							console.log('dayclick',date);
						},
						daycontextmenu : function(CalendarViewer,date){
							console.log('daycontextmenu',date);
						},
						daydblclick : function(CalendarViewer,date){
							console.log('daydblclick',date);
						},

					}
				},{
					region		: 'south',
					html		: 'south',
					frame		: true,
					split		: true,
					height		: 50,
				},{
					region			: 'east',
					split			: true,
					width			: 250,
					html			: '--'
				}]
		});
		Ext.QuickTips.init();
	});
}
/*
{
	xtype			: 'arraytree',
	animate			: true,
	rootVisible		: false,
	containerScroll	: true,
	rootConfig		: {
		text			:'--',
		id				:'root'
	},
	children		: [{
		text			: 'Application Design',
		id				: 'design',
		expanded		: true,
		children		: [{
			text			: 'Complex Data Binding',
			id				: 'databind',
			expanded		: true,
			children		: [{
				text			: 'Run example1',
				leaf			: true
			},{
				text			: 'Run example2',
				leaf			: true
			}]
		},{
			text			: 'Complex Data Binding2',
			id				: 'databind',
			expanded		: true,
			children		: [{
				text			: 'Run example21',
				iconCls			: 'icon-run',
				leaf			: true
			},{
				text			: 'Run example22',
				iconCls			: 'icon-run',
				leaf			: true
			}]
		}],
	}],
}
*/