Ext.ux.form.Radio = Ext.extend(Ext.ux.form.Checkbox, {
	checkboxCls: 'x-radio',

	inputType: 'radio',

	markInvalid : Ext.emptyFn,

	clearInvalid : Ext.emptyFn,

	getGroupValue : function(){
		var p = this.el.up('form') || Ext.getBody();
		var c = p.child('input[name='+this.el.dom.name+']:checked', true);
		return c ? c.value : null;
	},

	onClick : function(){
		if(this.el.dom.checked != this.checked){
			this.setValue(this.el.dom.checked);
		}
	},

	setValue : function(v){
		if (typeof v == 'boolean') {
			Ext.ux.form.Radio.superclass.setValue.call(this, v);
			if (v) {
				var p = this.el.up('form') || Ext.getBody();
				var els = p.select('input[name='+this.el.dom.name+']');
				els.each(function(el) {
					if (!el.dom.checked) {
						el.fireEvent('change');
					}
				});
			}
		} else {
			var el = this.el.up('form').child('input[name='+this.el.dom.name+'][value='+v+']');
			if (el) {
				el.dom.checked = true;
				el.fireEvent('change');
			};
		}
	},

	toggle: function() {
		if (!this.disabled && !this.readOnly) {
			this.setValue(true);
		}
	}
});
Ext.reg('nradio', Ext.ux.form.Radio);
