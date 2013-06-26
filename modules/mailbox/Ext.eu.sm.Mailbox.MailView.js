Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.MailView= Ext.extend(Ext.Panel, {
	mailboxContainer		: null,
	record					: null,
	fullRecord				: null,
	loading					: true,
	folderTreeId			: null,
	displayInlineComponents	: true,
	initComponent			: function(){
		var that = this;
		that.contentId					= Ext.id();
		that.formId						= Ext.id();
		that.attachmentPanelId			= Ext.id();
		that.headerPanelId				= Ext.id();
		that.displayInlineComponentsId	= Ext.id();
		that.flagButtonId				= {
			seen				: Ext.id()
		}
		that.partStore			= new Ext.data.JsonStore({
			fields	: [
				'filename',
				'size',
				'hsize',
				'type',
				'folder',
				'message_no',
				'account'
			],
			proxy	: new Ext.data.MemoryProxy([])
		});

		that.recipientToStore = new Ext.data.JsonStore({
			fields	: [
				'email',
				'personal'
			],
			data	: [],
			sortInfo: {field: 'email', direction: 'ASC'},
			proxy	: new Ext.data.MemoryProxy([])
		});

		Ext.apply(that,{
			layout	: 'border',
			items	: [{
				region		: 'north',
				baseCls		: 'x-plain',
				split		: true,
				height		: 120,
				labelWidth	: 70,
				id			: that.formId,
				frame		: true,
				bodyStyle	: 'padding:2px 2px 2px 2px;',
				tbar		: [{
					xtype			: 'button',
					iconCls			: 'mail_pin_yellow',
					enableToggle	: true,
					pressed			: false,
					handler			: function (cmp){
						var tabPanel = Ext.getCmp(that.mailboxContainer.mailPreviewsId);
						if(cmp.pressed){
							Ext.fly(tabPanel.getTabEl(that)).removeClass('x-tab-strip-closable');
						}else{
							Ext.fly(tabPanel.getTabEl(that)).addClass('x-tab-strip-closable');
						}
					}
				},'-',{
					text		: Ext.eu.sm.MailBox.i18n._('Reply'),
					iconCls		: 'mail_closed_alt',
					handler		: function(){
						that.mailboxContainer.mailReply.call(that.mailboxContainer,that.record);
					}
				},{
					text		: Ext.eu.sm.MailBox.i18n._('Reply to all'),
					iconCls		: 'mail_closed_alt_add',
					handler		: function(){
						that.mailboxContainer.mailReplyToAll.call(that.mailboxContainer,that.record);
					}
				},{
					text		: Ext.eu.sm.MailBox.i18n._('Forward'),
					iconCls		: 'mail_closed_send',
					handler		: function(){
						that.mailboxContainer.mailForward.call(that.mailboxContainer,that.record);
					}
				},'-',{
					text		: Ext.eu.sm.MailBox.i18n._('Delete'),
					iconCls		: 'mail_closed_delete',
					handler		: function(){
						alert('to do');
					}
				},{
					text		: Ext.eu.sm.MailBox.i18n._('Move'),
					iconCls		: 'mail_inbox',
					handler		: function(cmp,event){
						Ext.getCmp(that.folderTreeId).createFolderMenu({
							disabledId	: that.record.get('folder'),
							listeners	: {
								'selected' : function (item){
									console.log('OK to move',item);
								},
							}
						}).showAt(event.getXY());
					}
				},{
					text		: Ext.eu.sm.MailBox.i18n._('Move'),
					iconCls		: 'mail_inbox',
					handler	: function(cmp){
						cmp.attachedCmp = new Ext.eu.attachedWindow({
							resizeTriggerCmp: that,
							stickCmp		: cmp,
							width			: 350,
							height			: 150,
							layout			: 'fit',
							items			: [{
								xtype			: 'mailbox.folderselect',
								folderTreeId	: that.folderTreeId,
								listeners:{
									'selected'	: function(selected){
										console.log('OK to move',selected);
										cmp.attachedCmp.destroy();
									},
									'cancel'	: function(selected){
										console.log('cancel');
										cmp.attachedCmp.destroy();
									}
								}
							}]
						});
						cmp.attachedCmp.show();
					}
				},'-',{
					xtype		: 'button',
					text		: Ext.eu.sm.MailBox.i18n._('View'),
					id			: that.flagButtonId['seen'],
					enableToggle: true,
					pressed		: that.record.get('seen'),
					handler		: function (cmp){
						that.mailboxContainer.mailChangeFlag.call(that.mailboxContainer,that.record,'seen');
					}
				},'-',{
					xtype		: 'button',
					text		: Ext.eu.sm.MailBox.i18n._('view Inline Images'),
					enableToggle: true,
					id			: that.displayInlineComponentsId,
					pressed		: that.displayInlineComponents,
					hidden		: true,
					handler		: function (cmp){
						if(cmp.pressed){
							that.displayInlineComponentsFunc();
							cmp.hide();
						}
					}
				},'->',{
					text		: Ext.eu.sm.MailBox.i18n._('Header'),
					iconCls		: 'mail_open_alt',
					handler		: function(){
						if(!that.loading){
							new Ext.Window({
								title		: Ext.eu.sm.MailBox.i18n._('Raw headers'),
								height		: 350,
								width		: 830,
								minimizable	: false,
								maximizable	: true,
								resizable	: true,
								modal		: true,
								shim		: true,
								plain		: true,
								closable	: true,
								layout		: 'fit',
								items		:{
									xtype		: 'textarea',
									value		: that.fullRecord.rawheader
								}
							}).show();
						}else{
							alert(Ext.eu.sm.MailBox.i18n._('Still loading email body'));
						}
					}
				},{
					text		: Ext.eu.sm.MailBox.i18n._('Source'),
					iconCls		: 'mail_open_alt',
					handler		: function(){
						var areaId = Ext.id();
						var w = new Ext.Window({
							title		: Ext.eu.sm.MailBox.i18n._('Raw source'),
							height		: 350,
							width		: 830,
							minimizable	: false,
							maximizable	: true,
							resizable	: true,
							modal		: true,
							shim		: true,
							plain		: true,
							closable	: true,
							layout		: 'fit',
							items		: {
								xtype		: 'textarea',
								id			: areaId,
								value		: 'loading'
							}
						}).show();
						Ext.Ajax.request({
							url		: 'proxy.php',
							params	: {
								exw_action		: 'local.mailboxImap.getMessageSource',
								account			: that.record.get('account'),
								folder			: that.record.get('folder'),
								message_no		: that.record.get('uid'),
							},
							success	: function(data){
								var val = JSON.parse(data.responseText);
								Ext.getCmp(areaId).setValue(val.source);
							}
						});
					}
				}],
				xtype			: 'panel',
				id				: that.headerPanelId,
				autoScroll		: true,
				tpl				: new Ext.XTemplate(
					'<tpl for=".">',
						'<div class="header-wrap">',
						'<table style="width:100%;">',
							'<tr class="x-grid3-row">',
								'<td>',Ext.eu.sm.MailBox.i18n._('From'),':</td>',
								'<td><ul class="mailview-recipients">{from}</ul><span style="float:right;">{date}</span></td>',
							'</tr>',
							'<tr class="x-grid3-row">',
								'<td>',Ext.eu.sm.MailBox.i18n._('To'),':</td>',
								'<td><ul class="mailview-recipients">{to}</ul></td>',
							'</tr>',
							'<tr class="x-grid3-row">',
								'<td>',Ext.eu.sm.MailBox.i18n._('Subject'),':</td>',
								'<td>{subject}</td>',
							'</tr>',
							'<tr class="x-grid3-row">',
								'<td>',Ext.eu.sm.MailBox.i18n._('Cc'),':</td>',
								'<td><ul class="mailview-recipients">{cc}</ul></td>',
							'</tr>',
						'</table>',
						'</div>',
					'</tpl>'
				)
			},{
				region		: 'center',
				layout		: 'border',
				items		: [{
					region		: 'center',
					xtype		: 'iframepanel',
					id			: that.contentId,
					autoCreate	: true,
					autoScroll	: true,
					//loadMask	: true,
					border		: false,
					html		: '<div style="text-align: center;padding-top:20px;">Loading <h2>'+that.record.get('subject')+'</h2></div>',
					listeners	: {
						'documentloaded'		: function(){
							if(!that.loading){
								//console.log('ici');
								//Ext.getCmp(that.contentId).body.unmask();
							}
						}
					}
				},{
					region			: 'south',
					xtype			: 'dataview',
					height			: 0,
					minHeight		: 20,
					id				: that.attachmentPanelId,
					autoScroll		: true,
					split			: true,
					singleSelect	: true,
					overClass		: 'x-view-over',
					itemSelector	: 'div.attachments-wrap',
					emptyText		: '<div style="padding:10px;">No attachments</div>',
					store			: that.partStore,
					html			: '',
					tpl				: new Ext.XTemplate(
						'<tpl for=".">',
							'<span class="attachments-wrap">',
								'<span class="attachments-filename">',
									'<a target="attachifr-{account}-{folder}-{message_no}-{filename}" href="{attachUrlLink}">',
										'<span class="file-icon file-{type}">',
											'{hfilename}',
										'</span>',
									'</a>',
									'<iframe src="" style="display:none;" name="attachifr-{account}-{folder}-{message_no}-{filename}"></iframe>',
								'</span>',
								'<span class="attachments-size">',
									'&nbsp;({hsize})',
								'</span>',
								'&nbsp;',
							'</span>',
						'</tpl>'
					),
					listeners		: {
						'beforeselect'   : {fn:function(view){
							return view.store.getRange().length > 0;
						}}
					}

				}]
			}]
		});
		Ext.eu.sm.MailBox.MailView.superclass.initComponent.call(this);
	},

	updateRecord	: function (record){
		var that = this;
		that.record = record;
		Ext.getCmp(that.flagButtonId['seen']).toggle((that.record.get('seen')==1));
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
	displayInlineComponentsFunc : function(){
		var that = this;
		var contentPanel = Ext.getCmp(that.contentId);
		contentPanel.getFrameBody().innerHTML=contentPanel.getFrameBody().innerHTML.replace(/src\=\"\" data\-imgsafesrc\=/g,' src=');
	},
	loadMail		: function (){
		var that = this;
		var headerPanel		= Ext.getCmp(that.headerPanelId);
		var contentPanel	= Ext.getCmp(that.contentId);

		contentPanel.body.mask();

		headerPanel.tpl.overwrite(headerPanel.body, {
			subject	: that.record.get('subject'),
			date	: Ext.util.Format.dateRenderer(Ext.eu.sm.MailBox.i18n._('d/m/Y H:i:s'))(that.record.get('date')),
			from	: Ext.eu.sm.MailBox.utils.formatRecipient(that.record.get('from'	),'<li>','</li>','&nbsp;'),
			to		: Ext.eu.sm.MailBox.utils.formatRecipient(that.record.get('to'		),'<li>','</li>','&nbsp;'),
			cc		: Ext.eu.sm.MailBox.utils.formatRecipient(that.record.get('cc'		),'<li>','</li>','&nbsp;'),
		});

		Ext.getCmp(that.headerPanelId).el.select('ul.mailview-recipients>li').each(function(element){
			element.addListener("contextmenu",function(e){
				that.mailboxContainer.recipientContextMenu(e.target.textContent).show(e.target);
				e.stopEvent();
			});
		});

		Ext.Ajax.request({
			url		: 'proxy.php',
			params	: {
				exw_action		: 'local.mailboxImap.getMessageContent',
				account			: that.record.get('account'),
				folder			: that.record.get('folder'),
				message_no		: that.record.get('uid'),
			},
			success	: function(data){
				that.loading = false;
				that.fullRecord	= JSON.parse(data.responseText);
				var bodyHtml = that.fullRecord.body;
				contentPanel.getFrameBody().innerHTML=bodyHtml;
				if(that.fullRecord.hasInlineComponents){
					var but = Ext.getCmp(that.displayInlineComponentsId);
					if(but.pressed){
						that.displayInlineComponentsFunc();
					}else{
						but.show();
					}
				}
				if(that.fullRecord.type=='calendar'){
					//var sourceResult = ICAL.parse(that.fullRecord.body);
					//console.log(sourceResult);
					//sourceResult.toSource()
					Ext.getCmp(that.contentId).getFrameBody().innerHTML=that.JSONsyntaxHighlight(that.fullRecord.body);
				}

				that.partStore.removeAll();
				var attachmentPanel = Ext.getCmp(that.attachmentPanelId);
				var nb = 0;
				if(that.fullRecord.attachments){
					for(k in that.fullRecord.attachments){
						if(parseInt(k)==k){
							that.partStore.addSorted(new that.partStore.recordType(Ext.apply(that.fullRecord.attachments[k],{
								account		: that.record.get('account'),
								folder		: that.record.get('folder'),
								message_no	: that.record.get('uid'),
								hsize		: Ext.eu.sm.MailBox.utils.humanFileSize(that.fullRecord.attachments[k].size),
							})));
							nb++;
						}
					}
					attachmentPanel.setHeight(attachmentPanel.minHeight);
					attachmentPanel.show();
				}else{
					attachmentPanel.hide();
				}

				new Ext.util.DelayedTask(function(){
					that.doLayout();
					if(contentPanel && contentPanel.body){
						contentPanel.body.unmask();
					}
				}, this).delay(100);
				//}
			},
			failure	: function(){
				alert(Ext.eu.sm.MailBox.i18n._('failure on retreiving mail'));
			}
		});
	}
});
Ext.reg('mailbox.mailview',Ext.eu.sm.MailBox.MailView);
