Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.service = function(cfg){
	var that = this;
	Ext.apply(that, cfg);

	that.addEvents({
		'initDone'	: true,
	});

	that.config={
		url		: 'http://local-redmine.home.micoli.org:3000/',
		apiKey	: 'f2f7e1f362279aff0e5ae545f3f569d40c3b23a8'
	};

	Ext.org.micoli.redmine.service.request								= that.request;
	Ext.org.micoli.redmine.service.requestPrm							= that.requestPrm;
	Ext.org.micoli.redmine.service.projectsTree							= null;
	Ext.org.micoli.redmine.service.projectsList							= null;
	Ext.org.micoli.redmine.service.users								= null;
	Ext.org.micoli.redmine.service.trackers								= null;
	Ext.org.micoli.redmine.service.issue_statuses						= null;
	Ext.org.micoli.redmine.service.custom_fields						= null;
	Ext.org.micoli.redmine.service.enumerations							= {};
	Ext.org.micoli.redmine.service.enumerations.issue_priorities		= null;
	Ext.org.micoli.redmine.service.enumerations.time_entry_activities	= null;

	Ext.org.micoli.redmine.service.displayErrors = function(values){
		if(!Ext.isArray(values)){
			values=[values];
		}
		Ext.eu.sm.toaster.msg('Error','<ul><li>'+values.join('</li><li>')+'</li></ul>');
	}

	Ext.org.micoli.redmine.service.requestFailure	= function (response,request){
		console.log(response);
		var j = Ext.util.JSON.decode(response.responseText);
		Ext.org.micoli.redmine.service.displayErrors(j&&j.errors?j.errors:response.responseText)
	}

	if(!that.isReady){
		Ext.MessageBox.show({
			title		: 'Please wait',
			msg			: 'Loading redmine items...',
			progressText: 'Initializing...',
			width		: 300,
			progress	: true,
			closable	: false
		});
		that.init();
	}
};

