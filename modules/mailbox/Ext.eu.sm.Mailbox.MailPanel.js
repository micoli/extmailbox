Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.MailPanel = Ext.extend(Ext.Panel, {
	fullRecord			: null,
	loading				: true,
	mailboxContainer	: null,
	emptyMessageTemplate: '<div class="editor-content"><br><br></div><div class="editor-footer"></div>',

	stripAndTrim		: function(str){
		var tmp = document.createElement("DIV");
		tmp.innerHTML = str;
		str = tmp.textContent==''?'':(tmp.textContent || tmp.innerText);
		str = ''+str;
		str = str.replace(/^\s+/g,'').replace(/\s+$/g,'');
		return str;
	},

	JSONsyntaxHighlight	: function (json) {
		if (typeof json != 'string') {
			json = JSON.stringify(json, undefined, 2);
		}
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var cls = 'number';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'key';
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
				cls = 'null';
			}
			return '<pre><span class="' + cls + '">' + match + '</span></pre>';
		});
	},

	setPanelTitle : function (subject){
		var that = this;
		that.setTitle(subject.length>30?subject.substr(0,28)+"...":(subject||'-'));
	}

});