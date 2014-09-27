Ext.define('Ext.modules.redmine4.service', {
	extend		: 'Ext.util.Observable',
	alias		: 'widget.redmine4_service',
	isReady		: false,
	singleton	: true,

	projectTree		: null,

	config			: {
		url				: 'http://redmine.home.micoli.org:3000/',
		apiKey			: 'f2f7e1f362279aff0e5ae545f3f569d40c3b23a8'
	},

	constructor		: function (config){
		var that = this;

		Ext.apply(that, config || {});

		that.addEvents({
			'projectLoaded'	: true,
		});

		this.callParent(this);

		that.projectTree = null;
		that.initProjects();
	},

	initProjects	: function (){
		var that = this;

		Ext.Ajax.request(this.request({
			url		: 'projects.json',
			success	: function(data){
				that.projectTree=[];
				eval('var result = '+data.responseText);
				var collection = {};
				Ext.each(result.projects.reverse(),function(v){
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
				that.projectTree = [];
				for(var k in collection){
					if(collection.hasOwnProperty(k)){
						that.projectTree.unshift(collection[k])
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
				finalizeNodes(that.projectTree);
				//that.fireEvent('projectsLoaded', that.projectTree);
			}
		}));
	},

	request : function (conf){
		var that = this;
		return Ext.apply(conf,{
			url		: that.config.url + conf.url,
			headers	: {
				'X-Redmine-API-Key'	: that.config.apiKey
			}
		});
	}
});