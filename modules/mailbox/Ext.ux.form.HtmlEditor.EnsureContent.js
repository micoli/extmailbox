/**
 * @class Ext.ux.form.HtmlEditor.EnsureContent
 * @extends Ext.util.Observable
*/
Ext.ux.form.HtmlEditor.EnsureContent = Ext.extend(Ext.util.Observable, {
	init: function(cmp){
		var that = this;
		that.cmp = cmp;
		that.cfg = cmp.ensureContentCfg;
		that.cmp.on('initialize', that.onInit, that, {delay:100, single: true});
		that.cmp.on('render', that.onRender, that);
		cmp.addEvents({
			'contentChange' : true
		});
	},
	onInit: function(){
		var that = this;
		Ext.EventManager.on(that.cmp.getEditorBody(), {
			'keyup': function(){
				that.check(false);
			},
			buffer: 100,
			scope: that
		});
	},
	onRender: function() {
		var that = this;
	},
	check : function(force,cfg){
		var that = this;
		var config = cfg||that.cfg
		that.cmp.fireEvent.call(that.cmp,'contentChange', that.cmp);
		for(var selector in config){
			if(config.hasOwnProperty(selector)){
				var alls=Ext.query(selector,that.cmp.getEditorBody());
				//console.log(that.cmp,alls[0],selector,that.cmp.getEditorBody());
				if(alls.length>0 && (!alls[0].hasChildNodes() || force)){
					alls[0].innerHTML = ((typeof config[selector])=='function')?config[selector]():config[selector];
					//console.log(alls[0].innerHTML);
				}
			}
		}
	}
});