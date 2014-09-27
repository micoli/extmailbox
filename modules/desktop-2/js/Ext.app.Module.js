Ext.app.Module = function(config){
	Ext.apply(this, config);
	Ext.app.Module.superclass.constructor.call(this);
	this.init();
}

Ext.extend(Ext.app.Module, Ext.util.Observable, {
	init : Ext.emptyFn,
	createIconDesktop : function(){
		var that = this;
		var dt = Ext.get('x-shortcuts').createChild({
			tag			: 'dt',
			children	: [{
				tag			: 'a',
				href		: '#',
				onclick		: 'return false;',
				children	: [{
					tag			: 'img',
					class		: that.launcher.iconDesktopCls || that.launcher.iconCls,
					src			: 'modules/desktop-2/images/s.gif',
					width		: 32,
					height		: 32,
				},{
					tag			: 'div',
					html		: this.launcher.text
				}]
			}]
		});
		dt.addListener('click',function(){
			that.launcher.handler.call(that);
		})
	}
});