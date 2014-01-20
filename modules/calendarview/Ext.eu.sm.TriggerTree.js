Ext.ns('Ext.eu');
Ext.ns('Ext.eu.sm');
Ext.eu.sm.TriggerTree = Ext.extend(Ext.form.TriggerField, {
	defaultAutoCreate	: {tag: "input", type: "text", size: "24", autocomplete: "off"},
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


	/**
	 * http://mishranam.blogspot.fr/2012/01/getting-all-childnodes-including-at-all.html
	 *
	 * Following Function recurses through all nodes under the given node,
	 * and return an Array of AsyncTreeNode objects (containing itself)
	 * (Note - If the given Object is not desired in returned array can be easily
	 *  removed, using splice/slice methods of JS Array methods)
	 */
	getDeepAllChildNodes : function(node){
		var allNodes = new Array();
		if(!Ext.value(node,false)){
				return [];
		}

		if(!node.hasChildNodes()){
				return node;
		}else{
				allNodes.push(node);
				node.eachChild(function(Mynode){allNodes = allNodes.concat(getDeepAllChildNodes(Mynode));});
		}
		return allNodes;
	},

	findDeepChildNode : function(node,property,value){
		var that = this;
		var tmp = this.getDeepAllChildNodes(node);
		for(var i in tmp){
			if(tmp[i].hasOwnProperty(property) && tmp[i][property]==value){
				return tmp[i];
			}
		}
		return false;
	},

	// private
	initComponent : function(){
		Ext.eu.sm.TriggerTree.superclass.initComponent.call(this);
		this.addEvents(
			'expand',
			'collapse',
			'beforeselect',
			'select',
			'beforequery'
		);
		if(this.transform){
			this.allowDomMove = false;
			var s = Ext.getDom(this.transform);
			if(!this.hiddenName){
				this.hiddenName = s.name;
			}
			if(!this.store){
				var d = [], opts = s.options;
				for(var i = 0, len = opts.length;i < len; i++){
					var o = opts[i];
					var value = (Ext.isIE ? o.getAttributeNode('value').specified : o.hasAttribute('value')) ? o.value : o.text;
					if(o.selected) {
						this.value = value;
					}
					d.push([value, o.text]);
				}
				this.valueField = 'value';
				this.displayField = 'text';
			}
			s.name = Ext.id(); // wipe out the name in case somewhere else they have a reference
			if(!this.lazyRender){
				this.target = true;
				this.el = Ext.DomHelper.insertBefore(s, this.autoCreate || this.defaultAutoCreate);
				Ext.removeNode(s); // remove it
				this.render(this.el.parentNode);
			}else{
				Ext.removeNode(s); // remove it
			}
		}

		this.selectedNode = null;
	},

	// private
	onRender : function(ct, position){
		Ext.eu.sm.TriggerTree.superclass.onRender.call(this, ct, position);
		if(this.hiddenName){
			this.hiddenField = this.el.insertSibling({tag:'input', type:'hidden', name: this.hiddenName,
					id: (this.hiddenId||this.hiddenName)}, 'before', true);

			// prevent input submission
			this.el.dom.removeAttribute('name');
		}
		if(Ext.isGecko){
			this.el.dom.setAttribute('autocomplete', 'off');
		}

		this.on('focus', this.initTree, this, {single: true});

		if(!this.editable){
			this.editable = true;
			this.setEditable(false);
		}
	},

	// private
	initValue : function(){
		Ext.eu.sm.TriggerTree.superclass.initValue.call(this);
		if(this.hiddenField){
			this.hiddenField.value =
				this.hiddenValue !== undefined ? this.hiddenValue :
				this.value !== undefined ? this.value : '';
		}
	},

	// private
	initTree : function(){
		var that = this;
		if(!this.list){
			var cls = 'x-combo-list';

			this.list = new Ext.Layer({
				shadow: this.shadow, cls: [cls, this.listClass].join(' '), constrain:false
			});

			var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
			this.list.setWidth(lw);
			this.list.swallowEvent('mousewheel');
			this.assetHeight = 0;

			this.innerTree = this.list.createChild({cls:cls+'-inner'});
			this.tree = new Ext.ux.tree.ArrayTree({
				applyTo			: this.innerTree,
				height			: this.listHeight,
				animate			: true,
				rootVisible		: false,
				containerScroll	: true,
				rootConfig		: {
					text			:'--',
					id				:'root'
				},
				children		: this.children
			});

			this.tree.on('click', this.select,this);

			if(that.value){
				that.tree.getSelectionModel().select(that.tree.getNodeById(that.value));
			}

			this.innerTree.setWidth(lw - this.list.getFrameWidth('lr'));

			if(this.resizable){
				this.resizer = new Ext.Resizable(this.list,  {
					pinned	:true,
					handles	:'se'
				});
				this.resizer.on('resize', function(r, w, h){
					this.maxHeight = h-this.handleHeight-this.list.getFrameWidth('tb')-this.assetHeight;
					this.listWidth = w;
					this.innerTree.setWidth(w - this.list.getFrameWidth('lr'));
					this.restrictHeight();
				}, this);
				this[this.pageSize?'footer':'innerTree'].setStyle('margin-bottom', this.handleHeight+'px');
			}
		}
	},

	// private
	initEvents : function(){
		Ext.eu.sm.TriggerTree.superclass.initEvents.call(this);

		this.keyNav = new Ext.KeyNav(this.el, {
			"down" : function(e){
				if(!this.isExpanded()){
					this.onTriggerClick();
				}
			},

			"enter" : function(e){
				this.onViewClick();
				this.delayedCheck = true;
				this.unsetDelayCheck.defer(10, this);
			},

			"esc" : function(e){
				this.collapse();
			},

			"tab" : function(e){
				this.onViewClick(false);
				return true;
			},

			scope : this,

			doRelay : function(foo, bar, hname){
				if(hname == 'down' || this.scope.isExpanded()){
				return Ext.KeyNav.prototype.doRelay.apply(this, arguments);
				}
				return true;
			},

			forceKeyDown : true
		});
		this.queryDelay = Math.max(this.queryDelay || 10, 10);
		if(this.editable !== false){
			this.el.on("keyup", this.onKeyUp, this);
		}
		if(this.forceSelection){
			this.on('blur', this.doForce, this);
		}
	},

	// private
	onDestroy : function(){
		if(this.tree){
			Ext.destroy(this.tree);
		}
		if(this.list){
			this.list.destroy();
		}
		if (this.dqTask){
			this.dqTask.cancel();
			this.dqTask = null;
		}
		Ext.eu.sm.TriggerTree.superclass.onDestroy.call(this);
	},

	// private
	unsetDelayCheck : function(){
		delete this.delayedCheck;
	},

	// private
	fireKey : function(e){
		if(e.isNavKeyPress() && !this.isExpanded() && !this.delayedCheck){
			this.fireEvent("specialkey", this, e);
		}
	},

	// private
	onResize: function(w, h){
		Ext.eu.sm.TriggerTree.superclass.onResize.apply(this, arguments);
		if(this.list && this.listWidth === undefined){
			var lw = Math.max(w, this.minListWidth);
			this.list.setWidth(lw);
			this.innerTree.setWidth(lw - this.list.getFrameWidth('lr'));
		}
	},

	// private
	onEnable: function(){
		Ext.eu.sm.TriggerTree.superclass.onEnable.apply(this, arguments);
		if(this.hiddenField){
			this.hiddenField.disabled = false;
		}
	},

	// private
	onDisable: function(){
		Ext.eu.sm.TriggerTree.superclass.onDisable.apply(this, arguments);
		if(this.hiddenField){
			this.hiddenField.disabled = true;
		}
	},

	/**
	 * Allow or prevent the user from directly editing the field text.  If false is passed,
	 * the user will only be able to select from the items defined in the dropdown list.  This method
	 * is the runtime equivalent of setting the 'editable' config option at config time.
	 * @param {Boolean} value True to allow the user to directly edit the field text
	 */
	setEditable : function(value){
		if(value == this.editable){
			return;
		}
		this.editable = value;
		if(!value){
			this.el.dom.setAttribute('readOnly', true);
			this.el.on('mousedown', this.onTriggerClick,  this);
			this.el.addClass('x-combo-noedit');
		}else{
			this.el.dom.removeAttribute('readOnly');
			this.el.un('mousedown', this.onTriggerClick,  this);
			this.el.removeClass('x-combo-noedit');
		}
	},

	// private
	onBeforeLoad : function(){
		if(!this.hasFocus){
			return;
		}
		this.innerTree.update(this.loadingText ?
			'<div class="loading-indicator">'+this.loadingText+'</div>' : '');
		this.restrictHeight();
		this.selectedNode = null;
	},

	// private
	onLoad : function(){
		if(!this.hasFocus){
			return;
		}
		//this.el.focus();
		var root = this.tree.getRootNode();
		if(root.hasChildNodes()){
			this.expand();
			this.restrictHeight();
			if(this.lastQuery == this.allQuery){
				if(this.editable){
					this.el.dom.select();
				}
				var n;
				if(!(n = this.findDeepChildNode(root,'text',this.value))){
					this.select(n, true);
				}
			}else{
				this.selectNext();
				/*if(this.typeAhead && this.lastKey != Ext.EventObject.BACKSPACE && this.lastKey != Ext.EventObject.DELETE){
					this.taTask.delay(this.typeAheadDelay);
				}*/
			}
		}else{
			this.onEmptyResults();
		}
	},

	// private
	/*onTypeAhead : function(){
		if(this.store.getCount() > 0){
			var r = this.store.getAt(0);
			var newValue = r.data[this.displayField];
			var len = newValue.length;
			var selStart = this.getRawValue().length;
			if(selStart != len){
				this.setRawValue(newValue);
				this.selectText(selStart, newValue.length);
			}
		}
	},*/

	// private
	onSelect : function(node){
		if(this.fireEvent('beforeselect', this, node, node.attributes.id) !== false){
			this.setValue(record.data[this.valueField || this.displayField]);
			this.collapse();
			this.fireEvent('select', this, record, index);
		}
	},

	/**
	 * Returns the currently selected field value or empty string if no value is set.
	 * @return {String} value The selected value
	 */
	getValue : function(){
		if(this.valueField){
			return typeof this.value != 'undefined' ? this.value : '';
		}else{
			return Ext.eu.sm.TriggerTree.superclass.getValue.call(this);
		}
	},

	/**
	 * Clears any text/value currently set in the field
	 */
	clearValue : function(){
		if(this.hiddenField){
			this.hiddenField.value = '';
		}
		this.setRawValue('');
		this.lastSelectionText = '';
		this.applyEmptyText();
		this.value = '';
	},

	/**
	 * Sets the specified value into the field.  If the value finds a match, the corresponding record text
	 * will be displayed in the field.  If the value does not match the data value of an existing item,
	 * and the valueNotFoundText config option is defined, it will be displayed as the default field text.
	 * Otherwise the field will be blank (although the value will still be set).
	 * @param {String} value The value to match
	 */
	setValue : function(v){
		var text = v;
		if(this.valueField){
			var r = this.findRecord(this.valueField, v);
			if(r){
				text = r.data[this.displayField];
			}else if(this.valueNotFoundText !== undefined){
				text = this.valueNotFoundText;
			}
		}
		this.lastSelectionText = text;
		if(this.hiddenField){
			this.hiddenField.value = v;
		}
		Ext.eu.sm.TriggerTree.superclass.setValue.call(this, text);
		this.value = v;
	},

	// private
	findRecord : function(prop, value){
		return false;
		var record;
		if(this.store.getCount() > 0){
			this.store.each(function(r){
				if(r.data[prop] == value){
					record = r;
					return false;
				}
			});
		}
		return record;
	},

	// private
	onViewClick : function(doFocus){
		//return false;
		var index = this.tree.getSelectedNode()[0];
		var r = this.store.getAt(index);
		if(r){
			this.onSelect(r);
		}
		if(doFocus !== false){
			this.el.focus();
		}
	},

	// private
	restrictHeight : function(){
		this.innerTree.dom.style.height = '';
		var inner = this.innerTree.dom;
		var pad = this.list.getFrameWidth('tb')+(this.resizable?this.handleHeight:0)+this.assetHeight;
		var h = Math.max(inner.clientHeight, inner.offsetHeight, inner.scrollHeight);
		var ha = this.getPosition()[1]-Ext.getBody().getScroll().top;
		var hb = Ext.lib.Dom.getViewHeight()-ha-this.getSize().height;
		var space = Math.max(ha, hb, this.minHeight || 0)-this.list.shadowOffset-pad-5;
		h = Math.min(h, space, this.maxHeight);

		this.innerTree.setHeight(h);
		this.list.beginUpdate();
		this.list.setHeight(h+pad);
		this.list.alignTo(this.wrap, this.listAlign);
		this.list.endUpdate();
	},

	// private
	onEmptyResults : function(){
		this.collapse();
	},

	/**
	 * Returns true if the dropdown list is expanded, else false.
	 */
	isExpanded : function(){
		return this.list && this.list.isVisible();
	},

	/**
	 * Select an item in the dropdown list by its data value. This function does NOT cause the select event to fire.
	 * The store must be loaded and the list expanded for this function to work, otherwise use setValue.
	 * @param {String} value The data value of the item to select
	 * @param {Boolean} scrollIntoView False to prevent the dropdown list from autoscrolling to display the
	 * selected item if it is not currently in view (defaults to true)
	 * @return {Boolean} True if the value matched an item in the list, else false
	 */
	selectByValue : function(v, scrollIntoView){
		//this.select(this.store.indexOf(r), scrollIntoView);
		return false;
		if(v !== undefined && v !== null){
			var r = this.findRecord(this.valueField || this.displayField, v);
			if(r){
				this.select(this.store.indexOf(r), scrollIntoView);
				return true;
			}
		}
		return false;
	},

	setValue : function(v,textv){
		var text = v;
		if(!textv && this.tree){
			var node = this.tree.getNodeById(v);
			if(node){
				textv = node.attributes.text;
			}
		}
		this.lastSelectionText = textv;
		if(this.hiddenField){
			this.hiddenField.value = v;
		}
		Ext.form.ComboBox.superclass.setValue.call(this, textv);
		this.value = v;
	},

	select : function(node, scrollIntoView){
		this.selectedIndex = node;
		this.tree.getSelectionModel().select(node)
		this.setValue(node.attributes.id);
		//this.setValue(node.getPath().replace(/^\/root/,''));
		return;
	},

	// private
	selectNext : function(){
		/*var ct = this.store.getCount();
		if(ct > 0){
			if(this.selectedIndex == -1){
				this.select(0);
			}else if(this.selectedIndex < ct-1){
				this.select(this.selectedIndex+1);
			}
		}*/
	},

	// private
	selectPrev : function(){
		/*var ct = this.store.getCount();
		if(ct > 0){
			if(this.selectedIndex == -1){
				this.select(0);
			}else if(this.selectedIndex != 0){
				this.select(this.selectedIndex-1);
			}
		}*/
	},

	// private
	onKeyUp : function(e){
		if(this.editable !== false && !e.isSpecialKey()){
			this.lastKey = e.getKey();
		}
	},

	// private
	validateBlur : function(){
		return !this.list || !this.list.isVisible();
	},

	// private
	doForce : function(){
		if(this.el.dom.value.length > 0){
			this.el.dom.value =
				this.lastSelectionText === undefined ? '' : this.lastSelectionText;
			this.applyEmptyText();
		}
	},

	// private
	getParams : function(q){
		var p = {};
		//p[this.queryParam] = q;
		if(this.pageSize){
			p.start = 0;
			p.limit = this.pageSize;
		}
		return p;
	},

	collapse : function(){
		if(!this.isExpanded()){
			return;
		}
		this.list.hide();
		Ext.getDoc().un('mousewheel', this.collapseIf, this);
		Ext.getDoc().un('mousedown', this.collapseIf, this);
		this.fireEvent('collapse', this);
	},

	// private
	collapseIf : function(e){
		if(!e.within(this.wrap) && !e.within(this.list)){
			this.collapse();
		}
	},

	/**
	 * Expands the dropdown list if it is currently hidden. Fires the {@link #expand} event on completion.
	 */
	expand : function(){
		if(this.isExpanded() || !this.hasFocus){
			return;
		}
		this.list.alignTo(this.wrap, this.listAlign);
		this.list.show();
		this.innerTree.setOverflow('auto'); // necessary for FF 2.0/Mac
		Ext.getDoc().on('mousewheel', this.collapseIf, this);
		Ext.getDoc().on('mousedown', this.collapseIf, this);
		this.fireEvent('expand', this);
	},

	/**
	 * @method onTriggerClick
	 * @hide
	 */
	// private
	// Implements the default empty TriggerField.onTriggerClick function
	onTriggerClick : function(){
		if(this.disabled){
			return;
		}
		if(this.isExpanded()){
			this.collapse();
			this.el.focus();
		}else {
			this.onFocus({});
			this.onLoad();
			this.tree.focus();
		}
	}
});
Ext.reg('triggertree', Ext.eu.sm.TriggerTree);