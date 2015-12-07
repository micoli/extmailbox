Ext.ns('Ext.eu.sm.rest');

Ext.eu.sm.rest.mainPanel = Ext.extend(Ext.Panel, {
	initComponent		: function(){
		var that = this;
		that.xxxGridId			= Ext.id();

		Ext.apply(that,{
		});
		Ext.eu.sm.rest.mainPanel.superclass.initComponent.call(this);
	}
});
Ext.reg('rest.mainPanel',Ext.eu.sm.rest.mainPanel);