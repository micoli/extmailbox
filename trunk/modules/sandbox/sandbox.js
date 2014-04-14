Ext.onReady(function(){
	var that = this;
	that.accountComboId					= Ext.id();
	that.formId							= Ext.id();
	that.renderedFieldId				= Ext.id();
	that.starField1Id					= Ext.id();
	that.starField2Id					= Ext.id();
	that.youtubePlayer1Id				= Ext.id();
	that.youtubePlayer2Id				= Ext.id();
	that.pivotEditorGridPanelId			= Ext.id();
	that.pivotGroupingEditorGridPanelId	= Ext.id();
	that.modalContainerTestId			= Ext.id();

	var emails = [{
		name	:"toto1",
		email	:"titi1@toto.com"
	},{
		name	:"toto2",
		email	:"titi2@toto.com"
	},{
		name	:"toto3",
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
		autoLoad		: false,
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
		autoLoad		: false,
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
			{name:'name'		, type:'string'},
		],
		url			:'proxy.php',
		baseParams	: {
			exw_action		: 'local.MailboxImap.searchContact'
		}
	});

	var windowInlineViewer = new Ext.ModalWindow({
		modalContainer		: viewport,
		title				: 'test Inline Viewer',
		modalContainerBorder: 20,
		items				: {
			xtype 				: 'inlineviewer',
			data				: [{
				idx		: 0,
				name	: 'pdf 1',
				type	: 'pdf',
				url		: "http://cdn.mozilla.net/pdfjs/tracemonkey.pdf",
					//"proxy.php?exw_action=local.mailboxImap.getMessageAttachment&account=micoli@ms&folder=SU5CT1g=&message_no=25&partno=2"
					//'http://fc01.deviantart.net/fs70/f/2012/124/c/8/papercraft_charr_pdf_by_riot_inducer-d4yishn.pdf'
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

	var windowInlinePDFViewer = new Ext.Window({
		modalContainer		: viewport,
		title				: 'test Inline PDF Viewer',
		maximizable			: true,
		resizable			: true,
		width				: 700,
		height				: 400,
		layout				: 'fit',
		items				: {
			xtype				: 'sm.pdf',
			url					: "http://cdn.mozilla.net/pdfjs/tracemonkey.pdf"
			//url				: "proxy.php?exw_action=local.mailboxImap.getMessageAttachment&account=micoli@ms&folder=SU5CT1g=&message_no=25&partno=2"
		},
	});

	var winOpenLayers = new Ext.Window({
		modalContainer		: viewport,
		title				: 'test openLayers Viewer',
		maximizable			: true,
		resizable			: true,
		width				: 700,
		height				: 400,
		layout				: 'fit',
		items				: [{
			xtype 				: 'sm.openLayers',
			mapConfig			: {
				urlMarker			: 'http://.../......png',
				lon					: 5.4474738,
				lat					: 43.5298424,
				layers				:[new OpenLayers.Layer.Vector("KML", {
					strategies	: [new OpenLayers.Strategy.Fixed()],
					protocol	: new OpenLayers.Protocol.HTTP({
						url			: "http://.../......kml",
						format		: new OpenLayers.Format.KML({
							extractStyles		: true,
							extractAttributes	: true,
							maxDepth			: 2,
							size				: 'medium'
						})
					}),
					eventListeners: {
						"loadend": function(layer) {
							console.log ('loadend',layer);
						}
					}
				})],
				vectors				: [{
					name		: 'over1',
					eventMode	: {
						type		: 'events'
					},
					items		: [{
						label:"TEST 10",coordinates	: {"lon":0.75985435635402,"lat":51.342083261486}
					},{
						label:"TEST 11",coordinates	: {"lon":0.75985435635402,"lat":51.342083261486}
					},{
						label:"TEST 20",coordinates	: {"lon":0.85985435635402,"lat":51.942083261486}
					},{
						label:"TEST 30",coordinates	: {"lon":0.65985435635402,"lat":51.042083261486}
					}]
				},{
					name		: 'over2',
					eventMode	: {
						type		: 'bubble'
					},
					items		: [{
						label:"TEST 10",coordinates	: {"lon":0.76985435635402,"lat":51.242083261486}
					},{
						label:"TEST 11",coordinates	: {"lon":0.76985435635402,"lat":51.242083261486}
					},{
						label:"TEST 20",coordinates	: {"lon":0.86985435635402,"lat":51.842083261486}
					},{
						label:"TEST 30",coordinates	: {"lon":0.65985435635402,"lat":51.042083261486}
					}]
				}]
					/*layers: [new OpenLayers.Layer.WMS(
				"Global Imagery",
				"http://maps.opengeo.org/geowebcache/service/wms",
				{layers: "bluemarble"}
				)],*/
			}
		}]
	});

	var winYoutube1Cfg = {
		modalContainer		: viewport,
		title				: 'test eu.sm.youtube',
		maximizable			: true,
		resizable			: true,
		width				: 700,
		height				: 400,
		layout				: 'fit',
		tbar				: [{
			xtype				: 'button',
			text				: 'load',
			handler				: function(){
				Ext.getCmp(that.youtubePlayer1Id).loadVideo('XhMN0wlITLk');
			}
		}],
		items				: [{
			xtype 				: 'eu.sm.youtube',
			youtubeId			: 'hgd4LpfJQxs',
			id					: that.youtubePlayer1Id
		}]
	};

	var winYoutube2Cfg = {
		modalContainer		: viewport,
		title				: 'test eu.sm.youtube',
		maximizable			: true,
		resizable			: true,
		width				: 700,
		height				: 400,
		layout				: 'fit',
		tbar				: [{
			xtype				: 'button',
			text				: 'load',
			handler				: function(){
				Ext.getCmp(that.youtubePlayer2Id).loadVideo('XhMN0wlITLk');
			}
		}],
		items				: [{
			xtype 				: 'eu.sm.youtube',
			youtubeId			: 'hgd4LpfJQxs',
			id					: that.youtubePlayer2Id
		}]
	};

	that.pivotStore = new Ext.data.JsonStore({
		fields			: [
			'key',
			'col1',
			'subkey',
			'value'
		],
		root			: 'data',
		idProperty		: 'name',
		autoLoad		: true,
		baseParams		: {
			'exw_action'	: 'local.sandbox.getPivotData'
		},
		proxy			: new Ext.data.HttpProxy({
			url				: 'proxy.php',
		}),
	});

	that.pivotGroupingStore = new Ext.data.GroupingStore({
		reader			: new Ext.data.JsonReader({
			root			: "data",
			id				: "name"
		},new Ext.data.Record.create([
			'key',
			'col1',
			'subkey',
			'value'
		])),
		baseParams		: {
			'exw_action'	: 'local.sandbox.getPivotData'
		},
		autoLoad		: true,
		proxy			: new Ext.data.HttpProxy({
			url				: 'proxy.php',
		}),
		groupField		: 'col1',
		sortInfo		: {
			field			: 'col1',
			direction		: 'ASC'
		}
	});

	var viewport = new Ext.Viewport({
		layout	: 'border',
		items	: [{
			xtype		: 'tabpanel',
			region		: 'center',
			activeItem	: 1,
			tbar	: [{
				text	: 'win YouTube 1',
				xtype	: 'button',
				handler : function(){
					if (typeof document.winYoutube1 == 'undefined'){
						document.winYoutube1 = new Ext.Window(winYoutube1Cfg);
					}
					document.winYoutube1.show();
				}
			},'-',{
				text	: 'win YouTube 2',
				xtype	: 'button',
				handler : function(){
					if (typeof document.winYoutube2 == 'undefined'){
						document.winYoutube2 = new Ext.Window(winYoutube2Cfg);
					}
					document.winYoutube2.show();
				}
			},'-',{
				text	: 'win OpenLayers',
				xtype	: 'button',
				handler : function(){
					winOpenLayers.show();
				}
			},'-',{
				text	: 'win InlineViewer',
				xtype	: 'button',
				handler : function(){
					windowInlineViewer.show();
				}
			},'-',{
				text	: 'win InlineViewer PDF',
				xtype	: 'button',
				handler : function(){
					windowInlinePDFViewer.show();
				}
			},'-',{
				xtype		: 'button',
				text		: 'multiple ajax',
				handler		: function(){
					var rnd=Math.floor((Math.random()*3)+1);
					Ext.Ajax.request({
						url		: 'proxy.php?'+rnd,
						params	: {
							exw_action	: 'local.mailboxImap.test',
							sleep		: rnd
						},
						success	: function(data){
							var result = JSON.parse(data.responseText);
							console.log(result);
						},
						failure	: function(data){
							console.log(data);
							alert(Ext.eu.sm.MailBox.i18n._('failure on moving mail'));
						}
					});

				}
			},'-',{
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
			items		:[{
				title		: 'form',
				xtype		: 'form',
				labelWidth	: 100,
				frame		: true,
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
					tpl						:'<tpl for="."><div class="x-combo-list-item">{email}, <i>{name}</i></div></tpl>',
				},{
					xtype			: 'mailselect',
					fieldLabel		: 'Cc',
					name			: 'cc',
					anchor			: '-30',
					value			: emails,
					store			: that.recipientSearchStore,
					tpl				:'<tpl for="."><div class="x-combo-list-item">{email}, <i>{name}</i></div></tpl>',
				}]
			},{
				xtype		: 'eu.sm.pivoteditorgridpanel',
				id			: that.pivotEditorGridPanelId,
				title		: 'PivotGrid',
				tbar		: [{
					xtype		: 'button',
					text		: 'save',
					handler		: function(){
						var grid = Ext.getCmp(that.pivotEditorGridPanelId);
						console.log(grid.pivotGetModifiedRecords());
					}
				}],
				pivot		: {
					store			: that.pivotStore,
					groupBy			: 'key',
					value			: 'value',
					column			: 'subkey',
					headerRenderer	: function(pivotValue,idx){
						return '['+pivotValue+']';
					},
					columnModel		: {
						header: 'xxxx'	, width: 60, sortable: true, fixed:false,dataIndex: 'value',
						editorGenerator	: function(pivotValue,idx){
							return new Ext.form.TextField();
						}
					},
				},
				forceFit: true,
				autoExpandColumn	:'col1',
				columns				: [{
					header: 'key'	, width: 100, sortable: true, fixed:false,dataIndex: 'key'	,
				},{
					header: 'col1'	, width: 200, sortable: true, fixed:false,dataIndex: 'col1'	,id : 'col1',
				}]
			},{
				xtype		: 'eu.sm.pivoteditorgridpanel',
				id			: that.pivotGroupingEditorGridPanelId,
				title		: 'GroupingPivotGrid',
				tbar		: [{
					xtype		: 'button',
					text		: 'save',
					handler		: function(){
						var grid = Ext.getCmp(that.pivotGroupingEditorGridPanelId);
						console.log(grid.pivotGetModifiedRecords());
					}
				}],
				pivot		: {
					store			: that.pivotGroupingStore,
					groupBy			: 'key',
					value			: 'value',
					column			: 'subkey',
					headerRenderer	: function(pivotValue,idx){
						return '['+pivotValue+']';
					},
					columnModel		: {
						header: 'xxxx'	, width: 60, sortable: true, fixed:false,dataIndex: 'value',
						editorGenerator	: function(pivotValue,idx){
							return new Ext.form.TextField();
						}
					},
				},
				view			: new Ext.grid.GroupingView({
					forceFit		: true,
					groupTextTpl	: '{text}'
				}),
				forceFit: true,
				autoExpandColumn	:'col1',
				columns				: [{
					header: 'key'	, width: 100, sortable: true, fixed:false,dataIndex: 'key'	,
				},{
					header: 'col1'	, width: 200, sortable: true, fixed:false,dataIndex: 'col1'	,id : 'col1',editor : new Ext.form.TextField()
				}]
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
				border		: false,
				height		: 400,
				activeTab	: 0,
				items		: [{
					xtype		: 'panel',
					id			: that.modalContainerTestId,
					title		: 'Tab 1',
					frame		: true,
					border		: false,
					layout		: 'form',
					maskDisabled:false,
					buttons		: [{
						text		:'test',
						handler		: function(){
							var win = new Ext.ModalWindow({
								modalContainer		: Ext.getCmp(that.modalContainerTestId),
								title				: 'eeee',
								modalContainerBorder: 20,
								items				: {
									html : 'test '+Ext.getCmp(that.renderedFieldId).getValue()
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
					},{
						xtype			: 'eu.sm.form.renderedField',
						id				: that.renderedFieldId,
						fieldLabel		: 'Subject2',
						value			: 'sujet',
					},{
						xtype			: 'eu.sm.form.starField',
						id				: that.starField1Id,
						fieldLabel		: 'starField 1',
						mode			: 'byhalf',
						value			: 3.75,
					},{
						xtype			: 'eu.sm.form.starField',
						id				: that.starField2Id,
						fieldLabel		: 'starField 2',
						mode			: 'proportional',
						value			: 3.75,
					}]
				},{
					xtype		: 'panel',
					title		: 'tab2',
					layout		: 'form',
					frame		: true,
					html		: 'sample panel',
				}]
			},{
				html	: 'lower panel',
				region	: 'center',
				frame	: true
			}]
		}]
	});
});