
Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.FolderSelect = Ext.extend(Ext.grid.GridPanel, {
	folderTreeId	: true,
	debug			: false,
	filterString	: '',

	initComponent	: function (){
		var that = this;
		that.folderStore	= new Ext.data.JsonStore({
			fields	: [
				'id',
				'shortcut',
				'subText',
				'longText'
			],
			proxy	: new Ext.data.MemoryProxy([])
		});

		this.addEvents('selected');

		Ext.apply(that,{
			store				: that.folderStore,
			loadMask			: true,
			hideHeaders			: true,
			autoExpandColumn	: 'longText',
			columns				: [
				{dataIndex: 'longText'	,fixed:false,width:200,id : 'longText'	,renderer : function(v){
					var aFolder = v.split('/');
					var color;
					for(var k in aFolder){
						if(parseInt(k)==k){
							v = aFolder[k];
							if(v){
								if(k==that.filterString.length){
									color='red';
								}else if(k<that.filterString.length){
									color='green';
								}else{
									color='blue';
								}
								aFolder[k] = '<span style="font-weight:bold;color:'+color+'">'+v.substr(0,1)+'</span><span style="color:gray">'+v.substr(1)+"</span>";
							}else{
								delete (aFolder[k]);
							}
						}
					}
					v = aFolder.join('/');
					return v;
				}},
				{dataIndex: 'shortcut'	,fixed:true,width: 30,id : 'sortcut'	}
			]
		});

		Ext.eu.sm.MailBox.FolderSelect.superclass.initComponent.call(this);

		this.on('rowdblclick'	, function(grid,rowIndex,e) {
			that.fireEvent("selected",grid.getStore().getAt(rowIndex));
		});

		this.on('keydown'	, function(e) {
			try{
				var oldFilterString = that.filterString;

				var findFilterString = function(subFilter){
					return function(v,k){
						if(subFilter && v.get('shortcut').substring(0,subFilter.length) == subFilter){
							return true;
						}
					}
				}
				if(e.getKey() == e.BACKSPACE || e.getKey() == e.DELETE){
					if(that.filterString.length>0){
						that.filterString = that.filterString.substring(0,that.filterString.length-1)
					}else{
						if (that.debug) console.log('too short');
					}
				}else if(e.getKey() == e.TAB || e.getKey() == e.UP || e.getKey() == e.DOWN || e.getKey() == e.LEFT ||e.getKey() == e.RIGHT  ){
					if (that.debug) console.log('special keys');
					e.preventDefault();
					return;
				}else if(e.getKey() == e.ENTER && that.getSelectionModel().getSelected()  ){
					that.fireEvent("selected",that.getSelectionModel().getSelected());
					e.preventDefault();
					return;
				}else if(e.getKey() == e.ESC  ){
					that.fireEvent("cancel");
					e.preventDefault();
					return;
				}else{
					var tmpFilter = (that.filterString + String.fromCharCode(e.getCharCode())).toLowerCase();

					if(that.store.findBy(findFilterString(tmpFilter))!=-1){
						that.filterString = tmpFilter;
					}
				}
				if(oldFilterString != that.filterString){
					that.store.clearFilter();
					if(that.filterString){
						that.store.filterBy(findFilterString(that.filterString));
					}
					that.getSelectionModel().selectRow(0)
					that.getView().focusRow(0);
				}
				if (that.debug) console.log(that.filterString);
			}catch(e){
				console.log(e);
			}
			e.preventDefault();
		});

		this.on('render'	, function(e) {
			window.setTimeout(function(){
				Ext.getCmp(that.folderTreeId).getFlatStructure(that.folderStore);
				that.getSelectionModel().selectRow(0)
				that.getView().focusRow(0);
			},150);
		});
	}
});

Ext.reg('mailbox.folderselect',Ext.eu.sm.MailBox.FolderSelect);