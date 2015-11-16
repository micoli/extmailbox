Ext.namespace('Ext.ux.form');
Ext.ux.form.Checkbox = function(config) {
	Ext.ux.form.Checkbox.superclass.constructor.call(this, config);
}
Ext.extend(Ext.ux.form.Checkbox, Ext.form.Checkbox, {
	checkboxCls: 'x-checkbox',

	checkedCls: 'x-checkbox-checked',

	cbFocusCls: 'x-checkbox-focus',

	cbOverCls: 'x-checkbox-over',

	cbDownCls: 'x-checkbox-down',

	cbDisabledCls: 'x-checkbox-disabled',

	defaultAutoCreate: {tag: 'input', type: 'checkbox', autocomplete: 'off', cls: 'x-hidden'},

	onRender: function(ct, position){
		Ext.ux.form.Checkbox.superclass.onRender.call(this, ct, position);
		this.checkbox = this.wrap.createChild({tag: 'img', src: Ext.BLANK_IMAGE_URL, cls: this.checkboxCls}, this.el);
	},

	initEvents: function() {
		Ext.ux.form.Checkbox.superclass.initEvents.call(this);
		this.checkbox.addClassOnOver(this.cbOverCls);
		this.checkbox.addClassOnClick(this.cbDownCls);
		this.checkbox.on('click', this.toggle, this);
	},

	onDisable: function() {
		Ext.ux.form.Checkbox.superclass.onDisable.call(this);
		this.checkbox.addClass(this.cbDisabledCls);
	},

	onEnable: function() {
		Ext.ux.form.Checkbox.superclass.onDisable.call(this);
		this.checkbox.removeClass(this.cbDisabledCls);
	},

	onFocus: function(e) {
		Ext.ux.form.Checkbox.superclass.onFocus.call(this, e);
		this.checkbox.addClass(this.cbFocusCls);
	},

	onBlur: function(e) {
		Ext.ux.form.Checkbox.superclass.onBlur.call(this, e);
		this.checkbox.removeClass(this.cbFocusCls);
	},

	setValue : function(v) {
		Ext.ux.form.Checkbox.superclass.setValue.call(this, v);
		this.updateCheckedCls();
	},

	updateCheckedCls: function() {
		this.wrap[this.checked ? 'addClass' : 'removeClass'](this.checkedCls);
	},

	toggle: function() {
		if (!this.disabled && !this.readOnly) {
			this.setValue(!this.checked);
		}
	}
});
Ext.reg('ncheckbox', Ext.ux.form.Checkbox);
