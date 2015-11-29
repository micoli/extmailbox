Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.MailEditor= Ext.extend(Ext.Panel, {
	fullRecord		: null,
	loading			: true,
	mailboxContainer: null,
	priority		: 'medium',

	stripAndTrim	: function(str){
		var tmp = document.createElement("DIV");
		tmp.innerHTML = str;
		str = tmp.textContent==''?'':(tmp.textContent || tmp.innerText);
		str = ''+str;
		str = str.replace(/^\s+/g,'').replace(/\s+$/g,'');
		return str;
	},

	_sendEmail		: function(objToSend){
		var that = this;
		that.el.mask('Sending','x-mask-loading');
		objToSend.exw_action	= that.mailboxContainer.svcSmtpPrefixClass+'sendMail';
		//objToSend.account		= Ext.getCmp(that.accountComboId).getValue();
		objToSend.account		= that.mailboxContainer.account;
		objToSend.attachments	= JSON.stringify(objToSend.attachments);
		objToSend.to			= JSON.stringify(objToSend.to);
		objToSend.cc			= JSON.stringify(objToSend.cc);
		objToSend.bcc			= JSON.stringify(objToSend.bcc);
		Ext.Ajax.request({
			url		: 'proxy.php',
			method	: 'GET',
			params	: objToSend,
			success	: function(data){
				that.el.unmask();
				try{
					var result = JSON.parse(data.responseText);
					if(result.success){
						if(that.ownerCt && that.ownerCt.xtype=='tabpanel'){
							that.ownerCt.fireEvent('messagessent',that);
						}
					}else{
						alert(result.errors);
					}
				}catch(e){
					alert(e.message+' '+data.responseText);
				}
			},
			failure	: function(data){
				that.el.unmask();
				console.log(data);
				alert(data);
			}
		});
	},

	sendEmail		: function(isReal){
		var that = this;
		//console.log('send',arguments,Ext.getCmp(that.uppanelid).store.data.items,Ext.getCmp(that.uppanelid))
		var form		= Ext.getCmp(that.formId).getForm();
		var uploaderCmp	= Ext.getCmp(that.uppanelid);
		var uploadsOk	= true;
		var warnings	= [];
		var errors		= [];

		var objToSend={
			ref			: '',
			is_real		: isReal,
			message_id	: that.record.get('message_id'	),
			subject		: form.findField('subject'		).getValue(),
			from		: form.findField('from'			).getValue(),
			to			: form.findField('to'			).getValues(),
			cc			: form.findField('cc'			).getValues(),
			bcc			: form.findField('bcc'			).getValues(),
			body		: Ext.getCmp(that.contentId		).getRawValue(),
			priority	: that.priority,
			attachments	: []
		};

		uploaderCmp.store.data.each(function(v,k){
			objToSend.attachments.push(objToSend.message_id + '-' + v.get('fileName'));
			if(v.get('state')=='queued' || v.get('state')=='uploading'){
				uploadsOk=false;
			}
		});

		if(that.stripAndTrim(objToSend.to		)==''){
			errors.push(Ext.eu.sm.MailBox.i18n._('No recipient(s)'	));
		}

		if(that.stripAndTrim(objToSend.subject	)==''){
			warnings.push(Ext.eu.sm.MailBox.i18n._('Subject empty'	));
		}

		if(that.stripAndTrim(objToSend.body		)==''){
			warnings.push(Ext.eu.sm.MailBox.i18n._('Body empty'		));
		}

		if (errors.length){
			Ext.Msg.show({
				title	: Ext.eu.sm.MailBox.i18n._('Error'),
				msg		: '<div style="float:left;">'+
							'<ul><li>-&nbsp;<b>'+
							errors.join('</b></li><li>')+
							(warnings.length?'</b></li><li>-&nbsp;'+warnings.join('</li><li>-&nbsp;'):'')+
							'</li></ul>'+
							'</div>',
				buttons	: Ext.Msg.OK,
				width	: 300,
				animEl	: that.el,
				icon	: Ext.MessageBox.ERROR
			});
			return false;
		}

		var _do = function(result){
			that._sendEmail(objToSend);
		}

		var sendNow = function(result){
			if(result=='yes'){
				if(uploadsOk){
					_do();
				}else{
					that.el.mask('Uploading attachments and Sending','x-mask-loading');
					uploaderCmp.removeListener	('allfinished',_do);
					uploaderCmp.addListener		('allfinished',_do);
					uploaderCmp.uploader.upload();
				}
			}
		}

		if (warnings.length){
			Ext.Msg.show({
				title	: Ext.eu.sm.MailBox.i18n._('Warning'),
				msg		: '<div style="float:left;">'+
							'<ul><li>-&nbsp;'+warnings.join('</li><li>-&nbsp;')+'</li></ul>'+
							Ext.eu.sm.MailBox.i18n._('Send anyway ?')+
							'</div>',
				buttons	: Ext.Msg.YESNO,
				width	: 300,
				fn		: sendNow,
				animEl	: that.el,
				icon	: Ext.MessageBox.WARNING
			});
		}else{
			sendNow('yes');
		}
	},

	initComponent	: function(){
		var that = this;

		that.contentId			= Ext.id();
		that.formId				= Ext.id();
		that.attachmentPanelId	= Ext.id();
		that.headerPanelId		= Ext.id();
		that.accountComboId		= Ext.id();
		that.uppanelid			= Ext.id();
		that.buttonMailSaveId	= Ext.id();

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

		that.recipientSearchStore = new Ext.data.JsonStore({
			id				:'email',
			root			:'data',
			totalProperty	:'totalCount',
			fields:[
				{name:'email'		, type:'string'},
				{name:'name'		, type:'string'},
			],
			url			:'proxy.php',
			baseParams	: {
				exw_action	: that.mailboxContainer.svcImapPrefixClass+'searchContact',
				account		: that.mailboxContainer.account
			}
		});
		that.identitiesStore = new Ext.data.JsonStore({
			id		: 'id'		,
			fields	: [
				'id'			,
				'default'		,
				'account'		,
				'email'			,
				'fromName'		,
				'fromEmail'		,
				'saveToSent'	,
				'sentFolder'	,
				'signature'		,
				'replySignature',
			],
			proxy	: new Ext.data.MemoryProxy([])
		});

		that.currentIdentity=null;
		that.fromEmailId=-1;
		var accountIdx = that.mailboxContainer.accountStore.find('account',that.mailboxContainer.account);
		Ext.each(that.mailboxContainer.accountStore.getAt(accountIdx).get('identities'),function(item,k){
			item.id=k;
			var rec = new that.identitiesStore.recordType(item);
			that.identitiesStore.add(rec);
			if(item['default']){
				that.currentIdentity=rec;
				that.fromEmailId=k;
			}
		});

		that.getCurrentSignature = function (){
			return that.currentIdentity.get('signature');
		};

		that.recipientTpl			= '<tpl for="."><div class="x-combo-list-item">{email}, <i>{name}</i></div></tpl>';
		that.recipientContextMenu	= function(value){
			return new Ext.menu.Menu({
				items			: [{
					text			: Ext.eu.sm.MailBox.i18n._('Create mail to : ')+value,
					iconCls			: 'edit',
					handler			: function(){
						console.log(value);
					}
				}]
			});
		};
		that.mailChange = new Ext.eu.sm.countdown({
			nbCycle		: 10,
			listeners	: {
				tick	: function(nb){
					var button = Ext.getCmp(that.buttonMailSaveId);
					button.setText(button.initialConfig.originalText+((nb>0)?('..'+that.mailChange.nb):''));
					if(nb==0){
						button.handler();
					}
				}
			}
		});

		that.ensureContentPlugin = new Ext.ux.form.HtmlEditor.EnsureContent();

		Ext.apply(that,{
			layout	: 'border',
			items	: [{
				region		: 'north',
				layout		: 'border',
				height		: 130,
				tbar		: [{
					text		: Ext.eu.sm.MailBox.i18n._('Send'),
					iconCls		: 'mail_closed_alt',
					scope		: that,
					handler		: function(){
						that.sendEmail(true);
					}
				},{
					text		: Ext.eu.sm.MailBox.i18n._('Save as Draft'),
					originalText: Ext.eu.sm.MailBox.i18n._('Save as Draft'),
					id			: that.buttonMailSaveId,
					iconCls		: 'mail_closed_alt_add',
					handler		: function(){
						that.mailChange.reset();
						that.sendEmail(false)
					}
				},'-',{
					xtype		: 'button',
					text		: Ext.eu.sm.MailBox.i18n._('Template'),
					handler		: function(){
						var cmp = this;
						cmp.attachedCmp = new Ext.eu.attachedWindow({
							resizeTriggerCmp: this,
							stickCmp		: this,
							width			: 450,
							height			: 200,
							layout			: 'fit',
							items			: [{
								xtype			: 'dataTemplateSelector',
								store			: that.mailboxContainer.templateStore,
								itemSelector	: 'div.template-combo-display-wrap',
								cls				: 'template-combo-display',
								emptyText		: 'No templates to display',
								thumbTpl		: new Ext.XTemplate(
													'<tpl for=".">'+
														'<div class="template-combo-display-wrap">'+
															'<div class="name">{name}</div>'+
															'<div class="body">{body}</div>'+
														'</div>'+
													'</tpl>'+
													'<div class="x-clear"></div>'),
								detailTpl		: new Ext.XTemplate(
													'<tpl for=".">'+
														'<div class="template-combo-display-detail">'+
															'<div class="name">{name}</div>'+
															'<div class="body">{body}</div>'+
														'</div>'+
													'</tpl>'+
													'<div class="x-clear"></div>'),
								listeners		: {
									selected	: function(record,index){
										if(record){
											console.log('body',record.get('body'))
											that.ensureContentPlugin.check(true,{
												'.editor-content' : record.get('body')
											});
											Ext.getCmp(that.contentId).syncValue();
											that.mailChange.handler.createDelegate(cmp);
										}
										cmp.attachedCmp.destroy();
									},
									cancel	: function(selected){
										cmp.attachedCmp.destroy();
									}
								}
							}]
						});
						cmp.attachedCmp.show();
					}
				},'-',{
					xtype		: 'button',
					toggleGroup	: 'priority',
					iconCls		: 'mail_priority_low',
					pressed		: false,
					handler		: function(){
						that.priority = 'low';
						that.mailChange.handler.createDelegate(this);
					}
				},{
					xtype		: 'button',
					toggleGroup	: 'priority',
					iconCls		: 'mail_priority_medium',
					pressed		: true,
					handler		: function(){
						that.priority = 'medium';
						that.mailChange.handler.createDelegate(this);
					}
				},{
					xtype		: 'button',
					toggleGroup	: 'priority',
					iconCls		: 'mail_priority_high',
					pressed		: false,
					handler		: function(){
						that.priority = 'high';
						that.mailChange.handler.createDelegate(this);
					}
				},'-'],
				items		:[{
					region		: 'center',
					xtype		: 'form',
					labelWidth	: 80,
					split		: true,
					id			: that.formId,
					frame		: true,
					autoScroll	: true,
					bodyStyle	: 'padding:5px 5px 5px;',
					items		: [{
						xtype			: 'combo',
						name			: 'from',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('From'),
						store			: that.identitiesStore,
						id				: that.accountComboId,
						value			: that.fromEmailId,
						anchor			: '-14',
						displayField	: 'fromEmail',
						valueField		: 'id',
						tpl				: '<tpl for="."><div class="x-combo-list-item">{fromEmail} <i>"{fromName}"</i>, {account}<hr>{signature} </div></tpl>',
						emptyText		: Ext.eu.sm.MailBox.i18n._('Select an account...'),
						mode			: 'local',
						triggerAction	: 'all',
						typeAhead		: true,
						forceSelection	: true,
						selectOnFocus	: true,
						listeners		:{
							select			: function(combo,record,index){
								that.currentIdentity = record
								that.ensureContentPlugin.check(true);
								Ext.getCmp(that.contentId).syncValue();
								that.mailChange.handler.createDelegate(combo);
							}
						}
					},{
						xtype			: 'textfield',
						name			: 'subject',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('Subject'),
						value			: that.record.get('subject'),
						anchor			: '-14',
						enableKeyEvents	: true,
						listeners		: {
							'keyup'		: function(cmp,e) {
								var subject = cmp.getValue();
								that.setTitle(subject.length>30?subject.substr(0,28)+"...":subject);
								that.mailChange.handler.createDelegate(cmp);
							}
						}
					},{
						xtype			: 'mailselect',
						name			: 'to',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('To'),
						anchor			: '-30',
						addEmailTrigger	: true,
						value			: that.record.get('to')?that.record.get('to'):undefined,
						store			: that.recipientSearchStore,
						tpl				: that.recipientTpl,
						contextMenu		: that.recipientContextMenu,
						listeners		: {
							selected		: that.mailChange.handler.createDelegate
						}
					},{
						xtype			: 'mailselect',
						name			: 'cc',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('Cc'),
						anchor			: '-30',
						addEmailTrigger	: true,
						value			: that.record.get('cc')?that.record.get('cc'):undefined,
						store			: that.recipientSearchStore,
						tpl				: that.recipientTpl,
						contextMenu		: that.recipientContextMenu,
						listeners		: {
							selected		: that.mailChange.handler.createDelegate
						}
					},{
						xtype			: 'mailselect',
						name			: 'bcc',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('Bcc'),
						anchor			: '-30',
						addEmailTrigger	: true,
						value			: that.record.get('bcc')?that.record.get('bcc'):undefined,
						store			: that.recipientSearchStore,
						tpl				: that.recipientTpl,
						contextMenu		: that.recipientContextMenu,
						listeners		: {
							selected		: that.mailChange.handler.createDelegate
						}
					}]
				},{
					xtype			: 'uploadpanel',
					id				: that.uppanelid,
					region			: 'east',
					buttonsAt		: 'tbar',
					split			: true,
					enableProgress	: false,
					width			: 250,
					maxFileSize		: 1048576,
					url				: 'proxy.php?exw_action='+that.mailboxContainer.svcSmtpPrefixClass+'uploadAttachment',
					path			: that.record.get('message_id'),
					baseParams		: {
						account			: that.mailboxContainer.account
					},
					processSuccess	: function(options, response, o) {
						var record = false;
						var handler = function(record){
							record.set('state', 'done');
							record.set('error', '');
							record.commit();
						}

						console.log(options,o);

						if(this.singleUpload) {
							this.store.each(handler);
						}else {
							handler(options.record);
						}
						this.deleteForm(options.form, record);
					},
					listeners		: {
						fileadd			: function (uploader, store, record){
							console.log(uploader, store, record);
							uploader.uploader.upload();
							that.mailChange.handler.createDelegate(uploader);
						}
					}
				}]
			},{
				region			: 'center',
				layout			: 'border',
				items			: [{
					region				: 'center',
					xtype				: 'htmleditor',
					id					: that.contentId,
					plugins				:[new Ext.ux.form.HtmlEditor.Table(),that.ensureContentPlugin],
					enableAlignments	: true,
					enableColors		: true,
					enableFont			: true,
					enableFontSize		: true,
					enableFormat		: true,
					enableLinks			: true,
					enableLists			: true,
					enableSourceEdit	: false,
					border				: false,
					value				: '<div "class="editor-content"><br><br></div><div class="editor-footer"></div>',
					ensureContentCfg	: {
						'.editor-footer'	: that.getCurrentSignature
					},
					listeners		: {
						contentChange	: that.mailChange.handler.createDelegate(that.mailChange)
					}
				}]
			}]
		});
		Ext.eu.sm.MailBox.MailEditor.superclass.initComponent.call(this);
	}
});