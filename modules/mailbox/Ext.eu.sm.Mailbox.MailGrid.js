
Ext.ns('Ext.eu.sm.MailBox');
//mailbox.mailsearchform
Ext.eu.sm.MailBox.MailGrid = Ext.extend(Ext.Panel, {
	account			: null,
	folder			: null,
	searchOpened	: false,
	mailboxContainer: null,
	pageSize		: 50,
	gridPlugins		: [],
	groupColumn		: null,

	setInlineTitle	: function (text){
		var that = this;
		Ext.getCmp(that.inlineTitleId).setText(text);
	},

	load			: function (account,folder){
		var that = this;
		that.account	= account;
		that.folder		= folder;
		that.setInlineTitle(Ext.util.base64.decode(folder)+' ['+that.account+']');

		if(that.mailStore.baseParams.query){
			delete(that.mailStore.baseParams.query);
		}
		that.mailStore.baseParams.folder	= folder;
		that.mailStore.baseParams.account	= account;
		that.mailStore.load({
			params	: {
				start			: 0,
				limit			: that.pageSize
			}
		});
	},
	postInit		: function(container){},

	initComponent	: function (){
		var that = this;
		that.inlineTitleId		= Ext.id();
		that.txtSearchId		= Ext.id();
		that.searchFormId		= Ext.id();
		that.mainGridId			= Ext.id();
		that.menuGroupId		= Ext.id();
		that.dateInit = Date.now();

		that.mailStore = new Ext.data.GroupingStore({
			remoteSort		: true,
			autoLoad		: false,
			remoteGroup		: false,
			//groupOnSort		: true,
			groupField		: that.groupColumn,
			reader			: new Ext.data.JsonReader({
				root			: 'data',
				totalProperty	: 'totalCount',
				id				: 'message_id',
			},that.mailboxContainer.mailFields),
			listeners	:{
				load : function(){
					console.log('eee');
				}
			},
			baseParams		: {
				'exw_action'	: that.mailboxContainer.svcImapPrefixClass+'getMailListInFolders',
				'folder'		: 'INBOX'
			},
			sortInfo		: {
				field			: 'date',
				direction		: "DESC"
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
				//url				: '/test.json?r=1',
			})
		});

		that.tbar = [{
			xtype			: 'label',
			id				: that.inlineTitleId,
			text			: '...'
		},'-',{
			xtype			: 'textfield',
			id				: that.txtSearchId,
			enableKeyEvents	: true,
			listeners		: {
				'keyup'		: function(cmp,e) {
					var val = cmp.getValue();
					var searchForm = Ext.getCmp(that.searchFormId);
					searchForm.syncText(val);
					if(e.getCharCode() == 13){
						if((''+val)!=''){
							searchForm.runQueryOneParam("TEXT",val);
						}else{
							that.resetQuerySearch();
						}
					}
				}
			}
		},'-',{
			xtype			: 'label',
			text			: ' multiple '
		},{
			xtype			: 'checkbox',
			handler			: function(){
				Ext.getCmp(that.mainGridId).getColumnModel().setHidden(0,!(this.checked));
			}
		},{
			xtype			: 'button',
			text			: Ext.eu.sm.MailBox.i18n._('Cleanup'),
			enableToggle	: true,
			pressed			: that.searchOpened,
			listeners		: {
				toggle			: function (button, pressed){
					Ext.Ajax.request({
						url		: 'proxy.php',
						params	: {
							exw_action	: that.mailboxContainer.svcImapPrefixClass+'expunge',
							account		: that.account,
							folder		: that.folder
						},
						success	: function(data){
							var result = JSON.parse(data.responseText);
							if(result.ok){
								that.mailStore.load();
							}else{
								alert(result.errors)
							}
						},
						failure	: function(data){
							console.log(data);
							alert(Ext.eu.sm.MailBox.i18n._('failure on moving mail'));
						}
					});

				}
			}
		},'-',{
			text	: 'Group',
			id		: that.menuGroupId,
			menu	: {
				defaults:{
					group			: 'radioGroupingColumn',
					checked			: false,
					checkHandler	: function (item,val){
						if(val){
							that.groupColumn = item.column;
							that.menuGroupHandleText();
							that.mailStore.groupBy(that.groupColumn);
							Ext.getCmp(that.menuGroupId);
							console.log(arguments);
						}
					}
				},
				items: [{
					text	: '<s>'+Ext.eu.sm.MailBox.i18n._('none')+'</s>',
					column	: null,
					checked	: that.groupColumn==null
				},{
					text	: Ext.eu.sm.MailBox.i18n._('Date'),
					column	: 'date',
					checked	: that.groupColumn=='date'
				}, {
					text	: Ext.eu.sm.MailBox.i18n._('From'),
					column	: 'from',
					checked	: that.groupColumn=='from'
				}, {
					text	: Ext.eu.sm.MailBox.i18n._('Priority'),
					column	: 'priority',
					checked	: that.groupColumn=='priority'
				}, {
					text	: Ext.eu.sm.MailBox.i18n._('Seen'),
					column	: 'seen',
					checked	: that.groupColumn=='seen'
				}]
			}
		},'->',{
			xtype			: 'button',
			text			: Ext.eu.sm.MailBox.i18n._('Criterias'),
			enableToggle	: true,
			pressed			: that.searchOpened,
			listeners		: {
				toggle			: function (button, pressed){
					Ext.getCmp(that.searchFormId).setWidth(pressed?300:0);
					that.doLayout();
				}
			}
		}];

		that.menuGroupHandleText = function() {
			var tbItem = Ext.getCmp(that.menuGroupId);
			var selectedItem = tbItem.menu.items.get(tbItem.menu.items.findIndexBy(function(v){
				return v.column==that.groupColumn;
			}));
			tbItem.setText(selectedItem.text);
		}

		that.querySearch = function(query){
			that.mailStore.baseParams.query			= query;
			that.mailStore.load();
		}

		that.resetQuerySearch = function(query){
			if(that.mailStore.baseParams.query){
				delete(that.mailStore.baseParams.query);
			}
			that.mailStore.load();
		}

		that.gridSelectionModel	= new Ext.grid.CheckboxSelectionModel({
			singleSelect	: false,
			hidden			: true
		});

		that.gridColumnModel = [
			that.gridSelectionModel,
			{header: Ext.eu.sm.MailBox.i18n._("Subject")	, width: 200, sortable: true, fixed:false,dataIndex: 'subject'	,id : 'subject'},
			{header: Ext.eu.sm.MailBox.i18n._("From")		, width: 200, sortable: true, fixed:false,dataIndex: 'from'		,renderer: function(v){
				return Ext.eu.sm.MailBox.utils.formatRecipient(v);
			}},
			{header: Ext.eu.sm.MailBox.i18n._("Flags")		, width:  40, sortable: true, fixed: true,dataIndex: 'flags'	,renderer: function(v,meta){
				return v?v.join(','):'';
			}},
			{header: Ext.eu.sm.MailBox.i18n._("Seen")		, width:  40, sortable: true, fixed: true,dataIndex: 'seen'		,renderer: function(v,meta,record){
				meta.css=(v?'mail_open':'mail_closed')+(record.get('answered')?'_replied':'');
				return '';
				return (v==1)?".":"<b>*</b>"
			}},
			{header: Ext.eu.sm.MailBox.i18n._("Date")		, width: 130, sortable: true, fixed: true,dataIndex: 'date'		,renderer: Ext.util.Format.dateRenderer(Ext.eu.sm.MailBox.i18n._('d/m/Y H:i:s'))},
			{header: Ext.eu.sm.MailBox.i18n._("Size")		, width:  80, sortable: true, fixed: true,dataIndex: 'size'		,renderer: Ext.eu.sm.MailBox.utils.humanFileSize,align:"right"},
			{header: Ext.eu.sm.MailBox.i18n._("Priority")	, width:  80, sortable: true, fixed: true,dataIndex: 'priority'	}
		];

		that.fireEvent('postInit',that);

		Ext.apply(that,{
			layout	: 'border',
			tbar	: that.tbar,
			items	: [{
				xtype				: 'grid',
				id					: that.mainGridId,
				region				: 'center',
				store				: that.mailStore,
				bbar				: new Ext.PagingToolbar({
					pageSize			: that.pageSize,
					store				: that.mailStore,
					displayInfo			: true,
					displayMsg			: Ext.eu.sm.MailBox.i18n._('Displaying mails {0} - {1} of {2}'),
					emptyMsg			: Ext.eu.sm.MailBox.i18n._("No mails to display")
				}),
				plugins				: that.gridPlugins,
				loadMask			: true,
				autoExpandColumn	: 'subject',
				ddGroup				: 'mailboxDDGroup',
				enableDragDrop		: true,
				selectionModel		: that.gridSelectionModel,
				cm					: new Ext.grid.ColumnModel(that.gridColumnModel),
				view				: new Ext.grid.GroupingView({
					forceFit			: true,
					showGroupName		: true,
					enableNoGroups		: false,
					enableGroupingMenu	: false,
					startCollapsed		: false,
					autoFill			: true,
					groupMode			: 'display',
					hideGroupedColumn	: false,
					groupTextTpl		: ' {text} ({[values.rs.length]})',
					enableRowBody		: true,
					showPreview			: true,
					getRowClass 		: function(record, rowIndex, p, store){
						if(record.get('seen')==0){
							return 'x-grid3-row-collapsed mailUnseen';
						}
						return 'x-grid3-row-collapsed';
					},
					listeners			: {
						refresh:function(){
							console.log(Date.now()-that.dateInit);
						},
						beforerefresh		: function(view){
							that.groupColType = view.getGroupField()?view.ds.fields.get(view.getGroupField()).type:null;
						}
					},
					getGroup			: function(v, r, groupRenderer, rowIndex, colIndex, ds){
						// colIndex of your date column
						if (that.groupColType=='date') {
							// group only by date
							return v.format('Y-m-d D');
						}else {
							// default grouping
							var g = groupRenderer ? groupRenderer(v, {}, r, rowIndex, colIndex, ds) : String(v);
							if(g === ''){
								g = this.cm.config[colIndex].emptyGroupText || this.emptyGroupText;
							}
							return g;
						}
					}
				}),
				listeners			: {
					cellclick	: function(grid,rowIndex,columnIndex,event){
						var record = grid.getStore().getAt(rowIndex);
						switch (grid.getColumnModel().getDataIndex(columnIndex)){
							case 'seen':
								that.fireEvent('seenclick',record);
							break;
							default:
								that.fireEvent('recordclick',record);
							break;
						}
					},

					rowcontextmenu : function (grid, rowIndex, e){
						e.stopEvent();
						var record = that.mailStore.getAt(rowIndex);
						new Ext.menu.Menu({
							items			: [{
								text			: 'move',
								menu			: Ext.getCmp(that.mailboxContainer.folderTreeId).createFolderMenu({
									disabledId	: that.folder,
									listeners	: {
										'selected' : function (item){
											console.log('OK to move',item);
										},
									}
								})
							},'-',{
								text			: Ext.eu.sm.MailBox.i18n._('Reply'),
								iconCls			: 'mail_closed_alt',
								handler			: function(){
									that.mailboxContainer.mailReply(record);
								}
							},{
								text			: Ext.eu.sm.MailBox.i18n._('Reply to All'),
								iconCls			: 'mail_closed_alt_add',
								handler			: function(){
									that.mailboxContainer.mailReplyToAll(record);
								}
							},{
								text			: Ext.eu.sm.MailBox.i18n._('Forward'),
								iconCls			: 'mail_closed_send',
								handler			: function(){
									that.mailboxContainer.mailForward(record);
								}
							},{
								text			: Ext.eu.sm.MailBox.i18n._('Delete'),
								iconCls			: 'mail_closed_delete',
								handler			: function(){
									that.mailboxContainer.mailDelete(record);
								}
							},'-',{
								text			: Ext.eu.sm.MailBox.i18n._('Set Seen'),
								disabled		: record.get('seen'),
								handler			: function(){
									that.mailboxContainer.mailChangeFlag.call(that.mailboxContainer,record,'seen');
								}
							},{
								text			: Ext.eu.sm.MailBox.i18n._('set Unseen'),
								disabled		: !record.get('seen'),
								handler			: function(){
									that.mailboxContainer.mailChangeFlag.call(that.mailboxContainer,record,'seen');
								}
							}]
						}).showAt(e.getXY());
					}
				}
			},{
				xtype			: 'mailbox.mailsearchform',
				region			: 'east',
				id				: that.searchFormId,
				width			: that.searchOpened?300:0,
				syncTextId		: that.txtSearchId,
				listeners		: {
					search			: function(query){
						that.querySearch(query)
					}
				}
			}]
		});
		Ext.eu.sm.MailBox.MailGrid.superclass.initComponent.call(this);
		that.on('render',function(){
			that.menuGroupHandleText();
		})
	}
});

Ext.reg('mailbox.mailgrid',Ext.eu.sm.MailBox.MailGrid);