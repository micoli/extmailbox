Ext.ns('Ext.eu.sm.tree.utils');

/**
 * @redmine #3582	 : RH Tools
 *
 * http://mishranam.blogspot.fr/2012/01/getting-all-childnodes-including-at-all.html
 *
 * Following Function recurses through all nodes under the given node,
 * and return an Array of AsyncTreeNode objects (containing itself)
 * (Note - If the given Object is not desired in returned array can be easily
 *  removed, using splice/slice methods of JS Array methods)
 */
/*
Ext.eu.sm.tree.utils.getDeepAllChildNodes = function(node){
	var that = this;
	var allNodes = new Array();
	if(!Ext.value(node,false)){
		return [];
	}

	if(!node.hasChildNodes()){
		return node;
	}else{
		allNodes.push(node);
		node.eachChild(function(Mynode){
			allNodes = allNodes.concat(Ext.eu.sm.tree.utils.getDeepAllChildNodes(Mynode));
		});
	}
	return allNodes;
};
*/
Ext.eu.sm.tree.utils.getDeepAllChildNodes = function(node){
	var allNodes = [];
	var addNo = function(nod){
		if(!Ext.value(nod,false)){
			return;
		}
		allNodes.push(nod);
		/*if(nod.renderChildren){
			nod.renderChildren(true);
		}*/
		if(nod.childNodes && nod.childNodes.length>0){
			for(var i=0;i<nod.childNodes.length;i++){
				addNo(nod.childNodes[i]);
			};
		}
	}
	addNo(node);
	//console.log(allNodes.length,allNodes);
	return allNodes;
};

Ext.eu.sm.tree.utils.findDeepChildNode = function(node,property,value){
	var that = this;
	var tmp = Ext.eu.sm.tree.utils.getDeepAllChildNodes(node);
	for(var i in tmp){
		if(tmp[i].hasOwnProperty(property) && tmp[i][property]==value){
			return tmp[i];
		}
	}
	return false;
};

/*Ext.eu.sm.tree.utils.findDeepChildNode = function(node,property,value){
	var that = this;
	var tmp = Ext.eu.sm.tree.utils.getDeepAllChildNodes(node);
	var res = false;
	Ext.each(tmp,function(it){
		if(it.hasOwnProperty(property) && it[property]==value){
			res=it;
			return false;
		}
	});
	return res;
};
*/
Ext.eu.sm.tree.utils.eachChildren = function(tree,fn,childrenPropertyName){
	childrenPropertyName = childrenPropertyName||'children';
	var fnRecurs = function(node,parent,key){
		var res = fn(node,parent,key);
		if(res!==false){
			if(node && Ext.isArray(node[childrenPropertyName])){
				Ext.each(node[childrenPropertyName],function(v,k){
					fnRecurs(v,node[childrenPropertyName],k);
				});
			}
		}
	}

	if(tree[childrenPropertyName]){
		fnRecurs(tree,tree,null);
	}else{
		for(var t in tree){
			if(tree.hasOwnProperty(t)){
				fnRecurs(tree[t],tree,t);
			}
		}
	}
	return tree;
}

Ext.eu.sm.tree.utils.deepCopy = function(p, c) {
	c = c || (p.constructor === Array ? [] : {});
	for (var i in p) {
		if (typeof p[i] === 'object' && p[i] !== null) {
			c[i] = p[i].constructor === Array ? [] : {};
			Ext.eu.sm.tree.utils.deepCopy(p[i], c[i]);
		} else {
			c[i] = p[i];
		}
	}
	return c;
};

Ext.eu.sm.tree.utils.loadTree = function(tree,children){
	var root = tree.getRootNode();
	while(root.firstChild) {
		root.removeChild(root.firstChild);
	}
	Ext.each(children,function(n){
		root.appendChild(new Ext.tree.AsyncTreeNode(n))
	});
}

Ext.eu.sm.tree.utils.filterTree = function (tree,val,fn,textProperty){
	textProperty = textProperty || 'text';
	fn = fn || function(vval,node){
		return vval && node[textProperty].toLowerCase().indexOf(vval)!=-1;
	}

	var setBold = function(node,force){
		if(!node.hasOwnProperty('originalText')){
			node.originalText = node[textProperty]
		}
		if(force){
			node.setText('<b>'+node.originalText+'</b>');
		}else{
			node.setText(node.originalText);
		}
	}
	tree.getRootNode().cascade(function(node){
		var test = fn(val,node)
		setBold(node,test);
		if(test){
			node.bubble(function(node2){
				setBold(node2,true);
			});
		}
	});
}
