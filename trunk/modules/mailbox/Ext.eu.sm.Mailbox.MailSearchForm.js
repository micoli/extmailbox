Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.MailSearchForm = Ext.extend(Ext.Panel, {
	withSyncText	: true,
	query			: '',
	initComponent	: function(){
		var that = this;
		that.imapTextFieldId	= Ext.id();
		that.buttonSearchdId	= Ext.id();

		that.syncText = function(val){
			Ext.getCmp(that.imapTextFieldId).setValue(val);
		};

		this.addEvents(
			'queryReset',
			'queryChanged',
			'search'
		);

		that.resetQuery = function(){
			that.query = '';
			that.fireEvent('queryReset');
		};

		that.addQueryParam = function(tag,value){
			if (value){
				that.query = that.query + tag +' "'+ (''+value).replace(/\"/g,"\\\"") +'" ';
			}else{
				that.query = that.query + tag +' ';
			}
		};

		that.runQueryOneParam = function(tag,value){
			that.resetQuery();
			that.addQueryParam(tag,value);
			console.log('queryChanged',that.query);
			that.fireEvent('queryChanged',that.query);
			that.fireEvent('search',that.query);
		}

		that.generateImapQuery = function(){
			that.resetQuery
			that.query = '';
			that.items.each(function(form){
				form.items.each(function(field){
					switch(field.getXType()){
						case 'textfield':
							var value = field.getValue();
							if(value){
								that.addQueryParam(field.imapTag,value);
							}
						break
						case 'datefield':
							var value = field.getValue();
							if(value){
								that.addQueryParam(field.imapTag,Ext.util.Format.date(value,'d M Y'));
							}
						break
						case 'checkbox':
							var value = field.getValue();
							if(value){
								that.addQueryParam(field.imapTag);
							}
						break
						case 'tri-checkbox':
							var value = field.getValue();
							if(value=="true"){
								that.addQueryParam(field.imapTag);
							}
							if(value=="false"){
								that.addQueryParam('UN' +field.imapTag);
							}
						break
					}
				});
			})
			console.log('queryChanged',that.query);
			that.fireEvent('queryChanged',that.query);
		};

		that.onImapFieldChange = function(cmp,e) {
			that.generateImapQuery();
		};

		that.generateImapQueryAndSearch = function (){
			that.generateImapQuery();
			that.fireEvent('search',that.query);
		};

		that.textChange = function(cmp,e){
			if(e.getKey()==13){
				that.generateImapQueryAndSearch();
			}
		};

		Ext.apply(that,{
			layout		: 'accordion',
			//frame		: true,
			margins		:'0 0 0 5',
			bodyStyle	: 'none repeat scroll 0 0 transparent',
			border		: false,
			split		: true,
			layoutConfig: {
				titleCollapse	: false,
				animate			: false
			},
			defaults	:{
				xtype			: 'form',
				labelWidth		: 75, // label settings here cascade unless overridden
				frame			: true,
				border			: false,
				collapsible		: true,
				collapsed		: true,
				autoScroll		: 'auto',
				defaultType		: 'textfield',
				defaults		: {
					anchor			: '-15'
				},
			},
			bbar		: ['->',{
				xtype		: 'button',
				text		: 'search',
				id			: that.buttonSearchdId,
				handler		: that.generateImapQueryAndSearch
			}],
			items		: [{
				title			: 'Subject/Body',
				collapsed		: false,
				items			: [{
					fieldLabel		: 'Text',
					name			: 'text',
					imapTag			: 'TEXT',
					tooltip			: 'match messages with text "string"',
					id				: that.imapTextFieldId,
					enableKeyEvents	: true,
					listeners		: {
						keyup			: function(cmp,e) {
							Ext.getCmp(that.syncTextId).setValue(cmp.getValue());
							that.textChange(cmp,e);
						},
						change			: that.onImapFieldChange
					}
				},{
					fieldLabel		: 'Subject',
					name			: 'subject',
					imapTag			: 'SUBJECT',
					tooltip			: 'match messages with "string" in the Subject:',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				},{
					fieldLabel		: 'Body',
					name			: 'body',
					imapTag			: 'BODY',
					tooltip			: 'match messages with "string" in the Body:',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				},{
					fieldLabel		: 'Keyword',
					name			: 'keyword',
					imapTag			: 'KEYWORD',
					tooltip			: 'match messages with "string" as a keyword',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				},{
					fieldLabel		: 'not Keyword',
					name			: 'unkeyword',
					imapTag			: 'UNKEYWORD',
					tooltip			: 'match messages that do not have the keyword "string"',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				}]
			},{
				title			: 'User Information',
				items			: [{
					fieldLabel		: 'To',
					name			: 'to',
					imapTag			: 'TO',
					tooltip			: 'match messages with "string" in the To:',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				},{
					fieldLabel		: 'From',
					name			: 'from',
					imapTag			: 'FROM',
					tooltip			: 'match messages with "string" in the From:',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				},{
					fieldLabel		: 'Cc',
					name			: 'cc',
					imapTag			: 'CC',
					tooltip			: 'match messages with "string" in the Cc:',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				},{
					fieldLabel		: 'Bcc',
					name			: 'bcc',
					imapTag			: 'BCC',
					tooltip			: 'match messages with "string" in the Bcc:',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				}]
			},{
				title			: 'Dates',
				items			: [{
					xtype			: 'datefield',
					fieldLabel		: 'On',
					name			: 'on',
					imapTag			: 'ON',
					tooltip			: 'match messages with Date: matching "date"',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				},{
					xtype			: 'datefield',
					fieldLabel		: 'Before',
					name			: 'before',
					imapTag			: 'BEFORE',
					tooltip			: 'match messages with Date: before "date"',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				},{
					xtype			: 'datefield',
					fieldLabel		: 'After',
					name			: 'since',
					imapTag			: 'SINCE',
					tooltip			: 'match messages with Date: after "date"',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						change			: that.onImapFieldChange
					}
				},{
					xtype			: 'checkbox',
					fieldLabel		: 'New',
					name			: 'new',
					imapTag			: 'NEW',
					tooltip			: 'match new messages',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						check			: that.onImapFieldChange
					}
				},{
					xtype			: 'checkbox',
					fieldLabel		: 'Old',
					name			: 'old',
					imapTag			: 'OLD',
					tooltip			: 'match old messages',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						check			: that.onImapFieldChange
					}
				},{
					xtype			: 'checkbox',
					fieldLabel		: 'Recent',
					name			: 'recent',
					imapTag			: 'RECENT',
					tooltip			: 'match messages with the \\RECENT flag set',
					enableKeyEvents	: true,
					listeners		: {
						keyup			: that.textChange,
						check			: that.onImapFieldChange
					}
				}]
			},{
				title			: 'Flags',
				items			: [{
					xtype			: 'tri-checkbox',
					fieldLabel		: 'Seen',
					name			: 'seen',
					imapTag			: 'SEEN',//UNSEEN
					tooltip			: 'match messages with Date: after "date"',
					setValue		: function(v) {
						Ext.ux.form.TriCheckbox.superclass.setValue.call(this, v);
						this.updateCheckCls();
						that.onImapFieldChange(this);
					}
				},{
					xtype			: 'tri-checkbox',
					fieldLabel		: 'Answered',
					name			: 'answered',
					imapTag			: 'ANSWERED',//UNANSWERED
					tooltip			: 'match messages with the \\ANSWERED flag set',
					setValue		: function(v) {
						Ext.ux.form.TriCheckbox.superclass.setValue.call(this, v);
						this.updateCheckCls();
						that.onImapFieldChange(this);
					}
				},{
					xtype			: 'tri-checkbox',
					fieldLabel		: 'Deleted',
					name			: 'deleted',
					imapTag			: 'DELETED', //UNDELETED
					tooltip			: 'match deleted messages',
					setValue		: function(v) {
						Ext.ux.form.TriCheckbox.superclass.setValue.call(this, v);
						this.updateCheckCls();
						that.onImapFieldChange(this);
					}
				},{
					xtype			: 'tri-checkbox',
					fieldLabel		: 'Flagged',
					name			: 'flagged',
					imapTag			: 'FLAGGED', //UNFLAGGED
					tooltip			: 'match messages with the \\FLAGGED (sometimes referred to as Important or Urgent) flag set',
					setValue		: function(v) {
						Ext.ux.form.TriCheckbox.superclass.setValue.call(this, v);
						this.updateCheckCls();
						that.onImapFieldChange(this);
					}
				}]
			}]
		});

		Ext.eu.sm.MailBox.MailSearchForm.superclass.initComponent.call(this);
	}
});

Ext.reg('mailbox.mailsearchform',Ext.eu.sm.MailBox.MailSearchForm)