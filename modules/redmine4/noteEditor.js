Ext.eu.sm.redmine.noteEditor = Ext.extend(Ext.form.Field,{
	defaultAutoCreate	:{
		tag: "div"
	},
	//autoEl		: 'div',
	layout		: 'fit',
	renderer	: function (v){
		return '<div class="textile">'+textile(v)+'</div>';
	},

	initComponent		: function(){
		var that				= this;
		that.descriptionRendId	= Ext.id();
		that.descriptionTextId	= Ext.id();
		this.callParent(this);
	},

	setValue	: function (v){
		var that				= this;
		Ext.eu.sm.redmine.noteEditor.superclass.setValue.call(that, v);
		var panel = Ext.getCmp(that.descriptionRendId);
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

	onRender: function(ct, position){
		var that = this;
		Ext.eu.sm.redmine.noteEditor.superclass.onRender.call(this, ct, position);

		that.switchToText=function(){
			that.panelView.getLayout().setActiveItem(1);
			that.panelView.topToolbar.items.items[1].setVisible(false);
			that.panelView.topToolbar.items.items[2].setVisible(true);
			that.panelView.topToolbar.items.items[3].setVisible(true);
			Ext.getCmp(that.descriptionTextId).setValue(that.getValue());
		};

		that.switchToRend=function(update){
			that.panelView.getLayout().setActiveItem(0);
			that.panelView.topToolbar.items.items[1].setVisible(true);
			that.panelView.topToolbar.items.items[2].setVisible(false);
			that.panelView.topToolbar.items.items[3].setVisible(false);
			if(update){
				that.setValue(Ext.getCmp(that.descriptionTextId).getValue());
			}
		};

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
			items		: [{
				xtype			: 'panel',
				id				: that.descriptionRendId,
			},{
				xtype			: 'textarea',
				id				: that.descriptionTextId,
				style			: {
					border			: 0
				},
			}]
		});

		that.panelView.render(this.el);

		Ext.getCmp(that.descriptionRendId).el.on('dblclick',function(){
			that.switchToText();
		});

		that.on('resize',function(){
			var s = that.getSize();
			s.height = s.height - that.panelView.topToolbar.el.getHeight();
			that.panelView.setSize(s.width,s.height);
			Ext.getCmp(that.descriptionRendId).setSize(s.width,s.height);
			Ext.getCmp(that.descriptionTextId).setSize(s.width,s.height);
		})
	}
});
