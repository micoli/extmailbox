if (true){
	Ext.ns('Ext.eu.sm');

	Ext.eu.sm.CxdEditor = Ext.extend(Ext.form.FormPanel, {
		lastPayDate			: new Date(),
		readOnly			: false,
		treeUsersChildren	: [],
		cxdType				: null,
		cxdTypes			: [],
		initComponent		: function(){
			var that = this;
			that.cxdTypeId = Ext.id();
			that.treeRepId = Ext.id();
			that.dateId = Ext.id();
			var radioTypes=[];

			Ext.each(that.cxdTypes,function(v,k){
				radioTypes.push({
					boxLabel	: v.value,
					name		: 'cxdtype',
					inputValue	: v.id,
					checked		: (v.id==that.record.cxdType)
				});
			});

			that.changeCxdType = function(cxdType){
				that.items.each(function(formField){
					if(formField.radioDepency){
						var disabled = formField.radioDepency.indexOf(cxdType)==-1;
						formField[disabled?'hide':'show']();
						formField.setDisabled(disabled);
						formField.getEl().up('.x-form-item').setDisplayed(!disabled)
					}
				});
			}

			Ext.apply(this,{
				frame			: true,
				items			: [{
					xtype			: 'radiogroup',
					fieldLabel		: 'Type',
					name			: 'cxdtype',
					id				: that.cxdTypeId,
					items			: radioTypes,
					defaults		: {
						listeners		:{
							check			: function (field,checked){
								if(checked){
									that.changeCxdType(field.inputValue);
									Ext.getCmp(that.dateId).validate();
								}
							}
						}
					}
				},{
					xtype			: 'datefield',
					startDay		: 1,
					minValue		: that.lastPayDate,
					id				: that.dateId,
					fieldLabel		: 'Date',
					value			: that.record.date,
					format			: 'd/m/Y',
					validator		: function (value){
						var date = Date.parseDate(value,this.format);
						var rg = Ext.getCmp(that.cxdTypeId);
						var isGhost=false
						try{
							isGhost = (rg.getEl().query('input[type=radio]:checked/@value')[0].firstChild.nodeValue=='ghost');
						}catch(e){}
						if(isGhost && date.format('N')!=1){
							return 'Ghost must be a monday';
						}
						return true;
					}
				},{
					xtype			: 'checkbox',
					fieldLabel		: 'All Rep',
					name			: 'userAll',
					listeners		: {
						check			: function(field,value){
							that.form.findField('user').setDisabled(value);
						}
					}
				},{
					xtype			: 'triggertree',
					fieldLabel		: 'Rep',
					name			: 'user',
					id				: that.treeRepId,
					width			: 300,
					children		: that.treeUsersChildren,
					treeConfig		:{
						onlyOneChecked	: true,
						listeners		: {
							click		: function(node){
								node.attributes.checked=true;
								node.ui.checkbox.checked=true;
								var tree = node.getOwnerTree();
								tree.fireEvent.call(tree,'checkchange',node,true);
								console.log('select');
							},
							checkchange		: function(node, checked){
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
								Ext.getCmp(that.treeRepId).setValue(node.attributes.id)
							}
						}
					}
				},{
					xtype			: 'radiogroup',
					radioDepency	: ['rainy','allowance'],
					fieldLabel		: 'Percentage',
					items			: [{
						boxLabel		: 50,
						name			: 'percentage',
						inputValue		: 50,
					},{
						boxLabel		: 100,
						name			: 'percentage',
						inputValue		: 100,
					}]
				},{
					xtype			: 'radiogroup',
					radioDepency	: ['contest'],
					fieldLabel		: 'Contest',
					items			: [{
						boxLabel		: 5,
						name			: 'contestpoints',
						inputValue		: 5
					},{
						boxLabel		: 10,
						name			: 'contestpoints',
						inputValue		: 10
					},{
						boxLabel		: 20,
						name			: 'contestpoints',
						inputValue		: 20
					},{
						boxLabel		: 30,
						name			: 'contestpoints',
						inputValue		: 30
					}]
				}]
			});

			that.on('afterlayout',function(){
				that.changeCxdType(that.record.cxdType);
			});

			Ext.eu.sm.CxdEditor.superclass.initComponent.call(this);
		}
	});
	Ext.reg('cxdEditor',Ext.eu.sm.CxdEditor);

	Ext.eu.sm.CXDViewer = Ext.extend(Ext.Panel, {
		readOnly			: false,
		cxdTypes			: [{
			id		: "contest",
			value	: "Contest"
		},{
			id		: "ghost",
			value	: "Ghost",
		},{
			id		: "rainy",
			value	: "Rainy",
		},{
			id		: "allowance",
			value	: "Allowance"
		}],

		newCXDWindow		: function(record){
			var that = this;

			var win = new Ext./*eu.attached*/Window({
				resizeTriggerCmp: that,
				stickCmp		: that,
				title			: 'Edit',
				layout			: 'fit',
				width			: 500,
				height			: 230,
				closeAction		:'hide',
				plain			: true,
				items			: {
					xtype				: 'cxdEditor',
					cxdTypes			: that.cxdTypes,
					record				: record,
					treeUsersChildren	: that.treeUsersChildren,
				},
				buttons: [{
					text		: 'Ok',
					disabled	: true,
					handler		: function(){
						win.destroy();
					}
				},{
					text		: 'Close',
					handler		: function(){
						win.destroy();
					}
				}]
			});
			win.show();
		},

		initComponent		: function(){
			var that = this;

			that.treeUsersId = Ext.id();
			that.calendarViewerId = Ext.id();
			that.CXDEditorId = Ext.id();

			that.getUsersList = function(){
				var userListId=[];
				var tree = Ext.getCmp(that.treeUsersId);
				if(tree){
					var allChecked = tree.getChecked();
					if (allChecked.length>0){
						Ext.each(allChecked,function(v,k){
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
							console.log('datechanged',date.format('Y-m-d'),date1.format('Y-m-d'),date2.format('Y-m-d'));
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
							that.newCXDWindow({cxdType : 'contest',date : date,idx:-1});
						}
					}
				},{
					region			: 'west',
					split			: true,
					width			: 200,
					frame			: true,
					items			: [{
						title			: 'Groups',
						xtype			: 'treepanel',
						id				: that.treeUsersId,
						height			: 250,
						rootVisible		: false,
						autoScroll		: true,
						onlyOneChecked	: false,
						root			: new Ext.tree.AsyncTreeNode({
							expanded		: true,
							leaf			: false,
							text			: ''
						}),
						listeners		: {
							checkchange		: function(node, checked){
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
						loader			: new Ext.tree.TreeLoader({
							dataUrl			: 'proxy.php',
							clearOnLoad		: true,
							baseParams		: {
								exw_action		: 'local.calendar.getUsers'
							},
							baseAttrs		: {
								leaf			: true,
								expanded		: false,
								checked			: false,
								level			: 'C'
							},
							listeners		: {
								load			: function(treeLoader,node,response){
									if (response.statusText=='OK'){
										that.treeUsersChildren=JSON.parse(response.responseText);
										var applyBaseAttr = function(node){
											Ext.applyIf(node, treeLoader.baseAttrs);
											if(node.children){
												for(var t in node.children){
													applyBaseAttr(node.children[t]);
												}
											}
										}
										for(var t in that.treeUsersChildren){
											applyBaseAttr(that.treeUsersChildren[t]);
										}
										that.eventStore.load();
										that.newCXDWindow({
											cxdType	: 'contest',
											date	: new Date(),
											idx		:-1
										});

									}
									/*console.log(node);
									setTimeout(function(){
										var tree = node.getOwnerTree();
										var sel = Ext.eu.sm.treeUtils.findDeepChildNode(tree.getRootNode(),'id','2.1');
										sel.attributes.checked=true;
										sel.ui.checkbox.checked=true;
									},200);*/
								},
							},

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
				}/*,{
					region			: 'east',
					split			: false,
					width			: 250,
					xtype			: 'CXDEditor',
					id				: that.CXDEditorId,
					cxdTypes		: that.cxdTypes
				}*/]
			});

			Ext.eu.sm.CXDViewer.superclass.initComponent.call(this);
		}
	});
	Ext.reg('CXDViewer',Ext.eu.sm.CXDViewer);

	Ext.onReady(function(){
		var that = this;

		var viewport = new Ext.Viewport({
			layout		: 'border',
			frame		: true,
			items		:[{
				xtype		: 'CXDViewer',
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
*/