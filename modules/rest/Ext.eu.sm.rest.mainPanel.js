Ext.ns('Ext.eu.sm.rest');

Ext.eu.sm.rest.mainPanel = Ext.extend(Ext.Panel, {

	getValues : function(obj){
		var that = this;
		var record={};
		that.fullCascade(obj,function(name,item){
			var val=item[item.xtype=="radiogroup"?"rgGetValue":"getValue"]();
			if(item.xtype=='datefield'){
				val=val.format('Y-m-d');
			}
			that.setObjPath(record,name,val);
		},'get');
		return record;
	},

	setValues : function(obj,record){
		var that = this;
		that.fullCascade(obj,function(name,item){
			item[item.xtype=="radiogroup"?"rgSetValue":"setValue"](that.getObjPath(record,name));
		},'set');
	},

	// http://likerrr.ru/on-air/adding-string-with-dot-notation-as-a-key-to-javascript-objects
	getObjPath: function(obj, path, notation) {
		notation = notation || '.';
		return path.split(notation).reduce(function(prev, cur) {
			return (prev !== undefined) ? prev[cur] : undefined;
		}, obj);
	},

	// http://likerrr.ru/on-air/adding-string-with-dot-notation-as-a-key-to-javascript-objects
	setObjPath : function(obj, path, value, notation) {
		var isObject = function (obj) { return (Object.prototype.toString.call(obj) === '[object Object]' && !!obj);}
		notation = notation || '.';
		path.split(notation).reduce(function (prev, cur, idx, arr) {
			var isLast = (idx === arr.length - 1);
			// if <cur> is last part of path
			if (isLast) return (prev[cur] = value);
			// if <cur> is not last part of path, then returns object if existing value is object or empty object
			return (isObject(prev[cur])) ? prev[cur] : (prev[cur] = {});
		}, obj);

		return obj;
	},

	fullCascade : function(obj,cb,getOrSet){
		obj.cascade(function(item){
			if(item.ownerCt && item.ownerCt.initialConfig && item.ownerCt.initialConfig.layout=='card'){
				if(item.ownerCt.getLayout().activeItem!=item){
					return false;
				}
			}
			var subFn=function(item){
				if (
					(typeof item=='object') &&
					(item.isFormField || item.xisFormField) &&
					(item.name || item.xname) &&
					(
						(getOrSet=='get'&&(item.rgGetValue || item.getValue))
						||
						(getOrSet=='set'&&(item.rgSetValue || item.setValue))
					)
				){
					cb((item.name||item.xname),item)
				}
			};
			subFn(item);
			Ext.each(['top','bottom'],function(side){
				if(item[side+'Toolbar'] && item[side+'Toolbar'].items){
					item[side+'Toolbar'].items.each(function(toolbarItem){
						subFn(toolbarItem);
					});
				}
			});
		});
	},

	initComponent		: function(){
		var that = this;
		console.log('id',that.id);
		that.restPanelId			= Ext.id();
		that.historyGridId			= Ext.id();
		that.bodyTypeId				= Ext.id();
		that.rawResultId			= Ext.id();
		that.headersResultId		= Ext.id();
		that.contentResultId		= Ext.id();
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
			})
			localStorage.setItem('history',JSON.stringify(result));
		}

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
				that.historyStore.getAt(rId).set('date',(new Date()).format('Y-m-d H:i:s'))
				that.historyStore.sort('date','DESC');
			}
		}

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
			header			: 'Actions',
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
					return JSON.stringify(a)
				}
			})
		});

		that.query = function(){
			var prm = that.getValues(Ext.getCmp(that.restPanelId));
			that.addHistory(prm);
			//console.log(that.generate());return;

			var mask = new Ext.LoadMask(Ext.getCmp(that.restPanelId).getEl(), {
				msg:"Please wait..."
			});
			mask.show();
			Ext.Ajax.request({
				url		: 'proxy.php?exw_action=local.rest.rest',
				jsonData: prm,
				success	: function(data){
					mask.hide();
					console.log(that);
					Ext.getCmp(that.rawResultId).setValue(data.responseText);
					var result = JSON.parse(data.responseText);
					result.body=Ext.util.base64.decode(result.body);
					Ext.getCmp(that.rawResultId).setValue(JSON.stringify(result,true,"  "));
					that.reponseHeadersStore.removeAll();
					var contentType='raw';
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
					var contentResultPanel=Ext.getCmp(that.contentResultId);
					var parent = Ext.getCmp(that.contentResultId);
					parent.doLayout();
					contentResultPanel.items.each(function(panel,k){
						if(panel.contentTypes.indexOf(contentType)!=-1 || k==contentResultPanel.items.length-1){
							parent.ownerCt.setActiveTab(parent);
							contentResultPanel.doLayout();
							contentResultPanel.layout.setActiveItem(panel);
							var contentPanel=panel.items.items[0];
							contentPanel.setValue.call(contentPanel,panel.contentTypes.join('/')+result.body)
							//console.log(panel,contentType,contentPanel,contentPanel.el,contentPanel.getEl())
							return false;
						}
					});
				},
				failure	: function(data){
					mask.hide();
					console.log(data);
				}
			});
		}

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
						that.setValues(Ext.getCmp(that.restPanelId),record.data.prm);
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
						xtype		: 'textfield',
						fieldLabel	: 'URL',
						isFormField	: true,
						name		: 'url',
						value		: 'https://',
						anchor		: '95%',
						enableKeyEvents	: true,
						listeners		: {
							'keyup'		: function(cmp,e) {
								if(e.getCharCode() == 13){
									that.query();
								}
							}
						}
					},{
						xtype		: 'combo',
						name		: 'method',
						fieldLabel	: 'Method',
						isFormField	: true,
						value		: 'GET',
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
							}]
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
								that.currentMethod = record
							}
						}
					},{
						xtype		: 'button',
						text		: 'generate',
						handler		: that.query
					},{
						xtype		: 'tabpanel',
						height		: 200,
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
							tbar		: [{
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
										combo.setValue(store.getAt(0).get('type'))
									},
									select		: function(combo,record,index){
										Ext.getCmp(that.bodyTypeId).layout.setActiveItem(record.data.cmp)
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
							}]
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
							frame		: true,
							layout		: 'card',
							height		: 'auto',
							id			: that.authorizationPanelId,
							activeItem	: 1,
							layoutConfig: {
								deferredRender	: true
							},
							tbar	: [{
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
										combo.setValue(store.getAt(0).get('type'))
									},
									select		: function(combo,record,index){
										Ext.getCmp(that.authorizationPanelId).layout.setActiveItem(record.data.cmp)
									}
								}
							}],
							items	: [{
								_title			: 'None',
								frame			: true,
								height			: 'auto',
								html			: '-'
							},{
								_title			: 'Basic',
								height			: 'auto',
								layout			: 'form',
								checkboxToggle	: true,
								items			: [{
									xtype		: 'textfield',
									fieldLabel	: 'Login',
									name		: 'authentificationBasic.login',
									isFormField	: true
								},{
									xtype		: 'textfield',
									fieldLabel	: 'Password',
									name		: 'authentificationBasic.password',
									isFormField	: true
								}]
							}]
						}]
					}]
				},{
					region		: 'center',
					xtype		: 'tabpanel',
					frame		: true,
					border		: false,
					activeTab	: 1,
					items		: [{
						title				: 'Raw',
						forceLayout			: true,
						id					: that.rawResultId,
						hideMode			: 'offsets',
						xtype				: 'ux-codemirror',
						codeMirrorConfig	: {
							language			: 'javascript',
							lineNumbers			: true
						}
					},{
						title				: 'Headers',
						id					: that.headersResultId,
						xtype				: 'grid',
						hideMode			: 'offsets',
						store				: that.reponseHeadersStore,
						autoExpandColumn	: 'autoexpand',
						columns				: [{
							header	: 'key'		, dataIndex	:'key'	, width	: 300
						},{
							header	: 'value'	, dataIndex	:'value', id	:'autoexpand'
						}]
					},{
						title				: 'Content',
						id					: that.contentResultId,
						layout				: 'card',
						layoutConfig		: {
							deferredRender	: true
						},
						items				: [{
							contentTypes		: ['none/none']
						},{
							contentTypes		: ['application/xml','text/xml'],
							layout				: 'fit',
							items				: [{
								xtype				: 'ux-codemirror',
								hideMode			: 'offsets',
								codeMirrorConfig	: {
									language			: 'xml',
									lineNumbers			: true
								}
							}]
						},{
							contentTypes		: ['application/js','application/json','application/javascript'],
							layout				: 'fit',
							items				: [{
								xtype				: 'ux-codemirror',
								hideMode			: 'offsets',
								codeMirrorConfig	: {
									language			: 'javascript',
									lineNumbers			: true
								}
							}]
						},{
							contentTypes		: ['text/html','application/html'],
							layout				: 'fit',
							items				: [{
								xtype				: "iframepanel",
								autoScroll			: true,
								setValue			: function(v){
									this.getFrameBody().innerHTML=v
								}
							}]
						},{
							contentTypes		: ['raw','text/plain'],
							layout				: 'fit',
							items				: [{
								xtype				: "iframepanel",
								autoScroll			: true,
								setValue			: function(v){
									this.getFrameBody().innerHTML= '<pre>'+v+'</pre>';
								}
							}]
						}]
					}]
				}]
			} ]
		});
		Ext.eu.sm.rest.mainPanel.superclass.initComponent.call(this);
	}
});
Ext.reg('rest.mainPanel',Ext.eu.sm.rest.mainPanel);