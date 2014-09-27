Ext.ns('Ext.eu.sm.form');

Ext.eu.sm.form.renderedField = Ext.extend(Ext.form.Field,{
	autoEl		: 'div',
	//inputType	: 'hidden',

	renderer	: function (v){
		return v;
	},

	onRender : function(ct, position){
		this.fireEvent('beforerender',ct);
		Ext.form.Field.superclass.onRender.call(this, ct, position);
		var cfg={
			type	: 'hidden',
			tag		: 'input',
			name	: this.name || this.id
		}
		this.eldom = ct.createChild(cfg, position);

		this.fireEvent('afterrender',ct);
	},

	setValue	: function (v){
		Ext.eu.sm.form.renderedField.superclass.setValue.call(this, v);
		if(this.el){
			this.el.update(this.renderer.call(this,v));
		}
		if(this.eldom){
			this.eldom.set({value:v});
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
});

Ext.reg('eu.sm.form.renderedField',Ext.eu.sm.form.renderedField);