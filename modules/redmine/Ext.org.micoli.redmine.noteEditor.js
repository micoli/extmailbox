Ext.org.micoli.redmine.noteEditor = Ext.extend(Ext.form.Field,{
	layout		: 'fit',
	isEditing	: false,

	defaultAutoCreate	:{
		tag: "div"
	},

	renderer	: function (v){
		return textile((''+v).replace(/\r/g,''));
	},

	hideTbar: function() {
		var p = this;
		p.tbar.setVisibilityMode(Ext.Element.DISPLAY);
		p.tbar.hide();
		p.syncSize();
	},

	showTbar: function() {
		var p = this;
		p.tbar.setVisibilityMode(Ext.Element.DISPLAY);
		p.tbar.show();
		p.syncSize();
	},

	initComponent		: function(){
		var that				= this;
		that.descriptionRendId	= Ext.id();
		that.descriptionTextId	= Ext.id();
		Ext.org.micoli.redmine.noteEditor.superclass.initComponent.call(this);
	},

	setValue	: function (v){
		var that				= this;
		Ext.org.micoli.redmine.noteEditor.superclass.setValue.call(that, v);
		var panel = Ext.getCmp(that.descriptionRendId);
		//panel.el.setHeight(that.el.getHeight());
		if(panel){
			panel.el.update(that.renderer.call(that,v));
		}
	},

	initValue : function(){
		if(this.value !== undefined){
			this.setValue(this.value);
		}else if(this.el.dom && this.el.dom.value && this.el.dom.value.length > 0 && this.el.dom.value != this.emptyText){
			this.setValue(this.el.dom.value);
		}
		// reference to original value for reset
		this.originalValue = this.getValue();
	},

	switchToText : function(){
		var that = this;
		that.panelView.getLayout().setActiveItem(1);
		that.panelView.topToolbar.items.items[1].setVisible(false);
		that.panelView.topToolbar.items.items[2].setVisible(true);
		that.panelView.topToolbar.items.items[3].setVisible(true);
		Ext.getCmp(that.descriptionTextId).setValue(that.getValue());
		Ext.getCmp(that.descriptionTextId).focus();
		that.isEditing=true;
	},

	switchToRend : function(update){
		var that = this;
		that.panelView.getLayout().setActiveItem(0);
		that.panelView.topToolbar.items.items[1].setVisible(true);
		that.panelView.topToolbar.items.items[2].setVisible(false);
		that.panelView.topToolbar.items.items[3].setVisible(false);
		that.isEditing=true;
		if(update){
			that.setValue(Ext.getCmp(that.descriptionTextId).getValue());
		}
	},

	onRender: function(ct, position){
		var that = this;
		Ext.org.micoli.redmine.noteEditor.superclass.onRender.call(this, ct, position);
		that.panelView = new Ext.Panel({
			layout		: 'card',
			height		: that.height,
			width		: that.width,
			activeItem	: 0,
			tbar		: ['->',{
				xtype		: 'button',
				iconCls		: 'edit',
				text		: 'edit',
				handler		: function(){
					that.switchToText();
				}
			},{
				xtype		: 'button',
				iconCls		: 'yes',
				text		: 'ok',
				hidden		: true,
				handler		: function(){
					that.switchToRend(true);
				}
			},{
				xtype		: 'button',
				iconCls		: 'cancel',
				text		: 'cancel',
				hidden		: true,
				handler		: function(){
					that.switchToRend();
				}
			}],
			autoScroll	: true,
			items		: [{
				xtype		: 'panel',
				cls			: 'textile',
				id			: that.descriptionRendId
			},{
				xtype		: 'textarea',
				id			: that.descriptionTextId,
				style		: {
					border		: 0
				},
				enableKeyEvents	: true,
				listeners		: {
					keydown : function(f,e){
						//console.log('kd',e.keyCode)
						return that.completer.keydown(e);
					},
					keypress : function(f,e){
						//console.log('kp',e.keyCode)
					},
					keyup : function(f,e){
						//console.log('ku',e.keyCode)
						return that.completer.keyup(e);
					}
				}
			}]
		});

		that.panelView.render(this.el);

		/*
		Ext.getCmp(that.descriptionRendId).el.on('mouseenter',function(){
			console.log(arguments);
			that.showTbar.call(that.panelView);
		});
		Ext.getCmp(that.descriptionRendId).el.on('mouseleave',function(){
			that.hideTbar.call(that.panelView);
		});
		*/

		Ext.getCmp(that.descriptionRendId).el.on('dblclick',function(){
			that.switchToText();
		});

		that.on('resize',function(){
			var s = that.getSize();
			s.height = s.height - that.panelView.topToolbar.el.getHeight();
			that.panelView.setSize(s.width,s.height);
			Ext.getCmp(that.descriptionRendId).setSize(s.width,s.height);
			Ext.getCmp(that.descriptionTextId).setSize(s.width,s.height);
		});

		that.completer = new Ext.org.micoli.completer({
			cmp		: Ext.getCmp(that.descriptionTextId),
			plugins	: [{
				group			: 'aa',
				tagMask			: /::(.+)/,
				mode			: 'local',
				store			: new Ext.data.JsonStore({
					root			: 'root',
					idProperty		: 'id',
					fields			: ['id','display'],
					data			: {root:[{id:"a01",display:"valdsdsds01"},{id:"a02",display:"val02"},{id:"a03",display:"val03"},{id:"a04",display:"val04"},{id:"a05",display:"val05"},{id:"a06",display:"val06"},{id:"a07",display:"val07"},{id:"a08",display:"val08"},{id:"a09",display:"val09"},{id:"a10",display:"val10"},{id:"a11",display:"val11"},{id:"a12",display:"val12"},{id:"a13",display:"val13"},{id:"a14",display:"val14"},{id:"a15",display:"val15"},{id:"a16",display:"val16"}]},
					proxy			: new Ext.data.MemoryProxy({})
				})
			},{
				group			: 'Tasks',
				tagMask			: /!!(.+)/,
				mode			: 'remote',
				queryParam		: 'name',
				renderer		: function(record){
					return '[['+record.get('display')+']]';
				},
				store			: new Ext.data.JsonStore({
					fields			: ['id','display','subject'],
					root			: 'issues',
					idProperty		: 'id',
					baseParams		: {
					},
					proxy			: new Ext.data.HttpProxy(that.redmineService.requestPrm({
						url				: 'issues.json',
						method			: 'GET'
					})),
					formatRecords	: function (){
						this.each(function(record){
							record.set('display',record.get('subject'));
						})
					}
				})
			},{
				group			: 'Users',
				tagMask			: /::(.+)/,
				mode			: 'remote',
				queryParam		: 'name',
				store			: new Ext.data.JsonStore({
					fields			: ['id','display','mail','login','firstname','lastname'],
					root			: 'users',
					idProperty		: 'id',
					baseParams		: {
					},
					proxy			: new Ext.data.HttpProxy(that.redmineService.requestPrm({
						url				: 'users.json',
						method			: 'GET'
					})),
					formatRecords	: function (){
						this.each(function(record){
							record.set('display',record.get('firstname')+' '+record.get('lastname'));
						})
					}
				})
			}/*,{
				group			: 'bb',
				tagMask			: /::(.+)/,
				mode			: 'remote',
				store			: new Ext.data.JsonStore({
					fields			: ['id','display'],
					root			: 'root',
					idProperty		: 'id',
					baseParams		: {
						exw_action		: 'local.redmineTest.test1',
						group			: 'bb'
					},
					proxy			: new Ext.data.HttpProxy({
						url				: '/proxy.php'
					}),
				})
			}*/,{
				group			: 'dd',
				tagMask			: /::(.+)/,
				mode			: 'local',
				store			: new Ext.data.JsonStore({
					root			: 'root',
					idProperty		: 'id',
					fields			: ['id','display'],
					data			: {root:[{id:"a01",display:"user1dsdsds01"},{id:"a02",display:"user2"},{id:"a03",display:"val003"},{id:"a04",display:"val004"},{id:"a05",display:"val005"},{id:"a06",display:"val006"},{id:"a07",display:"val007"},{id:"a08",display:"val008"},{id:"a09",display:"val009"},{id:"a10",display:"val010"},{id:"a11",display:"val011"},{id:"a12",display:"val012"},{id:"a13",display:"val013"},{id:"a14",display:"val014"},{id:"a15",display:"val015"},{id:"a16",display:"val016"}]},
					proxy			: new Ext.data.MemoryProxy({})
				})
			}]
		});
		that.completer.onPrivateSearch(3,'user3');
		if(that.isEditing){
			setTimeout(function(){
				that.switchToText()
			},50);
		}
	},

	onDestroy : function(){
		var that = this;
		if(that.completer){
			that.completer.onDestroy();
		}
	}
});

Ext.reg('eu.sm.redmine.noteEditor', Ext.org.micoli.redmine.noteEditor);