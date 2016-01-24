Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.MailView = Ext.extend(Ext.eu.sm.MailBox.MailPanel, {
	record					: null,
	folderTreeId			: null,
	displayInlineComponents	: true,

	updateRecord	: function (record){
		var that = this;
		that.record = record;
		Ext.getCmp(that.flagButtonId['seen']).toggle((that.record.get('seen')==1));
	},

	displayHeader		: function (datas){
		var that = this;
		var headerPanel		= Ext.getCmp(that.headerPanelId);

		headerPanel.tpl.overwrite(headerPanel.body, {
			subject	: datas.subject,
			date	: Ext.util.Format.dateRenderer(Ext.eu.sm.MailBox.i18n._('d/m/Y H:i:s'))(datas.date),
			from	: Ext.eu.sm.MailBox.utils.formatRecipient(datas.from,'<li>','</li>','&nbsp;'),
			to		: Ext.eu.sm.MailBox.utils.formatRecipient(datas.to	,'<li>','</li>','&nbsp;'),
			cc		: Ext.eu.sm.MailBox.utils.formatRecipient(datas.cc	,'<li>','</li>','&nbsp;')
		});

		Ext.getCmp(that.headerPanelId).el.select('ul.mailview-recipients>li').each(function(element){
			element.addListener("contextmenu",function(e){
				that.mailboxContainer.recipientContextMenu(e.target.textContent).show(e.target);
				e.stopEvent();
			});
		});
	},

	loadMail				: function (){
		var that = this;
		var contentPanel	= Ext.getCmp(that.contentId);

		contentPanel.body.mask();
		that.displayHeader({
			subject	: that.record.get('subject'	),
			date	: that.record.get('date'	),
			from	: that.record.get('from'	),
			to		: that.record.get('to'		),
			cc		: that.record.get('cc'		)
		});

		Ext.Ajax.request({
			url		: 'proxy.php',
			params	: {
				exw_action		: that.mailboxContainer.svcImapPrefixClass+'getMessageContent',
				account			: that.record.get('account'),
				folder			: that.record.get('folder'),
				message_no		: that.record.get('uid')
			},
			success	: function(data){
				that.loading = false;
				that.fullRecord	= JSON.parse(data.responseText);
				that.displayHeader({
					subject	: that.fullRecord.header.subject,
					date	: that.fullRecord.header.date	,
					from	: that.fullRecord.header.from	,
					to		: that.fullRecord.header.to		,
					cc		: that.fullRecord.header.cc
				});

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
				var contentAttachment = Ext.getCmp(that.contentAttachmentId);
				contentAttachment.inlineStore.removeAll();
				if(that.fullRecord.attachments && that.fullRecord.attachments.length>0){
					for(k in that.fullRecord.attachments){
						if(parseInt(k)==k){
							var attach = that.fullRecord.attachments[k]
							that.partStore.addSorted(new that.partStore.recordType(Ext.apply(attach,{
								account		: that.record.get('account'),
								folder		: that.record.get('folder'),
								message_no	: that.record.get('uid'),
								hsize		: Ext.eu.sm.MailBox.utils.humanFileSize(attach.size)
							})));
							nb++;
							if(attach.hfilename!='all'){
								contentAttachment.addRecord({
									'idx'	: nb,
									'url'	: attach.attachUrlLink,
									'suburl': undefined,
									'name'	: attach.hfilename
								});
							}
						}
					}
					attachmentPanel.setHeight(attachmentPanel.minHeight);
					attachmentPanel.show();
				}else{
					Ext.getCmp(that.attachmentViewerButtonId).setDisabled(true);
					attachmentPanel.hide();
				}

				that.fireEvent('postLoadMessageContent',that);

				new Ext.util.DelayedTask(function(){
					that.doLayout();
					if(contentPanel && contentPanel.body){
						contentPanel.body.unmask();
					}
				}, this).delay(100);
			},
			failure	: function(){
				alert(Ext.eu.sm.MailBox.i18n._('failure on retreiving mail'));
			}
		});
	},

	initComponent			: function(){
		var that = this;
		that.contentId					= Ext.id();
		that.contentCardId				= Ext.id();
		that.contentAttachmentId		= Ext.id();
		that.attachmentPanelId			= Ext.id();
		that.headerPanelId				= Ext.id();
		that.displayInlineComponentsId	= Ext.id();
		that.attachmentViewerButtonId	= Ext.id();
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
				'name'
			],
			data	: [],
			sortInfo: {field: 'email', direction: 'ASC'},
			proxy	: new Ext.data.MemoryProxy([])
		});

		that.viewTBar = [{
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
							that.mailboxContainer.mailMove({
								data		: [that.record],
								mode		: 'move',
								account		: that.record.get('account'),
								fromFolder	: that.record.get('folder'),
								folderId	: item.id,
								folderiId	: item.iId,
								messages_no	: that.record.get('id')
							});
						}
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
							'selected'	: function(item){
								that.mailboxContainer.mailMove({
									data		: [that.record],
									mode		: 'move',
									account		: that.record.get('account'),
									fromFolder	: that.record.get('folder'),
									folderId	: item.data.id,
									folderiId	: item.data.iId,
									messages_no	: that.record.get('id')
								});
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
		},{
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
			xtype		: 'button',
			text		: Ext.eu.sm.MailBox.i18n._('attachment Viewer'),
			id			: that.attachmentViewerButtonId,
			enableToggle: true,
			pressed		: false,
			hidden		: false,
			handler		: function (cmp){
				Ext.getCmp(that.contentCardId).getLayout().setActiveItem(cmp.pressed?1:0);//that.contentAttachmentId:that.contentId)
				//Ext.getCmp(that.contentCardId).doLayout();
				//that.doLayout();
			}
		},{
			text		: Ext.eu.sm.MailBox.i18n._('Header'),
			iconCls		: 'mail_open_alt',
			handler		: function(){
				if(!that.loading){
					var panelId=Ext.id();
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
						items		: {
							xtype		: 'panel',
							autoScroll	: true,
							id			: panelId,
							html		: ''
						}
					}).show(null,function(){
						var xtpl = new Ext.XTemplate(
							'<ul>',
								'<tpl for="rawheader">',
									'<li>',
									'<b>[{k}]</b>',
										'<ul>',
											'<tpl for="v">',
												'<li>**<code>{[this.htmlEscape(values)]}</code></li>',
											'</tpl>',
										'</ul>',
									'</li>',
								'</tpl>',
							'</ul>',{
							htmlEscape : function(str){
								return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g,"<br>");
							}
						});
						xtpl.overwrite(Ext.getCmp(panelId).body, that.fullRecord);
					});
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
						exw_action		: that.mailboxContainer.svcImapPrefixClass+'getMessageSource',
						account			: that.record.get('account'),
						folder			: that.record.get('folder'),
						message_no		: that.record.get('uid')
					},
					success	: function(data){
						var val = JSON.parse(data.responseText);
						Ext.getCmp(areaId).setValue(val.source);
					}
				});
			}
		}];

		that.fireEvent('postInit',that);

		Ext.apply(that,{
			layout	: 'border',
			items	: [{
				region		: 'north',
				baseCls		: 'x-plain',
				split		: true,
				minHeight	: 70,
				maxHeight	: 300,
				height		: 120,
				labelWidth	: 70,
				id			: that.headerPanelId,
				frame		: true,
				bodyStyle	: 'padding:2px 2px 2px 2px;',
				tbar		: that.viewTBar,
				xtype		: 'panel',
				autoScroll	: true,
				tpl			: new Ext.XTemplate(
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
				border		: false,
				items		: [{
					layout			: 'card',
					region			: 'center',
					border			: false,
					id				: that.contentCardId,
					activeItem		: 0,
					items			: [{
						layout			: 'border',
						border			: false,
						items			: [{
							region			: 'center',
							xtype			: 'iframepanel',
							id				: that.contentId,
							autoCreate		: true,
							autoScroll		: true,
							//loadMask		: true,
							border			: false,
							html			: '<div style="text-align: center;padding-top:20px;">Loading <h2>'+that.record.get('subject')+'</h2></div>',
							listeners		: {
								'documentloaded'		: function(){
									if(!that.loading){
										Ext.getCmp(that.contentId).body.unmask();
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
					},{
						id				: that.contentAttachmentId,
						xtype			: 'inlineviewer',
						selectorWidth	: 200,
						thumbWidth		: 60,
						thumbHeight		: 90
					}]
				}]
			}]
		});
		Ext.eu.sm.MailBox.MailView.superclass.initComponent.call(this);
	},

	displayInlineComponentsFunc : function(){
		var that = this;
		var contentPanel = Ext.getCmp(that.contentId);
		contentPanel.getFrameBody().innerHTML=contentPanel.getFrameBody().innerHTML.replace(/src\=\"\" data\-imgsafesrc\=/g,' src=');
	}
});
Ext.reg('mailbox.mailview',Ext.eu.sm.MailBox.MailView);
