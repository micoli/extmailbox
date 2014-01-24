Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm');
Ext.ns('Ext.eu.sm.treeUtils');

/**
 * http://mishranam.blogspot.fr/2012/01/getting-all-childnodes-including-at-all.html
 *
 * Following Function recurses through all nodes under the given node,
 * and return an Array of AsyncTreeNode objects (containing itself)
 * (Note - If the given Object is not desired in returned array can be easily
 *  removed, using splice/slice methods of JS Array methods)
 */
Ext.eu.sm.treeUtils.getDeepAllChildNodes = function(node){
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
			allNodes = allNodes.concat(Ext.eu.sm.treeUtils.getDeepAllChildNodes(Mynode));
		});
	}
	return allNodes;
};

Ext.eu.sm.treeUtils.findDeepChildNode = function(node,property,value){
	var that = this;
	var tmp = Ext.eu.sm.treeUtils.getDeepAllChildNodes(node);
	for(var i in tmp){
		if(tmp[i].hasOwnProperty(property) && tmp[i][property]==value){
			return tmp[i];
		}
	}
	return false;
};

Ext.eu.sm.treeUtils.eachChildren = function(tree,fn){
	var fnRecurs = function(node){
		fn(node);
		if(node.children){
			for(var t in node.children){
				fnRecurs(node.children[t]);
			}
		}
	}
	if(tree.children){
		fnRecurs(tree);
	}else{
		for(var t in tree){
			fnRecurs(tree[t]);
		}
	}
}