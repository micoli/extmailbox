Ext.onReady(function() {
	Ext.QuickTips.init();

	var viewport = new Ext.Viewport({
		layout : 'border',
		frame:true,
		items : [{
			region : 'center',
			xtype : 'htmleditor',
			plugins : [ new Ext.ux.form.HtmlEditor.Table() ,new Ext.ux.form.HtmlEditor.Signature()],
			enableAlignments : true,
			enableColors : true,
			enableFont : true,
			enableFontSize : true,
			enableFormat : true,
			enableLinks : true,
			enableLists : true,
			enableSourceEdit : false,
			border : false,
			value : '<H1>toto</h1><p>lorem ipsum</p><hr><br><span class="readOnly">readonly</span>'
		} ]
	});
});
