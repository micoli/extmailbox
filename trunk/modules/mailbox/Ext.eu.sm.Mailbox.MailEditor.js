Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.MailEditor= Ext.extend(Ext.Panel, {
	fullRecord		: null,
	loading			: true,
	mailboxContainer: null,

	stripAndTrim	: function(str){
		var tmp = document.createElement("DIV");
		tmp.innerHTML = str;
		str = tmp.textContent==''?'':(tmp.textContent || tmp.innerText);
		str = ''+str;
		str = str.replace(/^\s+/g,'').replace(/\s+$/g,'');
		return str;
	},

	sendEmailFinal	: function(objToSend){
		var that = this;
		that.el.mask('sending','x-mask-loading');
		console.log('ok to send',objToSend);
		that.el.unmask();
	},

	sendEmail		: function(){
		var that = this;
		//console.log('send',arguments,Ext.getCmp(that.uppanelid).store.data.items,Ext.getCmp(that.uppanelid))
		var form		= Ext.getCmp(that.formId).getForm();
		var uploaderCmp	= Ext.getCmp(that.uppanelid);
		var uploadsOk	= true;
		var warnings	= [];
		var errors		= [];

		var objToSend={
			ref			: '',
			subject		: form.findField('subject'	).getValue(),
			from		: form.findField('from'		).getValue(),
			to			: form.findField('to'		).getValue(),
			cc			: form.findField('cc'		).getValue(),
			bcc			: form.findField('bcc'		).getValue(),
			body		: Ext.getCmp(that.contentId	).getRawValue(),
			attachments	: []
		}

		uploaderCmp.store.data.each(function(v,k){
			objToSend.attachments.push(v.get('fileName'));
			if(v.get('state')!='done'){
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

		var sendNow = function(result){
			if(result=='yes'){
				if(uploadsOk){
					that.sendEmailFinal();
				}else{
					that.el.mask('sending','x-mask-loading');
					uploaderCmp.removeListener	('allfinished',that.sendEmailFinal);
					uploaderCmp.addListener		('allfinished',that.sendEmailFinal);
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
				{name:'personal'	, type:'string'},
			],
			url			:'proxy.php',
			baseParams	: {
				exw_action		: that.mailboxContainer.svcImapPrefixClass+'searchContact'
			}
		});

		that.recipientTpl			= '<tpl for="."><div class="x-combo-list-item">{email}, <i>{personal}</i></div></tpl>';
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
		}

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
						that.sendEmail();
					}
				},{
					text		: Ext.eu.sm.MailBox.i18n._('Save as Draft'),
					iconCls		: 'mail_closed_alt_add',
					handler		: function(){
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
											Ext.getCmp(that.contentId).setValue(record.get('body'));
											Ext.getCmp(that.contentId).syncValue();
										}
										cmp.attachedCmp.destroy();
									},
									cancel	: function(selected){
										//console.log('cancel');
										cmp.attachedCmp.destroy();
									}
								}
							}]
						});
						cmp.attachedCmp.show();
					}
				},'->',{
					text		: Ext.eu.sm.MailBox.i18n._('Attach'),
					iconCls		: 'mail_attach',
					handler		: function(){
					}
				}],
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
						store			: that.mailboxContainer.accountStore,
						id				: that.accountComboId,
						anchor			: '-14',
						displayField	: 'email',
						valueField		: 'email',
						emptyText		: Ext.eu.sm.MailBox.i18n._('Select an account...'),
						mode			: 'local',
						triggerAction	: 'all',
						typeAhead		: true,
						forceSelection	: true,
						value			: that.fromEmail,
						selectOnFocus	: true,
						listeners		:{
							select			: function(combo,record,index){

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
						contextMenu		: that.recipientContextMenu
					},{
						xtype			: 'mailselect',
						name			: 'cc',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('Cc'),
						anchor			: '-30',
						addEmailTrigger	: true,
						value			: that.record.get('cc')?that.record.get('cc'):undefined,
						store			: that.recipientSearchStore,
						tpl				: that.recipientTpl,
						contextMenu		: that.recipientContextMenu
					},{
						xtype			: 'mailselect',
						name			: 'bcc',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('Bcc'),
						anchor			: '-30',
						addEmailTrigger	: true,
						value			: that.record.get('bcc')?that.record.get('bcc'):undefined,
						store			: that.recipientSearchStore,
						tpl				: that.recipientTpl,
						contextMenu		: that.recipientContextMenu
					}]
				},{
					xtype			: 'uploadpanel',
					region			: 'east',
					split			: true,
					width			: 250,
					buttonsAt		: 'tbar',
					id				: that.uppanelid,
					url				: 'proxy.php?exw_action='+that.mailboxContainer.svcSmtpPrefixClass+'uploadAttachment',
					path			: that.record.get('message_id'),
					maxFileSize		: 1048576,
					enableProgress	: true,
					//singleUpload	: true,
				}]
			},{
				region			: 'center',
				layout			: 'border',
				items			: [{
					region				: 'center',
					xtype				: 'htmleditor',
					id					: that.contentId,
					plugins				:[new Ext.ux.form.HtmlEditor.Table()],
					enableAlignments	: true,
					enableColors		: true,
					enableFont			: true,
					enableFontSize		: true,
					enableFormat		: true,
					enableLinks			: true,
					enableLists			: true,
					enableSourceEdit	: false,
					border				: false
				}]
			}]
		});
		Ext.eu.sm.MailBox.MailEditor.superclass.initComponent.call(this);
	}
});