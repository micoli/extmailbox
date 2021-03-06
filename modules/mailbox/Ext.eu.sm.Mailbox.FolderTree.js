Ext.ns('Ext.eu.sm.MailBox');
Ext.eu.sm.MailBox.FolderTree = Ext.extend(Ext.tree.TreePanel, {
	lines					: false,
	borderWidth				: Ext.isBorderBox ? 0 : 2, // the combined left/right border for each cell
	cls						: 'x-column-tree',
	dragDropDefaultIsMove	: true,
	enableDrop				: true,
	inboxNodeName			: 'INBOX',

	initComponent	: function (){
		var that = this;
		this.addEvents('beforedrop', 'drop');

		that.getFlatStructure = function (store,disabledId){
			var tree = Ext.getCmp(that.folderTreeId);
			store.removeAll();

			var createSubItem = function (children,parent){
				var items=[];
				Ext.each(children,function(v,k){
					var item = {
						longText	: parent.longText + v.text + '/',
						shortcut	: parent.shortcut + v.text.substr(0,1).toLowerCase(),
						subText		: v.text,
						id			: v.id,
						iId			: v.iId
					}
					if(disabledId!=v.id){
						store.add(new store.recordType(item));
					}
					if(v.children){
						createSubItem(v.children,item);
					}
				});
			}
			if(that.rawItems.length>1){
				createSubItem(that.rawItems				,{longText:'',shortcut:''});
			}else{
				createSubItem(that.rawItems[0].children	,{longText:'',shortcut:''})
			}
		}

		that.createFolderMenu = function(config){
			var handler = (config && config.listeners && config.listeners.selected)?config.listeners.selected:Ext.emptyFn;
			var disabledId = config.disabledId || null;
			var tree = Ext.getCmp(that.folderTreeId);

			var createSubMenu = function (children){
				var items=[];
				Ext.each(children,function(v,k){
					var item={
						text	: v.text,
						id		: v.id,
						iId		: v.iId,
						iconCls	: v.rawCls?(v.rawCls).replace('x-tree-node-collapsed x-tree-node-icon',''):'mail_folder_open'
					};
					if(disabledId==v.id){
						item.disabledSelect = true;
					}
					item.handler = handler;
					if(v.children){
						item.menu= {
							items : []
						}
						item.menu.items = createSubMenu(v.children);
					}
					items.push(item);
				});
				return items;
			}

			return new Ext.menu.Menu({
				items	: (that.rawItems.length>1)?createSubMenu(that.rawItems):createSubMenu(that.rawItems[0].children)
			});
		};

		Ext.apply(that,{
			columns		: [{
				header		: 'Folder',
				width		: 140,
				dataIndex	: 'text'
			},{
				header		: 'n',
				width		: 22,
				dataIndex	: 'nb',
				renderer	: function(v,meta,node){
					if(node.folderType=='folder'){
						return '' + (node.stat.messages||0);
					}
				}
			},{
				header		: 'u',
				width		: 22,
				dataIndex	: 'nb',
				renderer	: function(v,meta,node){
					if(node.folderType=='folder'){
						return ''+(node.stat.unseen||0);
					}
				}
			}],
			root			: new Ext.tree.AsyncTreeNode({
				text			: 'Folders',
				expanded		: false,
				allowDrop		: true,
				allowChildren	: false
			}),
			enableDrop		: that.enableDrop,
			dropConfig		: {
				ddGroup				: 'mailboxDDGroup',
				allowContainerDrop	: false,
				allowParentInsert	: false,

				isValidDropPoint	: function(n, objPt, dd, e, data){
					if(!n || !data){
						return false;
					}
					var targetNode = n.node;
					var dropNode = data.node;
					// default drop rules
					if(!(targetNode && targetNode.isTarget && objPt.pt)){
						return false;
					}
					if(targetNode && !targetNode.attributes.allowDrop){
						return false;
					}
					if(dropNode && (targetNode == dropNode || dropNode.contains(targetNode))){
						return false;
					}
					objPt.pt="append";
					// reuse the object
					var overEvent = this.dragOverData;
					overEvent.tree = this.tree;
					overEvent.target = targetNode;
					overEvent.data = data;
					overEvent.point = objPt.pt;
					overEvent.source = dd;
					overEvent.rawEvent = e;
					overEvent.dropNode = dropNode;
					overEvent.cancel = false;
					var result = this.tree.fireEvent("nodedragover", overEvent);
					return overEvent.cancel === false && result !== false;
				},

				onNodeOver : function(n, dd, e, data){
					var pt = this.getDropPoint(e, n, dd);
					var node = n.node;
					// auto node expand check
					if(!this.expandProcId && pt == "append" && node.hasChildNodes() && !n.node.isExpanded()){
						this.queueExpand(node);
					}else if(pt != "append"){
						this.cancelExpand();
					}
					// set the insert point style on the target node
					var returnCls = this.dropNotAllowed;
					var objPt={
						pt:pt
					}
					if(this.isValidDropPoint(n, objPt, dd, e, data)){
						pt = objPt.pt;
						if(pt){
							var el  = n.ddel;
							var cls = "x-tree-drag-append";
							if(that.dragDropDefaultIsMove){
								if(e.browserEvent.shiftKey){
									returnCls = "x-tree-drop-ok-append";
								}else{
									returnCls = "x-tree-drop-ok-move";
								}
							}else{
								if(e.browserEvent.shiftKey){
									returnCls = "x-tree-drop-ok-move";
								}else{
									returnCls = "x-tree-drop-ok-append";
								}
							}
							if(this.lastInsertClass != cls){
								Ext.fly(el).replaceClass(this.lastInsertClass, cls);
								this.lastInsertClass = cls;
							}
						}
					}
					return returnCls;
				},

				onNodeDrop			: function(n, dd, e, data){
					var point = this.getDropPoint(e, n, dd);
					var targetNode = n.node;
					targetNode.ui.startDrop();
					var objPoint={
							pt : point
					}
					if(!this.isValidDropPoint(n, objPoint, dd, e, data)){
						targetNode.ui.endDrop();
						return false;
					}
					point = objPoint.pt;
					// first try to find the drop node
					var dropNode = data.node || (dd.getTreeNode ? dd.getTreeNode(data, targetNode, point, e) : (data.selections || null));
					var dropEvent = {
						tree : this.tree,
						target: targetNode,
						data: data,
						point: point,
						source: dd,
						rawEvent: e,
						dropNode: dropNode,
						cancel: !dropNode,
						dropStatus: false
					};
					if(that.dragDropDefaultIsMove){
						if(e.browserEvent.shiftKey){
							dropEvent.dropMode = 'copy';
						}else{
							dropEvent.dropMode = 'move';
						}
					}else{
						if(e.browserEvent.shiftKey){
							dropEvent.dropMode = 'move';
						}else{
							dropEvent.dropMode = 'copy';
						}
					}
					var retval = this.tree.fireEvent("beforenodedrop", dropEvent);
					if(retval === false || dropEvent.cancel === true || !dropEvent.dropNode){
						targetNode.ui.endDrop();
						return dropEvent.dropStatus;
					}
					// allow target changing
					targetNode = dropEvent.target;
					if(point == "append" && !targetNode.isExpanded()){
						targetNode.expand(false, null, function(){
							this.completeDrop(dropEvent);
						}.createDelegate(this));
					}else{
						this.completeDrop(dropEvent);
					}
					return true;
				},

				completeDrop : function(de){
					var ns = de.dropNode, p = de.point, t = de.target;
					t.ui.endDrop();
					this.tree.fireEvent("nodedrop", de);
				}
			},
			ddAppendOnly	: false,
			allowContainerDrop:true,
			loader			: new Ext.tree.TreeLoader({
				requestMethod	: 'GET',
				//dataUrl			: 'http://127.0.0.1:8080/mailbox/getAccountFolders',
				dataUrl			: 'proxy.php?exw_action='+that.mailboxContainer.svcImapPrefixClass+'getAccountFolders',
				uiProviders		: {
					'col'			: Ext.eu.sm.MailBox.FolderTreeColumnNodeUI
				},
				listeners		: {
					beforeload		: function(treeLoader, node) {
						this.baseParams.account = that.account;
						if(!this.baseParams.account){
							return false;
						}
					},
					load			: function(loader,node,response) {
						that.rawItems = JSON.parse(response.responseText);
						that.fireEvent('click',that.getNodeById(Ext.util.base64.encode(that.inboxNodeName)));
					}
				}
			})
		});

		Ext.eu.sm.MailBox.FolderTree.superclass.initComponent.call(this);

		that.on('contextmenu', function(node,e){
			var value = node.attributes.text;
			node.select();
			if(node.attributes.folderType!='folder'){
				return null;
			}
			var contextMenu= new Ext.menu.Menu({
				items			: [{
					text			: Ext.eu.sm.MailBox.i18n._('Rename folder ')+value,
					iconCls			: 'rename',
					handler			: function(){
						Ext.Msg.prompt('Rename', 'New name:', function(btn, text){
							if (btn == 'ok' && text!=value && (''+text).replace(/ /g,'')!=''){
								console.log(value,node.attributes,node);
								Ext.Ajax.request({
									url		: 'proxy.php',
									params	: {
										exw_action	: that.mailboxContainer.svcImapPrefixClass+'folderRename',
										account		: that.loader.baseParams.account,
										parentFolder: node.parentNode.attributes.id,
										oldName		: Ext.util.base64.encode(node.attributes.text),
										newName		: Ext.util.base64.encode(text)
									},
									success	: function(data){
										var result = JSON.parse(data.responseText);
										console.log(result);
										if(result.ok){
											that.loader.load(that.getRootNode());
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
						},that,false,value);
					}
				},{
					text			: Ext.eu.sm.MailBox.i18n._('Create subfolder to ')+value,
					iconCls			: 'add',
					handler			: function(){
						Ext.Msg.prompt('Create subfolder', 'Folder name:', function(btn, text){
							if (btn == 'ok' && text!=value && (''+text).replace(/ /g,'')!=''){
								console.log(value,node.attributes,node);
								Ext.Ajax.request({
									url		: 'proxy.php',
									params	: {
										exw_action	: that.mailboxContainer.svcImapPrefixClass+'createSubFolder',
										account		: that.loader.baseParams.account,
										parentFolder: node.attributes.id,
										subFolder	: Ext.util.base64.encode(text)
									},
									success	: function(data){
										var result = JSON.parse(data.responseText);
										console.log(result);
										if(result.ok){
											that.loader.load(that.getRootNode());
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
						},that);
					}
				},{
					text			: Ext.eu.sm.MailBox.i18n._('Delete folder : ')+value,
					iconCls			: 'edit',
					handler			: function(){
						Ext.Msg.show({
							title	: 'Delete subfolder?',
							msg		: 'You are sure to delete that folder <b>'+value+'</b> ?',
							buttons	: Ext.Msg.YESNOCANCEL,
							icon	: Ext.MessageBox.QUESTION,
							fn		: function(btn){
								if (btn == 'yes'){
									console.log(value,node.attributes,node);
									Ext.Ajax.request({
										url		: 'proxy.php',
										params	: {
											exw_action	: that.mailboxContainer.svcImapPrefixClass+'deleteFolder',
											account		: that.loader.baseParams.account,
											folder		: node.attributes.id
										},
										success	: function(data){
											var result = JSON.parse(data.responseText);
											console.log(result);
											if(result.ok){
												that.loader.load(that.getRootNode());
											}else{
												alert(result.errors)
											}
										},
										failure	: function(data){
											console.log(data);
											alert(Ext.eu.sm.MailBox.i18n._('failure on moving mail'));
										}
									});
									// process text value and close...
								}
							}
						});
					}
				}]
			});
			contextMenu.show(node.ui.getAnchor());
		});

		that.on('nodedragover', function(e){
			return (that.selectionOkForTarget(e.data.selections,e.target.attributes.id))
		});

		that.on('beforenodedrop', function(e){
			var dropEvent = that.formatDropEvent(e);
			if(that.selectionOkForTarget(dropEvent.data,dropEvent.folderId)){
				return false;
			}
			return that.fireEvent('beforedrop'	, dropEvent);
		});

		that.on('nodedrop'		, function (e){
			return that.fireEvent('drop'		, that.formatDropEvent(e));
		});
	},

	selectionOkForTarget	: function(data,folderId){
		var ok = true;
		Ext.each(data,function(v,k){
			if(v.get('folder')==folderId){
				ok=false;
				return false;
			}
		});
		if(!ok){
			return false;
		}
	},

	formatDropEvent			: function(dropEvent){
		var dropIdText='';
		try{
			dropIdText=Ext.util.base64.decode(dropEvent.target.id);
		}catch(e){}
		return {
			mode		: dropEvent.dropMode,
			data		: dropEvent.dropNode,
			folderIdText: dropIdText,
			folderiId	: dropEvent.target.attributes.iId,
			folderId	: dropEvent.target.id,
			text		: dropEvent.target.text,
			account		: dropEvent.target.attributes.loader.baseParams.account,
			tree		: this,
			rawEvent	: dropEvent
		}
	},

	onRender : function(){
		Ext.eu.sm.MailBox.FolderTree.superclass.onRender.apply(this, arguments);
		this.headers = this.body.createChild({
			cls	: 'x-tree-headers'
		},this.innerCt.dom);

		var cols = this.columns, c;
		var totalWidth = 0;

		for(var i = 0, len = cols.length; i < len; i++){
			c = cols[i];
			totalWidth += c.width;
			this.headers.createChild({
				cls:'x-tree-hd ' + (c.cls?c.cls+'-hd':''),
				cn: {
					cls	:'x-tree-hd-text',
					html: c.header
				},
				style	:'width:'+(c.width-this.borderWidth)+'px;'
			});
		}
		this.headers.createChild({cls:'x-clear'});
		// prevent floats from wrapping when clipped
		this.headers.setWidth(totalWidth);
		this.innerCt.setWidth(totalWidth);
	}
});

Ext.reg('mailbox.foldertree',Ext.eu.sm.MailBox.FolderTree);