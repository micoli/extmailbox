Ext.onReady(function(){

	var that = this;
	that.accountComboId	= Ext.id();
	that.formId			= Ext.id();
	var emails = [{
		personal:"toto1",
		email	:"titi1@toto.com"
	},{
		personal:"toto2",
		email	:"titi2@toto.com"
	},{
		personal:"toto3",
		email	:"titi3@toto.com"
	}];

	that.accountStore = new Ext.data.JsonStore({
		fields			: [
			'account',
			'email'
		],
		root			: 'data',
		idProperty		: 'account',
		remoteSort		: true,
		autoLoad		: true,
		baseParams		: {
			'exw_action'	: 'local.MailboxImap.getAccounts'
		},
		proxy			: new Ext.data.HttpProxy({
			url				: 'proxy.php',
		}),
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
			'exw_action'	: 'local.MailboxImap.getTemplates'
		},
		proxy			: new Ext.data.HttpProxy({
			url				: 'proxy.php',
		}),
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
			exw_action		: 'local.MailboxImap.searchContact'
		}
	});

	var viewport = new Ext.Viewport({
		layout	: 'border',
		items	: [{
			region		: 'center',
			xtype		: 'form',
			labelWidth	: 100,
			frame		: true,
			tbar		:[{
				xtype		: 'button',
				text		: 'test template',
				handler		: function(){
					var cmp = this;
					cmp.attachedCmp = new Ext.eu.attachedWindow({
						resizeTriggerCmp: this,
						stickCmp		: this,
						width			: 450,
						height			: 350,
						layout			: 'fit',
						items			: [{
							xtype			: 'dataTemplateSelector',
							store			: that.templateStore,
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
										console.log('OK to move',record,index);
									}
									cmp.attachedCmp.destroy();
								},
								cancel	: function(selected){
									console.log('cancel');
									cmp.attachedCmp.destroy();
								}
							}
						}]
					});
					cmp.attachedCmp.show();
				}
			}],
			items		: [{
				fieldLabel		: 'From',
				xtype			: 'combo',
				name			: 'from',
				store			: that.accountStore,
				id				: that.accountComboId,
				anchor			: '-10',
				displayField	: 'email',
				valueField		: 'email',
				emptyText		: 'Select an account...',
				mode			: 'local',
				triggerAction	: 'all',
				typeAhead		: true,
				forceSelection	: true,
				selectOnFocus	: true,
			},{
				fieldLabel		: 'Subject',
				xtype			: 'textfield',
				text			: 'subject',
				value			: 'sujet',
				anchor			: '-10',
			},{
				fieldLabel				: 'To',
				xtype					: 'mailselect',
				name					: 'to',
				anchor					: '-30',
				value					: emails,
				store					: that.recipientSearchStore,
				addEmailTrigger			: true,
				tpl						:'<tpl for="."><div class="x-combo-list-item">{email}, <i>{personal}</i></div></tpl>',
			},{
				xtype			: 'mailselect',
				fieldLabel		: 'Cc',
				name			: 'cc',
				anchor			: '-30',
				value			: emails,
				store			: that.recipientSearchStore,
				tpl				:'<tpl for="."><div class="x-combo-list-item">{email}, <i>{personal}</i></div></tpl>',
			}]
		},{
			xtype	: 'panel',
			region	: 'east',
			split	: true,
			width	: 550,
			layout	: 'border',
			items : [{
				region		: 'north',
				xtype		: 'tabpanel',
				height		: 400,
				activeTab	: 0,
				items		: [{
					xtype		: 'panel',
					id			: 'test123',
					title		: 'aa1',
					frame		: true,
					layout		: 'form',
					maskDisabled:false,
					buttons		: [{
						text		:'test',
						handler		: function(){
							var win = new Ext.ModalWindow({
								modalContainer	: Ext.getCmp('test123'),
								title			: 'eeee',
								modalContainerBorder	: 20,
								items		: {
									html : 'test'
								},
							});
							win.show();
						}
					}],
					items		: [{
						fieldLabel		: 'Subject1',
						xtype			: 'textfield',
						text			: 'subject',
						value			: 'sujet',
						anchor			: '100%',
					}]
				},{
					xtype		: 'panel',
					title		: 'aa2',
					layout		: 'form',
					items		: [{
						fieldLabel		: 'Subject2',
						xtype			: 'textfield',
						text			: 'subject',
						value			: 'sujet',
						anchor			: '100%',
					}]
				}]
			},{
				html	: 'attachments',
				region	: 'center'
			}]

		}]
	});

	var win2 = new Ext.ModalWindow({
		modalContainer		: viewport,
		title				: 'test Inline Viewer',
		modalContainerBorder: 20,
		items				: {
			xtype 				: 'inlineviewer',
			data				: [{
				idx		: 0,
				name	: 'pdf 1',
				type	: 'pdf',
				url		: 'http://fc01.deviantart.net/fs70/f/2012/124/c/8/papercraft_charr_pdf_by_riot_inducer-d4yishn.pdf'
			},{
				idx		: 1,
				name	: 'img 1',
				type	: 'img',
				url		: 'http://fc05.deviantart.net/fs70/f/2011/189/7/d/arion_bike___4__by_johnstrieder-d3lep0b.jpg'
			},{
				idx		: 2,
				name	: 'img 2',
				type	: 'img',
				url		: 'http://th03.deviantart.net/fs70/PRE/i/2011/078/a/e/nfz_m3_sunrise_by_600v-d3bz3bc.jpg'
			},{
				idx		: 3,
				name	: 'img 3',
				type	: 'img',
				url		: 'http://th01.deviantart.net/fs70/PRE/i/2010/344/9/3/prjmoto_by_600v-d34ls06.jpg'
			}]
		},
	});
	win2.show();

});