Ext.extend(Ext.org.micoli.redmine.service, Ext.util.Observable, {

	isReady			: false,

	makeComboCfg	: function (data,subKey){
		var obj={};
		obj.raw = data[subKey];
		obj.comboCfg={
			xtype			: 'combo',
			store			: new Ext.data.JsonStore({
				fields			: [
					'id',
					'name'
				],
				idProperty		: 'id',
				data			: obj.raw,
				proxy			: new Ext.data.MemoryProxy([])
			}),
			displayField	: 'name',
			valueField		: 'id',
			emptyText		: 'Select a value...',
			mode			: 'local',
			triggerAction	: 'all',
			typeAhead		: true,
			forceSelection	: true,
			selectOnFocus	: true,
		}
		return obj;
	},

	init		: function (){
		var that = this;
		var nbDone=0;
		var done = function(v){
			nbDone++;
			Ext.MessageBox.updateProgress(nbDone/cfgs.length, Math.round(100*nbDone/cfgs.length)+'% completed');
			if(nbDone==cfgs.length){
				Ext.MessageBox.hide();
				that.isReady=true;
				that.fireEvent('initDone', Ext.org.micoli.redmine.service);
			}
		}
		var currentService = Ext.org.micoli.redmine.service;
		var cfgs = [{
			url		: 'projects.json',
			params	:{
				include : 'trackers,issue_categories'
			},
			success	: function(data){
				currentService.projectsTree=[];
				currentService.projectsList=data.projects;
				var collection = {};
				Ext.each(data.projects.reverse(),function(v){
					collection['_'+v.id]={
							id			: v.id,
							text		: v.name,
							name		: v.name,
							identifier	: v.identifier,
					};
					if(v.parent){
						collection['_'+v.id].parent='_'+v.parent.id;
					}
				});
				for(var k in collection){
					if(collection.hasOwnProperty(k)){
						var v = collection[k];
						if(v.parent){
							var parent = collection[v.parent];
							if (!parent.children) parent.children=[];
							parent.children.unshift(Ext.apply({},v));
							delete (collection[k]);
						};
					}
				};
				currentService.projectsTree = [];
				for(var k in collection){
					if(collection.hasOwnProperty(k)){
						currentService.projectsTree.unshift(collection[k])
					}
				}
				var finalizeNodes = function (a){
					Ext.each(a,function(v){
						if(v.children){
							v.leaf=false;
							v.expanded=true;
							finalizeNodes(v.children);
						}else{
							v.leaf=true;
						}
					})
				}
				finalizeNodes(currentService.projectsTree);
			}
		},{
			url		: 'users.json',
			success	: function(data){
				currentService.enumerations.users=that.makeComboCfg(data,'users');
				if(!currentService.enumerations.users.dynStore){
					currentService.enumerations.users.dynStore = new Ext.data.JsonStore({
						fields			: [
							'id',
							'login',
							'mail',
							'lastname',
							'firstname',
							'fullname'
						],
						root			: 'users',
						idProperty		: 'id',
						remoteSort		: true,
						autoLoad		: true,
						proxy			: new Ext.data.HttpProxy(that.requestPrm({
							method			: 'GET',
							url				: 'users.json',
						})),
						listeners		: {
							load			: function(store,records){
								Ext.each(records,function(v){
									v.set('fullname',v.get('firstname')+' '+v.get('lastname'))
								})
							}
						}
					});
				}
				currentService.enumerations.users.dynComboCfg = {
					xtype			: 'combo',
					store			: currentService.enumerations.users.dynStore,
					displayField	: 'fullname',
					valueField		: 'id',
					emptyText		: 'Select an account...',
					mode			: 'remote',
					queryParam		: 'name',
					triggerAction	: 'all',
					queryDelay		: 300,
					typeAhead		: true,
					forceSelection	: true,
					tpl				: '<tpl for="."><div class="x-combo-list-item"><div><b>{login}</b>, {mail}</div><div><i>{firstname} {lastname}</i></div></div></tpl>',
					selectOnFocus	: true,
				}
			}
		},{
			url		: 'custom_fields.json',
			success	: function(data){
				currentService.custom_fields={};
				Ext.each(data.custom_fields,function(cf){
					if(!currentService.custom_fields.hasOwnProperty(cf.customized_type)){
						currentService.custom_fields[cf.customized_type]={};
					}
					currentService.custom_fields[cf.customized_type][cf.name] = cf;
				});
				console.log(currentService.custom_fields)
			}
		},{
			url		: 'trackers.json',
			success	: function(data){
				currentService.enumerations.trackers = that.makeComboCfg(data,'trackers');
			}
		},{
			url		: 'issue_statuses.json',
			success	: function(data){
				currentService.enumerations.issue_statuses = that.makeComboCfg(data,'issue_statuses');
			}
		},{
			url		: 'enumerations/issue_priorities.json',
			success	: function(data){
				currentService.enumerations.issue_priorities = that.makeComboCfg(data,'issue_priorities');
			}
		},{
			url		: 'enumerations/time_entry_activities.json',
			success	: function(data){
				currentService.enumerations.time_entry_activities = that.makeComboCfg(data,'time_entry_activities');
				currentService.enumerations.defaultTimeEntryActivity = Ext.value(currentService.enumerations.time_entry_activities.raw[0],{id:0,name:''});
			}
		}];

		//cfgs=[{}];
		//done();

		Ext.each(cfgs,function(v){
			that.request({
				url : v.url,
				success : function(data){
					eval('var data = '+data.responseText);
					v.success(data);
					done(v);
				}
			});
		});

	},

	requestPrm : function (conf){
		var that = this;
		return  Ext.apply(conf,{
			url		: that.config.url + conf.url,
			headers	: Ext.apply(conf.headers||{},{
				'X-Redmine-API-Key'	: that.config.apiKey
			})
		});
	},

	request : function (conf){
		var that = this;
		//return Ext.eu.sm.cors.Ajax.request(that.requestPrm(conf));
		return Ext.Ajax.request(that.requestPrm(conf));
	}
});