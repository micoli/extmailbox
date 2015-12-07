Ext.namespace('Ext.ux.form');

Ext.ux.form.CodeMirror = Ext.extend(Ext.form.TextArea, {
	internalValue	:'',

	codeMirrorConfig: {
		language		: 'txt',
	},

	initComponent	: function() {
		var that = this;
		that.initialized = false;
		that.codeMirrorId = Ext.id();
		that.internalValue = that.initialConfig.value;
		Ext.ux.form.CodeMirror.superclass.initComponent.apply(that, arguments);
		that.addEvents('initialize');
		that.on({
			'resize': function(cmp,adjWidth, adjHeight, rawWidth, rawHeight) {
				var el = Ext.select('.CodeMirror',that.getEl());
				console.log(cmp,cmp.codeMirrorConfig,adjWidth, adjHeight, rawWidth, rawHeight,el);
				if (el) {
					el.elements.forEach(function(e) {
						Ext.get(e).setSize(rawWidth, rawHeight);
					});
				}
			},
			render: function() {
				console.log('that.codeMirrorConfig ',that.codeMirrorConfig);
				that.codeEditor = CodeMirror.fromTextArea(that.el.dom,that.codeMirrorConfig);
				that.codeEditor.setValue(that.internalValue||'');
				that.initialized = true;
			}
		});
	},

	getValue	: function() {
		var that = this;
		if (that.initialized) {
			return that.codeEditor.getValue();
		}
		return that.internalValue;
	},

	setValue	: function(v) {
		var that = this;
		that.internalValue = v;
		if (that.initialized) {
			that.codeEditor.setValue(v);
		}
	},

	validate	: function() {
		var that = this;
		that.getValue();
		Ext.ux.form.CodeMirror.superclass.validate.apply(that, arguments);
	}
});

Ext.reg('ux-codemirror', Ext.ux.form.CodeMirror);