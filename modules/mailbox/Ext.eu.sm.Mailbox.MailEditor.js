Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.MailEditor= Ext.extend(Ext.Panel, {
	fullRecord		: null,
	loading			: true,
	mailboxContainer: null,
	initComponent	: function(){
		var that = this;

		that.contentId			= Ext.id();
		that.formId				= Ext.id();
		that.attachmentPanelId	= Ext.id();
		that.headerPanelId		= Ext.id();
		that.accountComboId		= Ext.id();
		that.recipientGridId	= Ext.id();

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
				exw_action		: that.mailboxContainer.svcPrefixClass+'searchContact'
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

		var currentAccount		= Ext.getCmp(that.mailboxContainer.accountComboId).getValue();
		var currentAccountIdx	= that.mailboxContainer.accountStore.find('account',currentAccount);

		Ext.apply(that,{
			layout	: 'border',
			items	: [{
				region		: 'north',
				layout		: 'border',
				height		: 130,
				tbar		: [{
					text		: Ext.eu.sm.MailBox.i18n._('Send'),
					iconCls		: 'mail_closed_alt',
					handler		: function(){
					}
				},{
					text		: Ext.eu.sm.MailBox.i18n._('Save as Draft'),
					iconCls		: 'mail_closed_alt_add',
					handler		: function(){
					}
				},'-','->',{
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
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('From'),
						name			: 'from',
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
						value			: that.mailboxContainer.accountStore.getAt(currentAccountIdx).get('email'),
						selectOnFocus	: true,
						listeners		:{
							select			: function(combo,record,index){

							}
						}
					},{
						xtype			: 'textfield',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('Subject'),
						value			: that.record.get('subject'),
						anchor			: '-14',
					},{
						xtype			: 'mailselect',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('To'),
						name			: 'to',
						anchor			: '-10',
						value			: that.record.get('to')?that.record.get('to'):undefined,
						store			: that.recipientSearchStore,
						tpl				: that.recipientTpl,
						contextMenu		: that.recipientContextMenu
					},{
						xtype			: 'mailselect',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('Cc'),
						name			: 'cc',
						anchor			: '-10',
						value			: that.record.get('cc')?that.record.get('cc'):undefined,
						store			: that.recipientSearchStore,
						tpl				: that.recipientTpl,
						contextMenu		: that.recipientContextMenu
					},{
						xtype			: 'mailselect',
						fieldLabel		: Ext.eu.sm.MailBox.i18n._('Bcc'),
						name			: 'bcc',
						anchor			: '-10',
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
					id				: 'uppanel',
					url				: 'filetree.php',
					path			: 'root',
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