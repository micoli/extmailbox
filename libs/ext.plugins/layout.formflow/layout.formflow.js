Ext.Container.LAYOUTS['formflow'] = Ext.extend(Ext.layout.FormLayout, {
	fieldTpl	: new Ext.Template(
		'<div style="float:left;" class="x-form-item {5}" tabIndex="-1">',
			'<label for="{0}" style="{2}" class="x-form-item-label">{1}{4}</label>',
			'<div class="x-form-element" id="x-form-el-{0}" style="{3}">',
			'</div><div class="{6}"></div>',
		'</div>'
	)
});