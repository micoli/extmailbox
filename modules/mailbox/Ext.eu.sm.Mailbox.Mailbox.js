Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.Mailbox = Ext.extend(Ext.Panel, {
	layout				: 'border',
	mailLayout			: 'threePane',
	account				: '',
	svcImapClass		: 'MailboxImap',
	alertWrapper		: Ext.eu.sm.toaster,
	mailFields			: [
		'account',
		'folder',
		'subject',
		'from',
		'to',
		'cc',
		'bcc',
		{name:'date',type:'date', dateFormat: 'Y-m-d H:i:s'},
		'message_id',
		'references',
		'in_reply_to',
		'size',
		'uid',
		'msgno',
		'recent',
		'flagged',
		'flags',
		'answered',
		'deleted',
		'seen',
		'draft',
		'udate',
		'priority',
		'user_data_01',
		'user_data_02',
		'user_data_03',
		'user_data_04',
		'user_data_05',
		'user_data_06',
		'user_data_07',
		'user_data_08',
		'user_data_09',
		'user_data_10'
	],

	recipientContextMenu:function (mail){
		return new Ext.menu.Menu({
			items			: [{
				text			: 'Create mail to : '+mail,
				iconCls			: 'edit',
				handler			: function(){
					console.log(mail);
				}
			}]
		});
	},

	mailMove			: function (params){
		var that = this;
		var fromFolder = params.data[0].get('folder');
		var ids = [];
		Ext.each(params.data,function(v,k){
			ids.push(v.get('uid'));
		});
		Ext.Ajax.request({
			url		: 'proxy.php',
			params	: {
				exw_action	: that.svcImapPrefixClass+'mailCopyMove',
				mode		: params.mode,
				account		: params.account,
				toFolder	: params.folderId,
				toFolderId	: params.folderiId,
				fromFolder	: fromFolder,
				messages_no	: ids.sort().join(',')
			},
			success	: function(data){
				var result = JSON.parse(data.responseText);
				console.log(result);
				if(result.ok){
					Ext.getCmp(that.mailGridId).mailStore.load();
				}else{
					alert(result.errors)
				}
			},
			failure	: function(data){
				console.log(data);
				alert(Ext.eu.sm.MailBox.i18n._('failure on moving mail'));
			}
		});
	},

	mailChangeFlag		: function (record,flag,callback){
		var that = this;
		var newValue	= record.get(flag)==1?0:1;
		Ext.Ajax.request({
			url		: 'proxy.php',
			params	: {
				exw_action	: that.svcImapPrefixClass+'setMessageFlag',
				account		: record.get('account'),
				folder		: record.get('folder'),
				flag		: flag,
				value		: newValue,
				message_no	: record.get('uid')
			},
			success	: function(data){
				record.beginEdit();
				record.set(flag,newValue);
				record.commit();
				var tabPanel	= Ext.getCmp(that.mailPreviewsId);

				for (var i = tabPanel.items.items.length - 1; i > 0; i--){
					var tab = tabPanel.items.items[i];
					if(tab.updateRecord && tab.getXType() == "mailbox.mailview"){
						if(tab.record && record.get('account') == tab.record.get('account') && record.get('uid') == tab.message_no && record.get('folder') == tab.record.get('folder')){
							tab.updateRecord(record);
						}
					}
				}

				if(callback){
					callback(true);
				}
			},
			failure	: function(){
				if(callback){
					callback(false);
				}
				alert(Ext.eu.sm.MailBox.i18n._('failure on retreiving mail'));
			}
		});
	},

	viewMail			: function (record){
		var that		= this;
		var tabPanel	= Ext.getCmp(that.mailPreviewsId);
		var panel		= tabPanel.getItem(that.id+'-'+record.get('message_id'));
		var isNew		= false;
		if(!panel){
			isNew=true;
			var subject = record.get('subject');
			if(subject.length>30){
				subject = subject.substr(0,28)+"...";
			}
			panel = new Ext.eu.sm.MailBox.MailView(Ext.apply({
				id				: that.id+'-'+record.get('message_id'),
				title			: subject,
				iconCls			: 'mail_open_alt',
				closable		: true,
				record			: record,
				mailboxContainer: that,
				folderTreeId	: that.folderTreeId,
				message_no		: record.get('uid'),
				listeners		: that.viewMailConfig.customListeners ||{}
			},that.viewMailConfig));
			tabPanel.insert(1,panel);
		}
		var tabPanel = Ext.getCmp(that.mailPreviewsId);
		for (var i = tabPanel.items.items.length - 1; i > 0; i--){
			var tab = tabPanel.items.items[i];
			if(tab.id!=panel.id && Ext.fly(tabPanel.getTabEl(tab)).hasClass('x-tab-strip-closable')){
				tabPanel.remove(tab);
			}
		}
		tabPanel.setActiveTab(panel);
		if(isNew){
			panel.loadMail.call(panel);
		}
	},

	mailReply				: function(mailRecord){
		var that = this;
		var record = new (Ext.getCmp(that.mailGridId)).mailStore.recordType({
			subject		: 'RE:'+mailRecord.get('subject'),
			to			: mailRecord.get('from'),
			in_reply_to	: mailRecord.get('in_reply_to')
		});
		that.addMailEditor(record);
	},

	mailReplyToAll			: function(mailRecord){
		var that = this;
		var record = new (Ext.getCmp(that.mailGridId)).mailStore.recordType({
			subject		: 'RE:'+mailRecord.get('subject'),
			to			: mailRecord.get('from'),
			cc			: mailRecord.get('cc'),
			in_reply_to	: mailRecord.get('in_reply_to')
		});
		that.addMailEditor(record);
	},

	openDraft			: function(mailRecord){
		var that = this;
		var record = new (Ext.getCmp(that.mailGridId)).mailStore.recordType({
			subject		: mailRecord.get('subject'),
			to			: mailRecord.get('from'),
			cc			: mailRecord.get('cc'),
			bcc			: mailRecord.get('bcc')
		});
		that.addMailEditor(record);
	},

	mailForward				: function(mailRecord){
		var that = this;
		var record = new (Ext.getCmp(that.mailGridId)).mailStore.recordType({
			subject		: 'FWD:'+mailRecord.get('subject'),
			in_reply_to	: mailRecord.get('in_reply_to')
		});
		that.addMailEditor(record);
	},

	mailDelete				: function(mailRecord){
		alert('todo');
	},

	addMailEditor			: function(mailRecord){
		var that				= this;
		var tabPanel			= Ext.getCmp(that.mailPreviewsId);
		var currentAccount		= Ext.getCmp(that.accountComboId).getValue();
		var currentAccountIdx	= that.accountStore.find('account',currentAccount);

		mailRecord.set('message_id',"TMP-"+uuid.v4());

		panel = new Ext.eu.sm.MailBox.MailEditor({
			id					: that.id+'-new-'+mailRecord.get('message_id'),
			title				: mailRecord.get('subject')||'*',
			iconCls				: 'mail_inbox_edit',
			closable			: true,
			record				: mailRecord,
			mailboxContainer	: that,
			account				: that.account,
			imapFolder			: Ext.getCmp(that.mailGridId).mailStore.baseParams.folder,
			fromEmail			: that.accountStore.getAt(currentAccountIdx).get('email')
		});
		tabPanel.insert(1,panel);
		tabPanel.setActiveTab(panel);
	},

	initComponent		: function(){
		var that = this;
		that.svcImapPrefixClass = 'local.'+that.svcImapClass+'.';
		that.svcImapPrefixClass = 'local.'+that.svcImapClass+'.';
		that.svcSmtpPrefixClass = 'local.'+that.svcSmtpClass+'.';
		that.mailGridId			= Ext.id();
		that.mailPreviewsId		= Ext.id();
		that.accountComboId		= Ext.id();
		that.folderTreeId		= Ext.id();
		that.newEmailButtonId	= Ext.id();

		/*gblClient = new Ext.eu.sm.Stomp({
			//WebSocketClass	: ,
			url				: 'ws://network.home.micoli.org:61614/stomp/',
			//WebSocketClass	: SockJS,
			//url				: 'http://localhost:15674/stomp',
			login			: 'guest',
			password		: 'guest',
			debug			: console.log,
			subscriptions	: {
				"/topic/imapNotifierOnMessage/mail.home.micoli.org": {
					'_':function(d) {
						try{
							var result = JSON.parse(d.body);
							if(result.newEmails){
								var msgs = '';
								Ext.each(result.newEmails,function(v,k){
									console.log(v,k);
								})
								that.alertWrapper.msg(Ext.eu.sm.MailBox.i18n._('New email ('+result.newEmails.length+')'), msgs);
							}
						}catch(e){
							console.log('error',e,'->',d.body);
						}
					}
				}
			}
		}).connect(function(stomp){ // onconnect
			//gblClient.stompClient.heartbeat.incoming=5000;
			//gblClient.stompClient.heartbeat.outgoing=5000;
			stomp.send('/topic/', JSON.stringify({}));
		});*/

		that.accountStore = new Ext.data.JsonStore({
			fields			: [
				'account',
				'email',
				'identities'
			],
			root			: 'data',
			idProperty		: 'account',
			remoteSort		: true,
			autoLoad		: true,
			baseParams		: {
				'exw_action'	: that.svcImapPrefixClass+'getAccounts'
				//'exw_action'	: 'http://127.0.0.1:8080/mailbox/getAccounts'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php'
				//url				: 'http://127.0.0.1:8080/mailbox/getAccounts'
			}),
			listeners		:{
				load			: function(store,records){
					var combo = Ext.getCmp(that.accountComboId);
					that.account = records[0].get('account');
					combo.setValue(that.account);
					combo.fireEvent('select',combo,records[0],0);
				}
			}
		});

		that.templateStore = new Ext.data.JsonStore({
			fields			: [
				'name',
				'body'
			],
			root			: 'data',
			idProperty		: 'name',
			autoLoad		: true,
			baseParams		: {
				'exw_action'	: that.svcImapPrefixClass+'getTemplates'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php'
			})
		});

		that.isInSpecialFolder = function(type,record){
			switch (type.toLowerCase()){
				case 'draft' :
					return ((""+record.get('folder')).toLowerCase()=="drafts");
				break;
			}
			return false;
		};

		var folderConfig = {
			xtype			: 'mailbox.foldertree',
			id				: that.folderTreeId,
			split			: true,
			rootVisible		: false,
			autoScroll		: true,
			enableDrop		: true,
			border			: false,
			mailboxContainer: that,
			inboxNodeName	: 'Inbox',
			tbar			: ['Account: ',{
				xtype			: 'combo',
				width			: 100,
				store			: that.accountStore,
				id				: that.accountComboId,
				displayField	: 'email',
				valueField		: 'account',
				emptyText		: 'Select an account...',
				mode			: 'local',
				triggerAction	: 'all',
				typeAhead		: true,
				forceSelection	: true,
				selectOnFocus	: true,
				listeners		:{
					select			: function(combo,record,index){
						that.account = record.get('account');
						var tree = Ext.getCmp(that.folderTreeId);
						tree.account = that.account;
						tree.loader.load(tree.getRootNode());

						//open new mail editor
						//open new mail editor
						//open new mail editor
						Ext.getCmp(that.newEmailButtonId).handler();
						//open new mail editor
						//open new mail editor
						//open new mail editor
					}
				}
			},'->',{
				xtype	: 'button',
				text	: 'New',
				iconCls	: 'mail_closed_alt_add',
				id		: that.newEmailButtonId,
				handler	: function(){
					var record = new (Ext.getCmp(that.mailGridId)).mailStore.recordType({
						subject	: ''
					});
					that.addMailEditor(record);
				}
			}],
			listeners		: {
				click			: function(node){
					if(node.attributes.folderType=='folder'){
						var mailGrid = Ext.getCmp(that.mailGridId);
						mailGrid.load.call(mailGrid,that.account,node.id);
					}
				},
				beforedrop		: function(dropEvent){
					return true;
				},
				drop			: function(dropEvent){
					that.mailMove(dropEvent);
				}
			}
		};

		var gridConfig = Ext.apply({
			xtype			: 'mailbox.mailgrid',
			split			: true,
			id				: that.mailGridId,
			mailboxContainer: that,
			searchOpened	: false,
			listeners		: Ext.apply({
				recorddblclick	: function(record){
					if(that.isInSpecialFolder('draft',record)){
						that.openDraft(record);
					}
				},
				recordclick	: function(record){
					if(!that.isInSpecialFolder('draft',record)){
						that.viewMail(record);
					}
				},
				seenclick	: function(record){
					that.mailChangeFlag(record,'seen');
				}
			},that.gridConfig.customListeners||{})
		},that.gridConfig);

		var tabViewConfig = {
			xtype			: 'tabpanel',
			id				: that.mailPreviewsId,
			enableTabScroll	: true,
			split			: true,
			activeTab		: 0,
			defaults		: {
				autoScroll		: true
			},
			items			: [{
				staticTab		: true,
				title			: '[*]',
				border			: false,
				frame			: true,
				html			: '<H1></H1>'
			}],
			listeners		: {
				messagessent: function (tab){
					Ext.getCmp(that.mailPreviewsId).remove(tab);
				},
				contextmenu : function (tabPanel, panel, e){
					e.stopEvent();
					new Ext.menu.Menu({
						items			: [{
							text			: Ext.eu.sm.MailBox.i18n._('Close'),
							iconCls			: 'edit',
							handler			: function(){
								tabPanel.remove(panel);
							}
						},{
							text			: Ext.eu.sm.MailBox.i18n._('Close Others'),
							iconCls			: 'edit',
							handler			: function(){
								for (var i = tabPanel.items.items.length - 1; i > 0; i--){
									var tab = tabPanel.items.items[i];
									if(tab.id!=panel.id && Ext.fly(tabPanel.getTabEl(tab)).hasClass('x-tab-strip-closable')){
										tabPanel.remove(tab);
									}
								}
							}
						},{
							text			: Ext.eu.sm.MailBox.i18n._('Close All'),
							iconCls			: 'edit',
							handler			: function(){
								for (var i = tabPanel.items.items.length - 1; i > 0; i--){
									var tab = tabPanel.items.items[i];
									if(!Ext.fly(tabPanel.getTabEl(tab)).hasClass('x-tab-strip-closable')){
										tabPanel.remove(tab);
									}
								}
							}
						}]
					}).showAt(e.getXY());
				}
			}
		};

		Ext.apply(that,{
			layout	: 'border',
			items	: [Ext.apply(folderConfig,{
				width		: 190,
				region		: 'west',
				split		: true
			}),{
				layout	: 'border',
				region	: 'center',
				border	: false,
				items	: [Ext.apply(gridConfig,{
					region			: that.mailLayout=='threePane'?'west':'north',
					height			: 300,
					width			: 700
				}),Ext.apply(tabViewConfig,{
					region: 'center'
				})]
			}]
		});
		Ext.eu.sm.MailBox.Mailbox.superclass.initComponent.call(this);
	}
});
Ext.reg('mailbox.mailbox',Ext.eu.sm.MailBox.Mailbox);