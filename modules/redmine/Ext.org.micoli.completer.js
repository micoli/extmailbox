Ext.ns('Ext.org.micoli');

Ext.org.micoli.completer = function(cfg){
	var that = this;
	Ext.apply(that, cfg);
	that.addEvents({
		'expand'	: true,
		'collapse'	: true
	});
	that.textAreaPositioner = new maxkir.CursorPosition(that.cmp.el.dom, 0);
	that.initList();
}

Ext.extend(Ext.org.micoli.completer, Ext.util.Observable, {
	plugins				: [],
	lastWordRegexp		: /[^\n\s]*$/,
	selectedClass		:'x-combo-selected',
	classList			: '',
	shadow				: 'sides',
	minListWidth		: 120,
	listWidth			: 120,
	tpl					: null,
	isExpanded			: false,
	hasFocus			: false,
	inKeyMode			: false,
	listCls				: 'x-combo-list',
	queryDelay			: 500,
	selLen				: -1,
	selStart			: -1,

	initList			: function(){
		var that = this;

		that.mode = 'local';
		Ext.each(that.plugins, function(v){
			if(v.mode=='remote'){
				that.mode='remote';
				return false;
			}
		});

		that.queryDelay = Math.max(that.queryDelay || 10,that.mode == 'local' ? 10 : 250);
		that.taTask	= new Ext.util.DelayedTask();
		that.store	= new Ext.data.JsonStore({
			fields			: [
				'id',
				'group',
				'display',
				'pluginidx'
			],
			root			: 'root',
			proxy			: new Ext.data.MemoryProxy({}),
			sortInfo		: {
				field			: 'group',
				direction		: 'ASC'
			}
		});

		/*that.store.loadData({
			root	: [
				{id:1,group:'aa',display:'val1'},
				{id:2,group:'aa',display:'val2'},
				{id:3,group:'bb',display:'val3'},
				{id:4,group:'cc',display:'val4'},
				{id:5,group:'cc',display:'val5'},
				{id:6,group:'cc',display:'val6'}
			]
		});*/

		if(!that.list){
			if(!that.tpl){
				that.tpl			= new Ext.XTemplate(
					'{[this.initHeader()]}' +
					'<div class="completer-grouped-list">' +
					'	<tpl for=".">',
					//'{[console.log(values)]}' +
					'		<tpl if="this.shouldShowHeader(group)">' +
					'			<div class="completer-group-header '+that.listCls+'-header" style="font-weight:bold;">{[this.showHeader(values.group)]}</div>' +
					'		</tpl>' +
					'		<div class="completer-group-item '+that.listCls+'-item">{display}</div>',
					'	</tpl>',
					'</div>',{
					initHeader: function(key){
						this.currentKey = null;
						return '';
					},
					shouldShowHeader: function(key){
						return this.currentKey != key;
					},
					showHeader: function(key){
						this.currentKey = key;
						return key;
					}
				});
			}

			that.list = new Ext.Layer({
				shadow		: that.shadow,
				cls			: [that.listCls, that.classList].join(' '),
				constrain	: false
			});

			var lw = that.listWidth || Math.max(that.wrap.getWidth(), that.minListWidth);
			that.list.setWidth(lw);
			that.list.setHeight(200);
			that.list.swallowEvent('mousewheel');
			that.assetHeight = 0;

			that.innerList = that.list.createChild({
				cls			: that.listCls+'-inner',
			});
			that.innerList.on('mouseover', that.onViewOver, that);
			that.innerList.on('mousemove', that.onViewMove, that);
			that.innerList.setWidth(lw - that.list.getFrameWidth('lr'));
			that.innerList.setHeight(200);

			that.view = new Ext.DataView({
				applyTo			: that.innerList,
				tpl				: that.tpl,
				singleSelect	: true,
				selectedClass	: that.selectedClass,
				itemSelector	: that.itemSelector || '.' + that.listCls + '-item',
				store			: that.store
			});

			that.view.on('click', that.onViewClick, that);
		}
		that.initStores();
	},

	initStores	: function(){
		var that = this;
		Ext.each(that.plugins, function(plugin,k){
			plugin.store.completePlugin = that.plugins[k];
			if (!plugin.renderer){
				plugin.renderer = function(v){
					return v.get('display');
				};
			}
			plugin.store.on('datachanged', function (pluginStore){
				that.cleanStoreForGroup(pluginStore.completePlugin.group);
				var previousStoreCount = that.store.getCount();
				if(!plugin.store.clearing){
					that.store.suspendEvents();
					if (plugin.store.formatRecords){
						plugin.store.formatRecords.call(plugin.store);
					}
					pluginStore.each(function(record){
						that.store.addSorted(new that.store.recordType({
							id			: record.get('id'),
							display		: record.get('display'),
							group		: plugin.group,
							pluginidx	: k
						}));
					});
					that.store.resumeEvents();
					that.store.fireEvent('datachanged',that.store);
					if(previousStoreCount==0){
						that.select(0);
					}
				}
			});
		});
	},

	cleanStoreForGroup		: function(group){
		var that = this;
		for (var recordId=that.store.data.items.length-1; recordId>=0; recordId-- ){
			if(that.store.getAt(recordId).get('group')==group){
				that.store.removeAt(recordId);
			}
		}
	},

	showStoreLoading		: function (plugin,pluginidx){
		var that = this;
		that.store.suspendEvents();
		that.store.addSorted(new that.store.recordType({
			id			: '**-l-*-o-*-a-*-d-*-i-*-n-*-g-**',
			display		: '<div class="loading-indicator">loading</div>',
			group		: plugin.group,
			pluginidx	: pluginidx
		}));
		that.store.resumeEvents();
		that.store.fireEvent('datachanged',that.store);
	},

	onPrivateSearch			: function(pluginsId,strMatch/*args*/){
		var that = this;
		that.store.removeAll();
		Ext.each(pluginsId, function(kPlugin){
			var plugin = that.plugins[kPlugin];
			plugin.store.clearing=true;
			plugin.store.clearFilter(true);
			plugin.store.clearing=false;
			switch (plugin.mode){
				case 'local':
					plugin.store.filter('display',strMatch);
				break;
				case 'remote':
					var param = {};
					that.showStoreLoading(plugin,kPlugin);
					param[plugin.queryParam] = strMatch;
					plugin.store.load({params : param});
				break;
			}
		});
	},



	keyup	: function(e){
		var that = this;
		switch (e.keyCode) {
			case 40: // DOWN
			case 38: // UP
			return true;
		}
		if (e.ctrlKey) switch (e.keyCode) {
			case 78: // Ctrl-N
			case 80: // Ctrl-P
			return true;
		}

		var exprs = that.getTextFromHeadToCaret();
		var detectedPlugins=[];
		var strMatch = '';

		Ext.each(that.plugins, function(v,k){
			var match;
			if (match = exprs[0].match(v.tagMask)){
				detectedPlugins.push(k);
				strMatch		= match[1]
			}
		});

		if(detectedPlugins.length){
			that.taTask.cancel();
			//console.log('detectedPlugins',detectedPlugins);
			that.taTask.delay(that.queryDelay,that.onPrivateSearch,that,[detectedPlugins,strMatch]);

			var pos= that.textAreaPositioner.getPixelCoordinates();
			that.expand({
				x : pos[0]+that.cmp.el.getX(),
				y : pos[1]+that.cmp.el.getY()
			});
		}else{
			that.collapse();
		}
	},

	keydown	: function(e){
		var that = this;
		if(that.isExpanded()){
			switch (e.keyCode) {
				case 27: // ESC
					that.collapse();
					e.stopEvent();
					return false;
				break;
				case 38: // UP
					that.selectPrev();
					e.stopEvent();
					return false;
				break;
				case 40: // DOWN
					that.selectNext();
					e.stopEvent();
					return false;
				break;
				case 13: // return
					that.insertSelected();
					e.stopEvent();
					return false;
				break;
			}
		}
		return true;
	},

	insertSelected	: function(){
		var that = this;
		var record = that.store.getAt(that.selectedIndex);
		var txt = that.plugins[record.get('pluginidx')].renderer(record);
		setTimeout(function(){
			//console.log('txt',txt,that.selLen,that.selStart);
			that.cmp.el.dom.value = that.cmp.el.dom.value.substr(0,that.selStart)+txt+that.cmp.el.dom.value.substr(that.selStart+that.selLen+1)
			that.cmp.el.dom.selectionEnd = that.selStart + txt.length;
			that.list.hide();
		},50);
	},

	getTextFromHeadToCaret	:  function() {
		var that = this;
		var text, selectionEnd, range;
		selectionEnd = that.cmp.el.dom.selectionEnd;
		if (typeof selectionEnd === 'number') {
			text = that.cmp.el.dom.value.substring(0, selectionEnd);
		} else if (document.selection) {
			range = that.cmp.el.dom.createTextRange();
			range.moveStart('character', 0);
			range.moveEnd('textedit');
			text = range.text;
		}
		var m = text.match(that.lastWordRegexp);
		that.selLen		= m[0].length-1;
		that.selStart	= text.length-that.selLen -1;
		return m;
	},

	isExpanded	: function(){
		var that = this;
		return that.list && that.list.isVisible();
	},

	onViewMove : function(e, t){
		var that = this;
		that.inKeyMode = false;
	},

	onViewOver : function(e, t){
		var that = this;
		if(that.inKeyMode){ // prevent key nav and mouse over conflicts
			return;
		}
		var item = that.view.findItemFromChild(t);
		if(item){
			var index = that.view.indexOf(item);
			that.select(index, false);
		}
	},

	selectNext : function(){
		var ct = this.store.getCount();
		if(ct > 0){
			if(this.selectedIndex == -1){
				this.select(0);
			}else if(this.selectedIndex < ct-1){
				this.select(this.selectedIndex+1,true);
			}
		}
	},

	selectPrev : function(){
		var ct = this.store.getCount();
		if(ct > 0){
			if(this.selectedIndex == -1){
				this.select(0);
			}else if(this.selectedIndex != 0){
				this.select(this.selectedIndex-1);
			}
		}
	},

	select : function(index){
		var that = this;
		that.selectedIndex = index;
		that.view.select(index);
		var el = that.view.getNode(index);
		if(el){
			that.innerList.scrollChildIntoView(el, false);
		}
	},

	onViewClick : function(doFocus){
		var that = this;
		var index = that.view.getSelectedIndexes()[0];
		var r = that.store.getAt(index);
		if(r){
			that.onSelect(r, index);
		}
		if(doFocus !== false){
			that.el.focus();
		}
	},

	expand		: function(pos){
		var that = this;
		if(that.isExpanded() ){//|| !that.hasFocus){
			return;
		}
		that.list.setLocation(pos.x,pos.y);
		that.list.show();
		that.innerList.setOverflow('auto'); // necessary for FF 2.0/Mac
		Ext.getDoc().on('mousewheel', that.collapseIf, that);
		Ext.getDoc().on('mousedown', that.collapseIf, that);
		that.fireEvent('expand', that);
		that.select(0,true);
	},

	collapse	: function(){
		var that = this;
		if(!that.isExpanded()){
			return;
		}
		that.taTask.cancel();
		that.list.hide();
		Ext.getDoc().un('mousewheel', that.collapseIf, that);
		Ext.getDoc().un('mousedown', that.collapseIf, that);
		that.fireEvent('collapse', that);
	},

	collapseIf : function(e){
		var that = this;
		if(!e.within(that.list)){
			that.collapse();
		}
	},

	onViewClick : function(){
		var that = this;
		console.log('onViewClick')
	},

	onDestroy : function(){
		var that = this;
		if(that.view){
			Ext.destroy(that.view);
		}
		if(that.list){
			if(that.innerList){
				that.innerList.un('mouseover', that.onViewOver, that);
				that.innerList.un('mousemove', that.onViewMove, that);
			}
			that.list.destroy();
		}
	}
});