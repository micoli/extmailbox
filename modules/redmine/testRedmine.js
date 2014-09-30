Ext.app.Modules.testRedmine = Ext.extend(Ext.app.Module, {
	id		:'test-win-redmine',
	init	: function(){
		var that = this;
		that.redmineService = new Ext.org.micoli.redmine.service();
		that.launcher = {
			text			: 'Redmine',
			iconCls			:'icon-grid',
			iconDesktopCls	:'icon-grid',
			handler			: this.createWindow,
			scope			: this
		}
	},

	createWindow : function(){
		var that	= this;
		var desktop	= this.app.getDesktop();
		var win		= desktop.getWindow(this.id);

		var fLaunch	= function(){
			if(!win){
				var dynFormId = Ext.id();
				var aContent = [{
					xtype			: 'form',
					frame			: true,
					items			: [{
						xtype			: 'eu.sm.redmine.noteEditor',
						frame			: false,
						isEditing		: true,
						width			: 700,
						height			: 500,
						redmineService	: that.redmineService,
						fieldLabel		: 'Test',
						value			: "* *bold* ::a !!i\r\n* _italic_\r\n* *_bold italic_*\r\n* +underline+\r\n* -strike-through-\r\n* Plain ^superscript^\r\n* Plain ~subscript~\r\n* @inline monospace@\r\n* normal *bold* _italic_ normal;E=mc ^2^\r\n* normal<notextile></notextile>*bold*<notextile></notextile>_italic_<notextile></notextile>normal;E=mc<notextile></notextile>^2^\r\n* Escaping: <notextile>*bold* _italic_ @inlinemono@</notextile> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Alternative using HTML-codes: &#42;bold&#42; &#95;italic&#95; &#64;inlinemono&#64;\r\n* <pre>*some lines*      some \"link\":http://www.redmine.org</pre>\r\n* <pre><notextile></notextile>*some lines*      some \"link\":http://www.redmine.org</pre>\r\n\r\n\r\n* %{color:red}red% %{color:green}green% %{color:yellow}yellow% %{color:#82B6E1}blue'ish%\r\n* %{color:red}red%<notextile></notextile>%{color:green}green%<notextile></notextile>%{color:yellow}yellow%<notextile></notextile>%{color:#82B6E1}blue'ish%\r\n* %{background:lightgreen}Lightgreen Background% %{background:yellow}Yellow Background%\r\n* %{background:lightgreen}Lightgreen Background%<notextile></notextile>%{background:yellow}Yellow Background%\r\n\r\n\r\nh1. Heading\r\n\r\nh2. Subheading\r\n\r\nh3. Subheading\r\n\r\n\r\np. left aligned\r\n\r\n  p(. left ident 1em\r\n\r\n    p((. left ident 2em\r\n    as well as for following lines\r\n\r\n                                                                                   p>. right aligned\r\n\r\n                                                                        p)))>. right ident 3em\r\n\r\n                           p=. This is centered paragraph.\r\n\r\nbq. Rails is a full-stack framework for developing database-backed web applications according to the Model-View-Control pattern.\r\nTo go live, all you need to add is a database and a web server.\r\n\r\n* Item 1\r\n* Item 2\r\n** Item 21\r\n** Item 22\r\n* Item 3\r\n\r\n# Item 1\r\n# Item 2\r\n# Item 3\r\n## Item 3.1\r\n## Item 3.2\r\n\r\n|_.UserID      |_.Name          |_.Group     |_. attribute list   |\r\n|Starting with | a              |   simple   |row                 |\r\n|\\3=.IT                                      |<. align left       |\r\n|1             |Artur Pirozhkov |/2.Users    |>. align right      |\r\n|2             |Vasya Rogov     |=. center   |\r\n|3             |John Smith      |Admin\r\n                                 (root)      |^. valign top       |\r\n|4             |-               |Nobody\r\n                                 (anonymous) |~. valign bottom    |\r\n\r\n<pre><code class=\"ruby\">\r\n  Place your code here.\r\n</code></pre>\r\n\r\n"
					}]
				}]
				var aContent = [{
					xtype			: 'org.micoli.redmine.attachmentsUploader',
					redmineService	: that.redmineService,
					issue_id		: 1,
					frame			: true
				}]
				/*var aContent = [{
					xtype			: 'eu.sm.redmine.main',
					redmineService	: that.redmineService
				}];*/
				win = desktop.createWindow({
					id				: 'grid-win',
					title			: 'Test Window',
					width			: 1240,
					height			: 480,
					maximized		: true,
					iconCls			: 'icon-grid',
					shim			: false,
					animCollapse	: false,
					constrainHeader	: true,
					layout			: 'fit',
					items			: aContent
				});
			}
			win.show();
		}

		if(that.redmineService.isReady){
			fLaunch();
		}else{
			that.redmineService.on('initDone',fLaunch)
		}
	}
});