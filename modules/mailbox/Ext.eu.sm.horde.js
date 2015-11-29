Ext.ns('Ext.eu.sm');
Ext.eu.sm.horde={
	JSON:{
		parse	: function (jsonString){
			return JSON.parse(jsonString.replace(/^\/\*-secure-/,'').replace(/\*\/$/,''));
		}
	},
	tree : {
		convert : function(aMailboxes){
			try {
				var aTree=[];
				var aTreeTmp={};
				aMailboxes.sort(function(a, b) {
					if (Ext.util.base64.decode(a.m)>Ext.util.base64.decode(b.m)){
						return -1;
					}
					if (Ext.util.base64.decode(a.m)<Ext.util.base64.decode(b.m)){
						return 1;
					}
					return 0;
				});

				Ext.each(aMailboxes,function(v){
					v.text			= v.l;
					v.id			= v.m;
					v.leaf			= !(v.hasOwnProperty('ch') && v.ch>0);
					v.folderType	= 'folder';
					aTreeTmp[v.m]=v;
				});

				for(var k in aTreeTmp){
					if(aTreeTmp.hasOwnProperty(k)){
						var v = Ext.apply({},aTreeTmp[k]);
						if (v.pa){
							if(aTreeTmp[v.pa]){
								var subf = aTreeTmp[v.pa];
							}else{
								var subf = aTreeTmp;
							}

							if(!subf.hasOwnProperty('children')){
								subf['children']=[];
							}
							subf['children'].push(v);
							delete aTreeTmp[k];
						}
					}
				}
				for(var k in aTreeTmp){
					if(aTreeTmp.hasOwnProperty(k)){
						aTree.push(aTreeTmp[k]);
					}
				}
				aTree.sort(function(a, b) {
					if (Ext.util.base64.decode(a.m)<Ext.util.base64.decode(b.m)){
						return -1;
					}
					if (Ext.util.base64.decode(a.m)>Ext.util.base64.decode(b.m)){
						return 1;
					}
					return 0;
				});
				console.log(aTree);
				//tree.loader.load(tree.getRootNode());

				return Ext.eu.sm.tree.utils.deepCopy(aTree);
			}catch(e){
				console.error(e);
				return 0;
			}
		}
	}
}