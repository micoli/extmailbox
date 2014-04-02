Ext.ns('Ext.eu.sm');

Ext.eu.sm.swfObject = Ext.extend(Ext.BoxComponent, {
	swfConfig		: {},
	globalFunctions : [],
	swfContainerId	: null,
	initComponent	: function(){
		var that	= this;
		that.swfId	= Ext.id();
		that.swf	= null;
		that.addEvents('objectCreated');
		Ext.eu.sm.swfObject.superclass.initComponent.call(this);
	},
	onResize		: function(ct, position){
		var that = this;
		Ext.eu.sm.swfObject.superclass.onResize.call(this, ct, this.maininput);
		if(that.swf){
			var containerSize = Ext.get(that.swfConfig.swfContainerId).getSize();
			that.swf.height	= containerSize.height;
			that.swf.width	= containerSize.width
		}
	},

	onRender		: function(ct,position){
		var that=this;
		that.el = ct.createChild({
			tag		: 'div' ,
			class	: 'swfObject',
			id		: that.swfConfig.swfContainerId
		});

		swfobject.embedSWF(
			that.swfConfig.swfUrlStr		,
			that.swfConfig.swfContainerId	,
			that.swfConfig.widthStr			,
			that.swfConfig.heightStr		,
			that.swfConfig.swfVersionStr	,
			that.swfConfig.xiSwfUrlStr		,
			that.swfConfig.flashVarsObj		,
			that.swfConfig.parObj			,
			{id: that.swfId}
		);
		Ext.eu.sm.swfObject.superclass.onRender.call(this, ct,position);
		that.swf = document.getElementById(that.swfId);
		that.fireEvent('objectCreated',that,that.swf);
	}
});

Ext.reg('eu.sm.swfobject',Ext.eu.sm.swfObject);