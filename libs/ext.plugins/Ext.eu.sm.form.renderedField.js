Ext.ns('Ext.eu.sm.form');

Ext.eu.sm.form.renderedField = Ext.extend(Ext.form.Field,{
	autoEl		: 'div',
	renderer	: function (v){
		return v;
	},
	setValue	: function (v){
		Ext.eu.sm.form.renderedField.superclass.setValue.call(this, v);
		this.el.update(this.renderer(v));
	}
});
Ext.reg('eu.sm.form.renderedField',Ext.eu.sm.form.renderedField);