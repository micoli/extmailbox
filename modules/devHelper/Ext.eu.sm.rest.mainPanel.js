if(false) Ext={};
Ext.ns('Ext.eu.sm.rest');
Ext.eu.sm.rest.mainPanel = Ext.extend(Ext.Panel, {

	initComponent		: function(){
		var that = this;
		that.restPanelId			= Ext.id();
		that.historyGridId			= Ext.id();
		that.bodyTypeId				= Ext.id();
		that.rawResultId			= Ext.id();
		that.headersResultId		= Ext.id();
		that.contentResultId		= Ext.id();
		that.resultTabpanelId		= Ext.id();
		that.rawContentResultId		= Ext.id();
		that.authorizationPanelId	= Ext.id();
		that.basicAuthentificationFieldId= Ext.id();

		var history = JSON.parse(localStorage.getItem('history'));
		if (history==null || !history.hasOwnProperty('length')){
			history=[];
		}

		that.dumpLocalStorage = function(){
			var result=[];
			that.historyStore.each(function(record){
				result.push(record.data);
			});
			localStorage.setItem('history',JSON.stringify(result));
		};

		that.addHistory = function (prm){
			var id	= Ext.util.MD5(JSON.stringify(prm));
			var rId	= that.historyStore.find('id',id);
			//console.log(that.historyStore,id,prm,rId,rId==-1?'ADD':'UPD');
			if(rId==-1){
				that.historyStore.addSorted(new that.historyStore.recordType({
					'id'	: id,
					'date'	: (new Date()).format('Y-m-d H:i:s'),
					'url'	: prm.url,
					'prm'	: prm
				}));
			}else{
				that.historyStore.getAt(rId).set('date',(new Date()).format('Y-m-d H:i:s'));
				that.historyStore.sort('date','DESC');
			}
		};

		that.historyStore = new Ext.data.JsonStore({
			fields			: [
				'id',
				'date',
				'url',
				'prm'
			],
			autoLoad	: true,
			id			: 'id',
			proxy		: new Ext.data.MemoryProxy([]),
			data		: history,
			remoteSort	: false,
			sortInfo	: {
				field		: 'date',
				direction	: 'DESC'
			},
			listeners	: {
				update	: that.dumpLocalStorage,
				add		: that.dumpLocalStorage,
				remove	: that.dumpLocalStorage
			}
		});

		that.historyActions = new Ext.ux.grid.RowActions({
			header			: '&nbsp;',
			keepSelection	: true,
			actions			: [{
				iconCls : 'icon-del',tooltip : 'Delete'
			}],
			callbacks		: {
				'icon-del':function(grid, record, action, value) {
					that.historyStore.remove(record);
				}
			}
		});

		that.parametersStore	= new Ext.data.JsonStore({
			fields		: ['name','value'],
			autoLoad	: false,
			proxy		: new Ext.data.MemoryProxy([])
		});

		that.reponseHeadersStore	= new Ext.data.JsonStore({
			fields		: ['key','value'],
			autoLoad	: false,
			proxy		: new Ext.data.MemoryProxy([]),
			data 		: []
		});

		that.expander = new Ext.grid.RowExpander({
			tpl : new Ext.XTemplate([
				'<p>',
				'<b>date:</b> {date}</p>',
				'<b>prm:</b> {[this.json(values.prm)]}</p>',
				'<br>'].join(''),{
				json:function(a){
					return JSON.stringify(a);
				}
			})
		});

		that.query = function(){
			var prm = Ext.eu.sm.form.tools.getValues(Ext.getCmp(that.restPanelId));
			console.log(prm);
			that.addHistory(prm);
			var mask = new Ext.LoadMask(Ext.getCmp(that.restPanelId).getEl(), {
				msg:"Please wait..."
			});
			mask.show();
			Ext.Ajax.request({
				url		: 'proxy.php?exw_action=local.rest.rest',
				jsonData: prm,
				success	: function(data){
					mask.hide();
					var rawResultPanel = Ext.getCmp(that.rawResultId);
					var rawContentResultPanel = Ext.getCmp(that.rawContentResultId);
					rawResultPanel.ownerCt.setActiveTab(rawResultPanel);
					rawResultPanel.setValue(data.responseText);

					var result = JSON.parse(data.responseText);
					if(result.body){
						result.body=Ext.util.base64.decode(result.body);
						rawContentResultPanel.setValue(result.body);
					}
					if(result.error){
						result.body=Ext.util.base64.decode(result.error);
						rawContentResultPanel.setValue(result.body);
					}

					try{
						rawResultPanel.setValue(JSON.stringify(result,true,"  "));// same but formatted
					}catch(e){
						console.log('result json exception',e);
					}

					that.reponseHeadersStore.removeAll();
					var contentType='raw';
					if(result.response_headers){
						for(var k in result.response_headers){
							if(result.response_headers.hasOwnProperty(k)){
								if(k.toLowerCase()=='content-type'){
									contentType=(''+result.response_headers[k][0]).toLowerCase().split(';')[0];
								}
								that.reponseHeadersStore.add(new that.reponseHeadersStore.recordType({
									'key'	: k,
									'value'	: result.response_headers[k].join("\n")
								}));
							}
						};
					}
					var contentResultPanel=Ext.getCmp(that.contentResultId);
					contentResultPanel.ownerCt.setActiveTab(contentResultPanel);
					contentResultPanel.doLayout();
					contentResultPanel.items.each(function(panel,k){
						if ((panel.contentTypes && panel.contentTypes.indexOf(contentType)!=-1) || k==contentResultPanel.items.length-1){
							contentResultPanel.layout.setActiveItem(panel);
							console.log(contentType,panel,result.body);
							panel.setValue.call(panel,result.body);
							return false;
						}
					});
				},
				failure	: function(data){
					mask.hide();
				}
			});
		};

		Ext.apply(that,{
			layout	: 'border',
			frame	: true,
			items	: [{
				region				: 'west',
				xtype				: 'grid',
				id					: that.historyGridId,
				store				: that.historyStore,
				width				: 300,
				loadMask			: true,
				split				: true,
				autoExpandColumn	: 'autoexpand',
				plugins				: [that.expander,that.historyActions],
				columns				: [that.expander,{
					dataIndex : 'url'	, header : 'url'	,id : 'autoexpand'
				},that.historyActions],
				listeners			: {
					rowdblclick	: function(grid,rowIndex,columnIndex,event){
						var record = grid.getStore().getAt(rowIndex);
						console.log(record);
						Ext.eu.sm.form.tools.setValues(Ext.getCmp(that.restPanelId),record.data.prm);
					}
				}
			},{
				region	: 'center',
				layout	: 'border',
				xtype	: 'panel',
				id		: that.restPanelId,
				frame	: true,
				items	: [{
					region	: 'north',
					height	: 250,
					split	: true,
					frame	: true,
					layout	: 'form',
					items	: [{
						layout		: 'column',
						items		:[{
							columnWidth	: .20,
							labelWidth	: 60,
							layout		: 'form',
							items		: [{
								xtype		: 'combo',
								anchor		: '99%',
								name		: 'method',
								fieldLabel	: 'Method',
								value		: 'GET',
								isFormField	: true,
								store		: new Ext.data.JsonStore({
									fields		: ['method'],
									proxy		: new Ext.data.MemoryProxy([]),
									data		: [{
										method	: 'GET'
									},{
										method	: 'POST'
									},{
										method	: 'PUT'
									},{
										method	: 'DELETE'
									}/*,{
										method	: 'SOAP'
									}*/]
								}),
								displayField	: 'method',
								valueField		: 'method',
								emptyText		: 'Select a method...',
								mode			: 'local',
								triggerAction	: 'all',
								typeAhead		: true,
								forceSelection	: true,
								selectOnFocus	: true,
								listeners		: {
									select			: function(combo,record,index){
										that.currentMethod = record;
									}
								}
							}]
						},{
							columnWidth	: .70,
							labelWidth	: 40,
							layout		: 'form',
							items		: [{
								xtype			: 'textfield',
								anchor			: '99%',
								name			: 'url',
								fieldLabel		: 'URL',
								isFormField		: true,
								value			: 'https://',
								enableKeyEvents	: true,
								listeners		: {
									'keyup'			: function(cmp,e) {
										if(e.getCharCode() == 13){
											that.query();
										}
									}
								}
							}]
						},{
							columnWidth	: .10,
							items		:[{
								xtype		: 'button',
								text		: 'generate',
								handler		: that.query
							}]
						}]
					},{
						xtype		: 'tabpanel',
						anchor		: '100% 100%',
						border		: false,
						activeTab	: 0,
						items		: [{
							title		: 'Body',
							xtype		: 'panel',
							layout		: 'card',
							layoutConfig: {
								deferredRender	: true
							},
							height		: 200,
							border		: false,
							hideMode	: 'offsets',
							activeItem	: 0,
							id			: that.bodyTypeId,
							tbar		: ['Body: ',{
								xtype		: 'combo',
								value		: 'None',
								store		: new Ext.data.JsonStore({
									fields		: ['type','cmp'],
									data		: [],
									proxy		: new Ext.data.MemoryProxy([])
								}),
								displayField	: 'type',
								valueField		: 'type',
								emptyText		: 'Select a type...',
								mode			: 'local',
								triggerAction	: 'all',
								typeAhead		: true,
								forceSelection	: true,
								selectOnFocus	: true,
								listeners		: {
									render		: function(combo){
										var store = combo.getStore();
										Ext.getCmp(that.bodyTypeId).items.each(function(subPanel){
											store.add(new store.recordType({
												type	: subPanel._title,
												cmp		: subPanel
											}));
										});
										combo.setValue(store.getAt(0).get('type'));
									},
									select		: function(combo,record,index){
										Ext.getCmp(that.bodyTypeId).layout.setActiveItem(record.data.cmp);
									}
								}
							}],
							items		: [{
								_title		: 'www-form-encoded',
								bodyType	: 'www-form-encoded',
								xtype		: 'rest.keyValueGrid',
								isFormField	: true,
								name		: 'parameters'
							},{
								_title			: 'jsonData',
								bodyType		: 'jsonData',
								layout			: 'fit',
								items			: [{
									xtype			: 'ux-codemirror',
									isFormField		: true,
									name			: 'jsonData',
									value			: '{\n}',
									codeMirrorConfig: {
										language		: 'js',
										lineNumbers		: true
									}
								}]
							},{
								_title			: 'xmlData',
								bodyType		: 'xmlData',
								layout			: 'fit',
								items			: [{
									xtype			: 'ux-codemirror',
									isFormField		: true,
									name			: 'jsonData',
									codeMirrorConfig: {
										language		: 'xml',
										lineNumbers		: true
									}
								}]
							}/*,{
								_title			: 'soap',
								bodyType		: 'soapData',
								layout			: 'fit',
								items			: [{
									xtype			: 'ux-codemirror',
									isFormField		: true,
									name			: 'soapData',
									codeMirrorConfig: {
										language		: 'xml',
										lineNumbers		: true
									}
								}]
							}*/]
						},{
							title		: 'Headers',
							xtype		: 'rest.keyValueGrid',
							isFormField	: true,
							name		: 'headers',
							definedData	: [{
								name	: 'GET2'	,value:'11111'
							},{
								name	: 'GET1'	,value:'aaaa'
							}]
						},{
							title		: 'Authorization',
							layout		: 'card',
							height		: 'auto',
							id			: that.authorizationPanelId,
							activeItem	: 0,
							layoutConfig: {
								deferredRender	: true
							},
							tbar	: ['Type :',{
								xtype		: 'combo',
								xisFormField: true,
								xname		: 'authentificationType',
								value		: 'None',
								store		: new Ext.data.JsonStore({
									fields		: ['type'],
									data		: [],
									proxy		: new Ext.data.MemoryProxy([])
								}),
								displayField	: 'type',
								valueField		: 'type',
								emptyText		: 'Select a type...',
								mode			: 'local',
								triggerAction	: 'all',
								typeAhead		: true,
								forceSelection	: true,
								selectOnFocus	: true,
								listeners		: {
									render		: function(combo){
										var store = combo.getStore();
										Ext.getCmp(that.authorizationPanelId).items.each(function(subPanel){
											store.add(new store.recordType({
												type	: subPanel._title,
												cmp		: subPanel
											}));
										});
										combo.setValue(store.getAt(0).get('type'));
									},
									select		: function(combo,record,index){
										Ext.getCmp(that.authorizationPanelId).layout.setActiveItem(record.data.cmp);
									}
								}
							}],
							items	: [{
								_title			: 'None',
								frame			: true,
								height			: 'auto',
								html			: '&nbsp;'
							},{
								_title			: 'Basic',
								height			: 'auto',
								layout			: 'form',
								frame			: true,
								items			: [{
									xtype			: 'textfield',
									fieldLabel		: 'Login',
									name			: 'authentificationBasic.login',
									isFormField		: true
								},{
									xtype			: 'textfield',
									fieldLabel		: 'Password',
									name			: 'authentificationBasic.password',
									isFormField		: true
								}]
							}]
						}]
					}]
				},{
					region		: 'center',
					xtype		: 'tabpanel',
					border		: false,
					id			: that.resultTabpanelId,
					layoutConfig: {
						//deferredRender	: true
					},
					activeTab	: 0,
					defaults	: [{
						hideMode	: 'offsets'
					}],
					items		: [{
						title				: 'Raw',
						layout				: 'fit',
						forceLayout			: true,
						id					: that.rawResultId,
						xtype				: 'ux-codemirror',
						codeMirrorConfig	: {
							language			: 'javascript',
							lineNumbers			: true
						}
					},{
						title				: 'Headers',
						id					: that.headersResultId,
						xtype				: 'grid',
						store				: that.reponseHeadersStore,
						autoExpandColumn	: 'autoexpand',
						columns				: [{
							header	: 'key'		, dataIndex	:'key'	, width	: 300
						},{
							header	: 'value'	, dataIndex	:'value', id	:'autoexpand'
						}]
					},{
						title				: 'Raw Content',
						layout				: 'fit',
						items				: [{
							id					: that.rawContentResultId,
							xtype				: 'textarea'
						}]
					},{
						title				: 'Content',
						id					: that.contentResultId,
						layout				: 'card',
						layoutConfig		: {
							deferredRender		: true
						},
						items				: [{
							layout				: 'fit',
							contentTypes		: ['none/none']
						},{
							layout				: 'fit',
							contentTypes		: ['application/xml','text/xml'],
							xtype				: 'ux-codemirror',
							codeMirrorConfig	: {
								language			: 'xml',
								lineNumbers			: true
							}
						},{
							layout				: 'fit',
							contentTypes		: ['application/js','application/json','application/javascript'],
							xtype				: 'ux-codemirror',
							codeMirrorConfig	: {
								language			: 'javascript',
								lineNumbers			: true
							}
						},{
							layout				: 'fit',
							contentTypes		: ['text/html','application/html'],
							xtype				: "iframepanel",
							autoScroll			: true,
							setValue			: function(v){
								this.getFrameBody().innerHTML = v;
							}
						},{
							layout				: 'fit',
							forceLayout			: true,
							contentTypes		: ['raw','text/plain'],
							xtype				: "iframepanel",
							autoScroll			: true,
							setValue			: function(v){
								this.getFrameBody().innerHTML = '<pre>'+v+'</pre>';
							}
						}]
					}]
				}]
			} ]
		});
		Ext.eu.sm.rest.mainPanel.superclass.initComponent.call(this);
		that.firstLayoutDone=false;
		that.on({
			afterlayout : function(cmp){
				if(!that.firstLayoutDone){
					that.firstLayoutDone=true;
					setTimeout(function(){
						var contentResultPanel = Ext.getCmp(that.contentResultId);
						contentResultPanel.ownerCt.setActiveTab(contentResultPanel);
						contentResultPanel.doLayout();
						contentResultPanel.items.each(function(panel,k){
							contentResultPanel.layout.setActiveItem(panel);
							if(panel.setValue){
								//panel.setValue('');
							}
						});
						console.log(Ext.getCmp(that.contentResultId));
					},200);
				}
			}
		});
	}
});
Ext.reg('rest.mainPanel',Ext.eu.sm.rest.mainPanel);