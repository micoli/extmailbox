Ext.ns('Ext.eu.sm');

Ext.eu.sm.dataTemplateSelector = Ext.extend(Ext.Panel, {
	buttonOk		: false,
	selectedIndex	: true,
	initComponent	: function (){
		var that			= this;
		that.detailPanelId	= Ext.id();
		that.buttonOkId	= Ext.id();

		this.addEvents('selected','show');

		Ext.apply(that,{
			collapsible	: true,
			layout		: 'border',
			items		: [{
				xtype			: 'dataview',
				region			: 'center',
				store			: that.store,
				multiSelect		: false,
				autoScroll		: true,
				overClass		: 'x-view-over',
				cls				: that.cls|| '',
				emptyText		: that.emptyText,
				itemSelector	: that.itemSelector,
				tpl				: that.thumbTpl,
				listeners: {
					click	: {
						fn		: function(cmp,index,el,event){
							if(that.buttonOk){
								Ext.getCmp(that.buttonOkId).setDisabled(false);
								that.selectedIndex = index;
							}
							var detailEl = Ext.getCmp(that.detailPanelId);
							if(detailEl && detailEl.body){
								var data = that.store.getAt(index);
								detailEl.body.hide();
								detailEl.tpl.overwrite(detailEl.body, data.data);
								detailEl.body.slideIn('l', {stopFx:true,duration:.2});
								that.fireEvent('show',index,that.store.getAt(index))
							}
						},
						scope	: that,
						buffer	: 100
					},
					dblclick	: function(cmp,index,el,event){
						if(that.buttonOk){
							Ext.getCmp(that.buttonOkId).setDisabled(false);
							that.selectedIndex = index;
						}
						that.fireEvent('selected',that.store.getAt(index),index)
					}
				}
			},{
				region		: 'east',
				tpl			: that.detailTpl,
				id			: that.detailPanelId,
				split		: true,
				width		: 150,
				minWidth	: 150,
				maxWidth	: 200
			}]
		});
		if(that.buttonOk){
			that.bbar=['->',{
				text	: 'ok',
				id		: that.buttonOkId,
				disabled: true,
				handler	: function(){
					that.fireEvent('selected',that.store.getAt(that.selectedIndex),that.selectedIndex);
				}
			}]
		}

		Ext.eu.sm.dataTemplateSelector.superclass.initComponent.call(this);
	}
});

Ext.reg('dataTemplateSelector',Ext.eu.sm.dataTemplateSelector);