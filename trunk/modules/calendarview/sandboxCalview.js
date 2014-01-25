if (true){
	Ext.ns('Ext.eu.sm');

	//http://webspotlite.blogspot.fr/2010/06/ext-22-radiogroup-getvaluesetvalue.html
	Ext.override(Ext.form.RadioGroup, {
		rgGetName : function() {
			return this.items.first().name;
		},
		rgGetValue : function() {
			var v;
			if (this.rendered) {
				this.items.each(function(item) {
					if (!item.getValue())
						return true;
					v = item.getRawValue();
					return false;
				});
			} else {
				for ( var k in this.items) {
					if (this.items[k].checked) {
						v = this.items[k].inputValue;
						break;
					}
				}
			}
			return v;
		},
		rgSetValue : function(v) {
			if (this.rendered) {
				this.items.each(function(item) {
					item.setValue(item.getRawValue() == v);
				});
			} else {
				for ( var k in this.items) {
					this.items[k].checked = this.items[k].inputValue == v;
				}
			}
		}
	});
	/*
	 * cxd_id
	 * cxd_type
	 * enum('bank','allowance','rainy','contest','ghost','helpedby','dayoff','dayoff_in_advance','dayoff_familly_reason','dayoff_other_reason')|allowance
	 * --cxd_contest_id
	 * cxd_id_employe
	 * cxd_date
	 * cxd_day_type //1
	 * cxd_percent
	 * cxd_contest_point
	 * cdx_last_aut_id
	 * cdx_last_update
	 */
	Ext.eu.sm.CxdEditor = Ext.extend(Ext.form.FormPanel, {
		lastPayDate			: new Date(),
		readOnly			: false,
		treeUsersChildren	: [],
		cxdTypes			: [],

		getFieldByName		: function(fieldName){
			var that =this;
			return that.items.itemAt(that.items.findIndex('name',fieldName))
		},

		isValid				: function(){
			var that =this;
			var allOk = true;
			that.items.each(function(formField){
				if(!formField.disabled &&  formField.validate && !formField.validate()){
					allOk = false;
				}
			});
			return allOk;
		},

		setValues			: function(record){
			var that =this;
			for(var fieldName in record){
				var value = record[fieldName];
				var cmp = that.getFieldByName(fieldName);
				if(cmp){
					cmp[cmp.xtype=="radiogroup"?"rgSetValue":"setValue"](value);
					if(cmp.postSetValue){
						cmp.postSetValue(value);
					}
				}
			}
		},

		getValues			: function(){
			var that=this;
			var record = {
				cxd_id				: -1,
				cxd_type			: '',
				cxd_id_employe		: -1,
				cxd_date			: '',
				cxd_day_type		: 1,
				cxd_percent			: 0,
				cxd_contest_point	: 0
			}
			var typeForm = that.getFieldByName('cxd_type').rgGetValue();
			that.items.each(function(formField){
				var inType=true;
				if(!(formField.radioDepency && formField.radioDepency.indexOf(typeForm)==-1)){
					record[formField.name]=formField[formField.xtype=="radiogroup"?"rgGetValue":"getValue"]();
					if(formField.xtype=='datefield'){
						record[formField.name]=record[formField.name].format('Y-m-d');
					}
				}
			});
			return record;
		},

		initComponent		: function(){
			var that = this;

			that.cxdTypeId	= Ext.id();
			that.treeRepId	= Ext.id();
			that.dateId		= Ext.id();

			var radioTypes=[];
			var treeUser = that.treeUsersChildren.copy();

			Ext.each(that.cxdTypes,function(v,k){
				radioTypes.push({
					boxLabel	: v.value,
					name		: 'cxd_type',
					clspreview	: 'event_cxd_'+v.id,
					inputValue	: v.id,
				});
			});

			Ext.apply(this,{
				frame			: true,
				items			: [{
					xtype			: 'textfield',
					fieldLabel		: 'Id',
					name			: 'cxd_id',
					readOnly		: true
				},{
					xtype			: 'radiogroup',
					fieldLabel		: 'Type',
					name			: 'cxd_type',
					defaultType		: 'eu.sm.radio',
					id				: that.cxdTypeId,
					items			: radioTypes,
					postSetValue	: function(cxdType){
						that.items.each(function(formField){
							if(formField.radioDepency){
								var disabled = formField.radioDepency.indexOf(cxdType)==-1;
								formField[disabled?'hide':'show']();
								formField.setDisabled(disabled);
								formField.getEl().up('.x-form-item').setDisplayed(!disabled)
							}
						});
					},
					defaults		: {
						listeners		:{
							check			: function (field,checked){
								if(checked){
									Ext.getCmp(that.cxdTypeId).postSetValue(field.inputValue);
									Ext.getCmp(that.dateId).validate();
								}
							}
						}
					}
				},{
					xtype			: 'datefield',
					name			: 'cxd_date',
					startDay		: 1,
					minValue		: that.lastPayDate,
					id				: that.dateId,
					fieldLabel		: 'Date',
					format			: 'd/m/Y',
					validator		: function (value){
						var date = Date.parseDate(value,this.format);
						var radioGroup = Ext.getCmp(that.cxdTypeId);
						var isGhost=false
						try{
							isGhost = (radioGroup.getEl().query('input[type=radio]:checked/@value')[0].firstChild.nodeValue=='ghost');
						}catch(e){
						}
						if(isGhost && date.format('N')!=1){
							return 'Ghost date must be a monday';
						}
						return true;
					}
				},{
					xtype			: 'triggertree',
					name			: 'cxd_id_employe',
					fieldLabel		: 'Rep',
					id				: that.treeRepId,
					width			: 300,
					children		: treeUser,
					treeConfig		:{
						/*onlyOneChecked	: true,
						listeners		: {
							click		: function(node){
								node.attributes.checked=true;
								node.ui.checkbox.checked=true;
								var tree = node.getOwnerTree();
								tree.fireEvent.call(tree,'checkchange',node,true);
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
						}*/
					}
				},{
					xtype			: 'radiogroup',
					name			: 'cxd_percent',
					fieldLabel		: 'Percentage',
					radioDepency	: ['rainy','allowance'],
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
					name			: 'cxd_contest_point',
					fieldLabel		: 'Contest',
					radioDepency	: ['contest'],
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
			Ext.eu.sm.CxdEditor.superclass.initComponent.call(this);
			that.on('afterlayout',function(){
				if(that.record){
					that.setValues(that.record);
				}
			});
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

			var cxdEditorId = Ext.id();

			var win = new Ext./*eu.attached*/Window({
				resizeTriggerCmp: that,
				stickCmp		: that,
				title			: 'Edit',
				layout			: 'fit',
				width			: 500,
				height			: 260,
				closeAction		:'hide',
				plain			: true,
				items			: {
					xtype				: 'cxdEditor',
					id					: cxdEditorId,
					cxdTypes			: that.cxdTypes,
					treeUsersChildren	: that.treeUsersChildren,
				},
				buttons: [{
					text		: 'Ok',
					disabled	: false,
					handler		: function(){
						var editor = Ext.getCmp(cxdEditorId);
						if(editor.isValid()){
							console.log(editor.getValues());
						}else{
							console.log('not valid');
						}
						//win.destroy();
					}
				},{
					text		: 'Close',
					handler		: function(){
						win.destroy();
					}
				}]
			});
			win.show(null,function(cmp){
				Ext.getCmp(cxdEditorId).setValues(record);
			});
		},

		initComponent		: function(){
			var that = this;

			that.treeUsersId		= Ext.id();
			that.CXDEditorId		= Ext.id();
			that.calendarViewerId	= Ext.id();

			that.getUsersList = function(){
				var userListId=[];
				var tree = Ext.getCmp(that.treeUsersId);
				if(tree){
					var allChecked = tree.getChecked();
					if (allChecked.length>0){
						Ext.each(allChecked,function(v,k){
							userListId=userListId.concat([v.id]);
							userListId=userListId.concat(v.attributes.all_child_id);
						});
					}
				}
				return userListId.join(',');
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
					},'text','cxd'],
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
							that.newCXDWindow(event.cxd);
						},
						dayclick : function(CalendarViewer,date){
							console.log('dayclick',date);
						},
						daycontextmenu : function(CalendarViewer,date){
							console.log('daycontextmenu',date);
						},
						daydblclick : function(CalendarViewer,date){
							console.log('daydblclick',date);
							that.newCXDWindow({cxd_type : 'contest',cxd_date : date ,cxd_id:-1});
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
										delete(that.treeUsersChildren[0].checked);
										that.treeUsersChildren.unshift({
											id				: -1,
											text			: 'All'
										})

										Ext.eu.sm.tree.utils.eachChildren(that.treeUsersChildren,function(node){
											Ext.applyIf(node, {
												leaf			: true,
												expanded		: false
											});
										});

										that.eventStore.load();
										// CCXXDD
										/*that.newCXDWindow({
											cxd_id				: -1,
											cxd_id_employe		: 1072,
											cxd_type			: 'contest',
											cxd_date			: (new Date()).format('Y-m-d'),
											cxd_percent			: 50,
											cxd_contest_point	: 20
										});*/

									}
									/*console.log(node);
									setTimeout(function(){
										var tree = node.getOwnerTree();
										var sel = Ext.eu.sm.tree.utils.findDeepChildNode(tree.getRootNode(),'id','2.1');
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
							defaultType		: 'eu.sm.checkbox',
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
								boxLabel	: 'Ghost',
								name		: 'ghost',
								clspreview	: 'event_cxd_ghost'
							},{
								boxLabel	: 'Rainy'	,
								name		: 'rainy',
								clspreview	: 'event_cxd_rainy'
							},{
								boxLabel	: 'Allowance',
								name		: 'allowance',
								clspreview	: 'event_cxd_allowance'
							},{
								boxLabel	: 'Contest'	,
								name		: 'contest',
								clspreview	: 'event_cxd_contest'
							}]
						}]
					}]
				}]
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