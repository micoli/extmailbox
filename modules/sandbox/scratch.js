/*if(!cmp.attachedCmp || !cmp.attachedCmp.isVisible()){
if(!cmp.attachedCmp){
	cmp.attachedCmp = new Ext.eu.attachedWindow({
		//modalPanel		: that,
		resizeTriggerCmp: that,
		stickCmp		: cmp,
		width			: 150,
		height			: 150,
		items			: [{
			html			: 'eeeeee'
		}],
		listeners:{
			beforedestroy:function(){
			}
		},
		buttons			:[{
			text			: 'ok',
			handler			: function(butt){
				w.destroy();
			}
		}],
	});
	console.log('created');
}
cmp.attachedCmp.show();
console.log('display');
}else{
console.log('displayed');
}*/
/*
/*
that.createFolderMenu = function(handler,disabledId){
	var tree = Ext.getCmp(that.folderTreeId);

	var createSubMenu = function (node){
		var item={
			text	: node.text,
			id		: node.id
		};
		if(disabledId==node.id){
			item.disabledSelect = true;
		}
		item.handler = handler;
		if(node.children){
			item.menu= {
				items : []
			}
			Ext.each(node.children,function(v,k){
				item.menu.items.push(createSubMenu(v));
			});
		}
		return item;
	}

	return new Ext.menu.Menu({
		items: [createSubMenu(that.rawItems[0])]
	});
};
*/

