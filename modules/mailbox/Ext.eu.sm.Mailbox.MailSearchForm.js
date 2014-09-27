Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.MailSearchForm = Ext.extend(Ext.Panel, {
	withSyncText	: true,
	query			: '',
	queryObj		: {},
	initComponent	: function(){
		var that = this;
		that.imapTextFieldId	= Ext.id();
		that.buttonSearchdId	= Ext.id();
		that.formId				= [Ext.id(),Ext.id(),Ext.id(),Ext.id()];

		that.generateImapQueryOn = true;
		that.storeQueryOn = true;

		that.syncText = function(val){
			Ext.getCmp(that.imapTextFieldId).setValue(val);
		};

		this.addEvents(
			'queryReset',
			'queryChanged',
			'search'
		);

		that.storeQuery = function(){
			if(that.storeQueryOn){
				that.searchStores.insert(0,[new that.searchStores.recordType({
					date		: Ext.util.Format.date(new Date(),'H:i:s d/m'),
					query		: that.query,
					queryObj	: Ext.apply({},that.queryObj)
				})]);
				that.searchStores.commitChanges();
			}
		}

		that.resetQuery = function(){
			that.query = '';
			that.queryObj = {};
			that.fireEvent('queryReset');
		};

		that.addQueryParam = function(field,tag,value){
			that.queryObj[field.imapTag]=value;
			if ((value || value=="") && field.getXType()!='checkbox' && field.getXType()!='tri-checkbox'){
				that.query		= that.query		+ tag +' "'+ (''+value).replace(/\"/g,"\\\"") +'" ';
			}else{
				that.query		= that.query		+ tag +' ';
			}
		};

		that.generateImapQuery = function(){
			that.resetQuery();
			that.items.each(function(form){
				form.items.each(function(field){
					switch(field.getXType()){
						case 'textfield':
							var value = field.getValue();
							if(value){
								that.addQueryParam(field,field.imapTag,value);
							}
						break
						case 'datefield':
							var value = field.getValue();
							if(value){
								that.addQueryParam(field,field.imapTag,Ext.util.Format.date(value,'d M Y'));
							}
						break
						case 'checkbox':
							var value = field.getValue();
							if(value){
								that.addQueryParam(field,field.imapTag,value);
							}
						break
						case 'tri-checkbox':
							var value = field.getValue();
							if(value=="true"){
								that.addQueryParam(field,field.imapTag,value);
							}
							if(value=="false"){
								that.addQueryParam(field,'UN' +field.imapTag,value);
							}
						break
					}
				});
			})
			console.log('queryChanged',that.query);
			that.fireEvent('queryChanged',that.query);
		};

		that.onImapFieldChange = function(cmp,e) {
			if(that.generateImapQueryOn){
				that.generateImapQuery();
			}
		};

		that.runQueryOneParam = function(tag,value){
			that.resetQuery();
			that.addQueryParam(tag,value);
			console.log('queryChanged',that.query);
			that.fireEvent('queryChanged',that.query);
			that.fireEvent('search',that.query);
		}

		that.generateImapQueryAndSearch = function (){
			that.generateImapQuery();
			that.storeQuery();
			that.fireEvent('search',that.query);
		};

		that.textChange = function(cmp,e){
			if(e.getKey()==13){
				that.generateImapQueryAndSearch();
			}
		};

		that.searchStores = new Ext.data.JsonStore({
			fields			: [
				'params',
				'text',
				'date'
			],
			proxy			: new Ext.data.MemoryProxy([])
		});

		that.resetForms = function(){
			for(var i=0;i<4;i++){
				Ext.getCmp(that.formId[i]).getForm().reset();
			}
		}

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
			bbar		: [{
				tpl				: 	'<tpl for=".">'+
										'<div class="x-combo-list-item search-combo-display">'+
											'<div class="search-combo-display-text">{query}</div>'+
											'<div class="search-combo-display-date">{date}</div>'+
										'</div>'+
									'</tpl>',
				xtype			: 'combo',
				width			: 100,
				listWidth		: 250,
				store			: that.searchStores,
				displayField	: 'date',
				valueField		: 'date',
				emptyText		: 'Previous search...',
				mode			: 'local',
				triggerAction	: 'all',
				typeAhead		: false,
				forceSelection	: true,
				selectOnFocus	: true,
				listeners		:{
					select			: function(combo,record,index){
						that.generateImapQueryOn=false;
						var queryObj=record.get('queryObj');
						for(var i=0;i<4;i++){
							Ext.getCmp(that.formId[i]).getForm().reset();
							for (var imapTag in queryObj) {
								if (queryObj.hasOwnProperty(imapTag)){
									Ext.getCmp(that.formId[i]).items.each(function(field,k){
										if(field.hasOwnProperty('imapTag') && field.imapTag==imapTag){
											var val = queryObj[imapTag];
											if(field.getXType()=='tri-checkbox'){
												if(val=="true" ) val=true;
												if(val=="false") val=false;
												field.setValue(val);

											}else{
												field.setValue(val);
											}
										}
									});
								}
							}
						}
						that.generateImapQueryOn=true;
						that.storeQueryOn=false;
						that.generateImapQueryAndSearch();
						that.storeQueryOn=true;
					}
				}
			},'->',{
				xtype		: 'button',
				text		: 'reset',
				handler		: function(){
					that.storeQueryOn=false;
					that.resetForms();
					that.generateImapQueryAndSearch();
					that.storeQueryOn=true;
				}
			},{
				xtype		: 'button',
				text		: 'search',
				id			: that.buttonSearchdId,
				handler		: that.generateImapQueryAndSearch
			}],
			defaults	:{
				xtype			: 'form',
				labelWidth		: 75,
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
			items		: [{
				title			: 'Subject/Body',
				id				: that.formId[0],
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
				id				: that.formId[1],
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
				id				: that.formId[2],
				items			: [{
					xtype			: 'datefield',
					format			: 'd M Y',
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
					format			: 'd M Y',
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
					format			: 'd M Y',
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
				id				: that.formId[3],
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