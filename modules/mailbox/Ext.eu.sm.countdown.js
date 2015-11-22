Ext.ns('Ext.eu.sm');

Ext.eu.sm.countdown = Ext.extend(Ext.Component, {
	nbCycle	: 6,
	delay	: 1000,

	initComponent : function(){
		var that	= this;
		that.timer	= null;
		that.nb		= 0;
		that.addEvents({
			'tick' : true
		});
		Ext.eu.sm.countdown.superclass.initComponent.call(this);
	},

	handler : function(cmp){
		var that = this;
		var _cb = function(){
			that.nb--;
			that.fireEvent('tick',that.nb);
			if(that.nb>0){
				that.timer = window.setTimeout(_cb,that.delay);
			}
		};
		if(that.nb==0){
			that.nb = that.nbCycle;
			that.timer = window.setTimeout(_cb,that.delay);
		}else{
			that.nb = that.nbCycle;
		}
	}
});