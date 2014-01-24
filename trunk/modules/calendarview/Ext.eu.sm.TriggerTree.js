Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm');

Ext.eu.sm.TriggerTree = Ext.extend(Ext.form.TriggerField, {
	defaultAutoCreate	: {
		tag					: "input",
		type				: "text",
		size				: "24",
		autocomplete		: "off"
	},
	listClass			: '',
	selectedClass		: 'x-combo-selected',
	triggerClass		: 'x-form-arrow-trigger',
	shadow				: 'sides',
	listAlign			: 'tl-bl?',
	maxHeight			: 300,
	listHeight			: 250,
	minHeight			: 90,
	queryDelay			: 500,
	selectOnFocus		: false,
	loadingText			: 'Loading...',
	resizable			: true,
	handleHeight		: 8,
	editable			: false,
	allQuery			: '',
	minListWidth		: 70,
	forceSelection		: false,
	valueField			: 'id',
	displayField		: 'text',
	displayPath			: true,
	displayPathSeparator: '/',
	noSelectEvent		: false,

	initComponent : function(){
		var that = this;

		if(!that.treeRoot){
			that.treeRoot = new Ext.tree.AsyncTreeNode({
				text			: '--',
				id				: 'root',
				expanded		: true,
				children		: that.children
			});
			that.treePreloader = new Ext.tree.TreeLoader({
				preloadChildren	: true,
				clearOnLoad		: false,
			});
			that.treePreloader.doPreload(that.treeRoot);
		}

		that.addEvents(
				'expand'		,
				'collapse'		,
				'beforeselect'	,
				'select'
		);
		Ext.eu.sm.TriggerTree.superclass.initComponent.call(this);
	},


	onRender : function(ct, position){
		var that = this;
		Ext.eu.sm.TriggerTree.superclass.onRender.call(this, ct, position);

		if(that.hiddenName){
			that.hiddenField = that.el.insertSibling({
				tag		: 'input',
				type	: 'hidden',
				name	: that.hiddenName,
				id		: (that.hiddenId||that.hiddenName)
			}, 'before', true);

			// prevent input submission
			that.el.dom.removeAttribute('name');
		}

		if(Ext.isGecko){
			that.el.dom.setAttribute('autocomplete', 'off');
		}

		that.on('focus', that.initTree, this, {single: true});

		if(!that.editable){
			that.editable = true;
			that.setEditable(false);
		}
	},

	initValue : function(){
		var that = this;
		var node;
		that.doSelectEvent=false;
		if(node = Ext.eu.sm.treeUtils.findDeepChildNode(that.treeRoot,'id',that.value)){
			that.select(node, true);
		}
		Ext.eu.sm.TriggerTree.superclass.initValue.call(this);
		that.doSelectEvent=true;

		if(that.hiddenField){
			that.hiddenField.value =
				that.hiddenValue !== undefined ? that.hiddenValue :
				that.value !== undefined ? that.value : '';
		}
	},

	initTree : function(){
		var that = this;
		if(!that.treeLayer){
			var cls = 'x-combo-list';

			that.treeLayer = new Ext.Layer({
				shadow: that.shadow, cls: [cls, that.listClass].join(' '), constrain:false
			});

			var lw = that.listWidth || Math.max(that.wrap.getWidth(), that.minListWidth);
			that.treeLayer.setWidth(lw);
			that.treeLayer.swallowEvent('mousewheel');
			that.assetHeight = 0;

			that.innerTree = that.treeLayer.createChild({
				cls	:cls+'-inner'
			});

			that.tree = new Ext.tree.TreePanel(Ext.apply({
				applyTo			: that.innerTree,
				height			: that.listHeight,
				animate			: true,
				rootVisible		: false,
				containerScroll	: true,
				root			: that.treeRoot,
				keyNav			: new Ext.KeyNav(that.innerTree, {
					'esc' : function(e){
						that.collapse();
						that.el.focus();
					},

					scope : that
				})
				//loader			: that.treePreloader
			},that.treeConfig || {}));

			that.tree.on('click', that.select,this);

			if(that.value){
				var nodeId = that.tree.getNodeById(that.value);
				if(nodeId){
					that.tree.getSelectionModel().select(nodeId);
				}
			}

			that.innerTree.setWidth(lw - that.treeLayer.getFrameWidth('lr'));

			if(that.resizable){
				that.resizer = new Ext.Resizable(that.treeLayer,  {
					pinned	:true,
					handles	:'se'
				});
				that.resizer.on('resize', function(r, w, h){
					that.maxHeight = h-that.handleHeight-that.treeLayer.getFrameWidth('tb')-that.assetHeight;
					that.listWidth = w;
					that.innerTree.setWidth(w - that.treeLayer.getFrameWidth('lr'));
					that.restrictHeight();
				}, this);
				this[that.pageSize?'footer':'innerTree'].setStyle('margin-bottom', that.handleHeight+'px');
			}
		}
	},

	initEvents : function(){
		var that = this;

		Ext.eu.sm.TriggerTree.superclass.initEvents.call(this);

		that.keyNav = new Ext.KeyNav(that.el, {
			"down" : function(e){
				if(!that.isExpanded()){
					that.onTriggerClick();
				}
			},

			scope : this,

			doRelay : function(foo, bar, hname){
				if(hname == 'down' || that.isExpanded()){
					return Ext.KeyNav.prototype.doRelay.apply(this, arguments);
				}
				return true;
			},

			forceKeyDown : true
		});
		that.queryDelay = Math.max(that.queryDelay || 10, 10);

		if(that.editable !== false){
			that.el.on("keyup", that.onKeyUp, this);
		}

		if(that.forceSelection){
			that.on('blur', that.doForce, this);
		}
	},

	onDestroy : function(){
		var that = this;
		if(that.tree){
			Ext.destroy(that.tree);
		}
		if(that.treeLayer){
			that.treeLayer.destroy();
		}
		Ext.eu.sm.TriggerTree.superclass.onDestroy.call(this);
	},

	unsetDelayCheck : function(){
		var that = this;
		delete that.delayedCheck;
	},

	fireKey : function(e){
		var that = this;
		if(e.isNavKeyPress() && !that.isExpanded() && !that.delayedCheck){
			that.fireEvent("specialkey", this, e);
		}
	},

	onResize: function(w, h){
		var that = this;
		Ext.eu.sm.TriggerTree.superclass.onResize.apply(this, arguments);
		if(that.treeLayer && that.listWidth === undefined){
			var lw = Math.max(w, that.minListWidth);
			that.treeLayer.setWidth(lw);
			that.innerTree.setWidth(lw - that.treeLayer.getFrameWidth('lr'));
		}
	},

	onEnable: function(){
		var that = this;
		Ext.eu.sm.TriggerTree.superclass.onEnable.apply(this, arguments);
		if(that.hiddenField){
			that.hiddenField.disabled = false;
		}
	},

	onDisable: function(){
		var that = this;
		Ext.eu.sm.TriggerTree.superclass.onDisable.apply(this, arguments);
		if(that.hiddenField){
			that.hiddenField.disabled = true;
		}
	},

	setEditable : function(value){
		var that = this;
		if(value == that.editable){
			return;
		}
		that.editable = value;
		if(!value){
			that.el.dom.setAttribute('readOnly', true);
			that.el.on('mousedown', that.onTriggerClick,  this);
			that.el.addClass('x-combo-noedit');
		}else{
			that.el.dom.removeAttribute('readOnly');
			that.el.un('mousedown', that.onTriggerClick,  this);
			that.el.removeClass('x-combo-noedit');
		}
	},

	onBeforeLoad : function(){
		var that = this;
		if(!that.hasFocus){
			return;
		}
		that.innerTree.update(that.loadingText ? '<div class="loading-indicator">'+that.loadingText+'</div>' : '');
		that.restrictHeight();
	},

	onLoad : function(){
		var that = this;
		if(!that.hasFocus){
			return;
		}
		//that.el.focus();
		var root = that.tree.getRootNode();
		if(root.hasChildNodes()){
			that.expand();
			that.restrictHeight();
			if(that.lastQuery == that.allQuery){
				if(that.editable){
					that.el.dom.select();
				}
				var n;
				if(n = Ext.eu.sm.treeUtils.findDeepChildNode(root,'text',that.value)){
					that.select(n, true);
				}
			}
		}else{
			that.onEmptyResults();
		}
	},

	getValue : function(){
		var that = this;
		if(that.valueField){
			return typeof that.value != 'undefined' ? that.value : '';
		}else{
			return Ext.eu.sm.TriggerTree.superclass.getValue.call(this);
		}
	},

	clearValue : function(){
		var that = this;
		if(that.hiddenField){
			that.hiddenField.value = '';
		}
		that.setRawValue('');
		that.lastSelectionText = '';
		that.applyEmptyText();
		that.value = '';
	},

	restrictHeight : function(){
		var that = this;
		that.innerTree.dom.style.height = '';
		var inner = that.innerTree.dom;
		var pad = that.treeLayer.getFrameWidth('tb')+(that.resizable?that.handleHeight:0)+that.assetHeight;
		var h = Math.max(inner.clientHeight, inner.offsetHeight, inner.scrollHeight);
		var ha = that.getPosition()[1]-Ext.getBody().getScroll().top;
		var hb = Ext.lib.Dom.getViewHeight()-ha-that.getSize().height;
		var space = Math.max(ha, hb, that.minHeight || 0)-that.treeLayer.shadowOffset-pad-5;
		h = Math.min(h, space, that.maxHeight);

		that.innerTree.setHeight(h);
		that.treeLayer.beginUpdate();
		that.treeLayer.setHeight(h+pad);
		that.treeLayer.alignTo(that.wrap, that.listAlign);
		that.treeLayer.endUpdate();
	},

	onEmptyResults : function(){
		var that = this;
		that.collapse();
	},

	isExpanded : function(){
		var that = this;
		return that.treeLayer && that.treeLayer.isVisible();
	},

	setValue : function(v,textv){
		var that = this;
		var text = v;
		if(!textv && that.treeRoot){
			var node = Ext.eu.sm.treeUtils.findDeepChildNode(that.treeRoot,that.valueField,v);
			if(node){
				if(that.displayPath){
					textv = '';
					node.bubble(function(n){
						if(n.parentNode){
							textv = n.attributes[that.displayField]+(textv?that.displayPathSeparator+textv:'');
						}
					});
				}else{
					textv = node.attributes[that.displayField];
				}
				if(!that.doSelectEvent || that.fireEvent('beforeselect', that, v,that.value,node) !== false ){
					that.lastSelectionText = textv;
					if(that.hiddenField){
						that.hiddenField.value = v;
					}
					Ext.eu.sm.TriggerTree.superclass.setValue.call(this, textv);
					that.value = v;
					if(that.doSelectEvent){
						that.fireEvent('select', that, v,node );
					}
				}
			}
		}
	},

	select : function(node){
		var that = this;
		that.setValue(node.attributes[that.valueField]);
		if(that.tree){
			that.tree.getSelectionModel().select(node)
		}
	},

	onKeyUp : function(e){
		var that = this;
		if(that.editable !== false && !e.isSpecialKey()){
			that.lastKey = e.getKey();
		}
	},

	validateBlur : function(){
		var that = this;
		return !that.treeLayer || !that.treeLayer.isVisible();
	},

	doForce : function(){
		var that = this;
		if(that.el.dom.value.length > 0){
			that.el.dom.value =
				that.lastSelectionText === undefined ? '' : that.lastSelectionText;
			that.applyEmptyText();
		}
	},

	collapse : function(){
		var that = this;
		if(!that.isExpanded()){
			return;
		}
		that.treeLayer.hide();
		Ext.getDoc().un('mousewheel', that.collapseIf, this);
		Ext.getDoc().un('mousedown', that.collapseIf, this);
		that.fireEvent('collapse', this);
	},

	collapseIf : function(e){
		var that = this;
		if(!e.within(that.wrap) && !e.within(that.treeLayer)){
			that.collapse();
		}
	},

	expand : function(){
		var that = this;
		if(that.isExpanded() || !that.hasFocus){
			return;
		}
		that.treeLayer.alignTo(that.wrap, that.listAlign);
		that.treeLayer.show();
		that.innerTree.setOverflow('auto'); // necessary for FF 2.0/Mac
		Ext.getDoc().on('mousewheel', that.collapseIf, this);
		Ext.getDoc().on('mousedown', that.collapseIf, this);
		that.fireEvent('expand', this);
	},

	// Implements the default empty TriggerField.onTriggerClick function
	onTriggerClick : function(){
		var that = this;
		if(that.disabled){
			return;
		}
		if(that.isExpanded()){
			that.collapse();
			that.el.focus();
		}else {
			that.onFocus({});
			that.onLoad();
			if(that.tree){
				var node = that.tree.getSelectionModel().getSelectedNode();
				if(node){
					setTimeout(function(){
						node.getUI().focus();
					},50);
				}
			}
		}
	}
});
Ext.reg('triggertree', Ext.eu.sm.TriggerTree);