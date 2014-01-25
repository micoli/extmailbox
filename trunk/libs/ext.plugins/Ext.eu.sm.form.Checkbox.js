Ext.ns('Ext.eu.sm.form');

Ext.eu.sm.form.Checkbox = Ext.extend(Ext.form.Checkbox,{
	clspreview	:'',
	onRender	: function(ct, position){
		Ext.form.Checkbox.superclass.onRender.call(this, ct, position);
		if(this.inputValue !== undefined){
			this.el.dom.value = this.inputValue;
		}
		this.el.addClass('x-hidden');

		this.innerWrap = this.el.wrap({
			tabIndex	: this.tabIndex,
			cls			: this.baseCls+'-wrap-inner'
		});

		this.wrap = this.innerWrap.wrap({cls: this.baseCls+'-wrap'});

		if(this.boxLabel){
			this.labelEl = this.innerWrap.createChild({
				cls		: 'x-form-cb-label',
				htmlFor	: this.el.id,
				tag		: 'label',
				children:[{
					cls		: 'x-form-cb-label-classpreview '+this.clspreview,
					tag		: 'span',
					html	: '&nbsp;'
				},{
					tag		: 'span',
					html	: this.boxLabel
				}]
			});
		}

		this.imageEl = this.innerWrap.createChild({
			tag	: 'img',
			src	: Ext.BLANK_IMAGE_URL,
			cls	: this.baseCls
		}, this.el);

		if(this.checked){
			this.setValue(true);
		}else{
			this.checked = this.el.dom.checked;
		}
		this.originalValue = this.checked;
	}
});

Ext.reg('eu.sm.checkbox', Ext.eu.sm.form.Checkbox);
