Ext.ns('Ext.eu.sm.MailBox');

Ext.eu.sm.MailBox.MailSelect = Ext.extend(Ext.ux.BoxSelect, {
	displayField	: 'personal',
	displayFieldTpl	: '{personal} ({email})',
	valueField		: 'email',
	mode			: 'remoteInitialLocal',
	addUniqueValues	: false,
	enableKeyEvents	: true,
	triggerAction	:'all',
	minChars		: 2,
	pageSize		: 10,
	resizable		: true,
	minListWidth	: 170,
	addEmailTrigger	: false,
	validCharRegex	: /[a-z]|[A-Z]|[0-9]|[\@\ \,\;!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.]/,
	contextMenu		: null,

	initComponent:function() {
		Ext.eu.sm.MailBox.MailSelect.superclass.initComponent.call(this);
		//this.triggerConfig ={tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-arrow-trigger x-form-mailselect-trigger"};
		//this.hideTrigger = false;
	},
	getEmailsValues:function(emails){
		return new Ext.data.JsonStore({
			fields:['personal','email']
		}).reader.readRecords(emails).records;
	},

	setEmails:function(emails){
		this.store.removeAll();
		this.setValues(this.getEmailsValues(emails));
	},

	setValue: function(value){
		this.removeAllItems();
		this.store.clearFilter();
		this.resetStore();

		if(Ext.isArray(this.value) && typeof this.value[0]==='object' && this.value[0].data){
			this.setValues(this.value);
		}
		else{
			if(value && typeof value === 'string'){
				value = value.split(',');
			}

			var values = [];

			if(this.mode == 'local'){
				Ext.each(value, function(item){
					var index = this.store.find(this.valueField, item.trim());
					if(index > -1){
						values.push(this.store.getAt(index));
					}
				}, this);
			}else if(this.mode == 'remoteInitialLocal'){
				this.store.add(new Ext.data.JsonStore({
					fields:[
						'personal',
						'email'
					]
				}).reader.readRecords(value).records);

				Ext.each(value, function(item){
					var index = this.store.find(this.valueField, item[this.valueField].trim());
					if(index > -1){
						values.push(this.store.getAt(index));
					}
				}, this);
			}else if(this.mode == 'remote'){
				this.store.baseParams[this.queryParam] = value;
				this.store.load({
					params: this.getParams(value)
				});
			}
			this.setValues(values);
		}
	},

	onKeyPress	: function(e) {
		if(
			this.validCharRegex.test(String.fromCharCode(e.getCharCode())) ||
			e.isSpecialKey() ||
			e.getKey() == e.BACKSPACE ||
			e.getKey() == e.DELETE ||
			e.getKey() == e.TAB
		){
			Ext.eu.sm.MailBox.MailSelect.superclass.onKeyUp.call(this, e);
			return;
		}
		e.stopEvent();
	},

	checkToAdd	: function(force){
		if(force){
			var aVal = (''+this.el.dom.value).replace(/[\ \,\;]/g,',').split(',');
			for(i in aVal){
				var val = aVal[i];
				if(Ext.form.VTypes.email(val)){
					//console.log('test');
					/*if (that.store.find('email',val)==-1){
						//console.log('add');
						that.store.add([new that.store.recordType({
							personal	: '',
							email		: val
						})]);
					}*/
					this.onSelect({data:{email:val}},'email');
					this.el.dom.value='';
				}
			}
		}
	},

	onBlur		: function(e){
		this.checkToAdd(true);
		Ext.eu.sm.MailBox.MailSelect.superclass.onBlur.call(this, e);
	},

	onResize : function(w, h, rw, rh){
		this._width = w;
		this.holder.setWidth(w-4);
		Ext.ux.BoxSelect.superclass.onResize.call(this, w, h, rw, rh);
		this.autoSize();
	},

	onKeyUp		: function(e) {
		var that = this;
		if(this.editable !== false && !e.isSpecialKey()){
			if(e.getKey() == e.BACKSPACE && this.lastValue.length == 0){
				e.stopEvent();
				this.collapse();
				var el = this.maininput.prev();
				if(el) el.focus();
				return;
			}
			this.checkToAdd({' ':1,',':1,';':1}.hasOwnProperty(this.normalizeKeyCode(e.getCharCode())));
			this.dqTask.delay(this.queryDelay);
		}

		this.autoSize();

		Ext.eu.sm.MailBox.MailSelect.superclass.onKeyUp.call(this, e);

		this.lastValue = this.el.dom.value;
	},

	normalizeKeyCode : function(c) {
		var _to_ascii = {
			'188': '44',
			'109': '45',
			'190': '46',
			'191': '47',
			'192': '96',
			'220': '92',
			'222': '39',
			'221': '93',
			'219': '91',
			'173': '45',
			'187': '61', //IE Key codes
			'186': '59', //IE Key codes
			'189': '45'  //IE Key codes
		}

		if (_to_ascii.hasOwnProperty(c)) {
			c = _to_ascii[c];
		}
		return String.fromCharCode(c);
	},

	onRender:function(ct, position) {
		Ext.eu.sm.MailBox.MailSelect.superclass.onRender.call(this, ct, position);
		if(this.addEmailTrigger){
			this.customAddTrigger = this.wrap.createChild(this.triggerConfig ||
								{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-arrow-trigger x-form-mailselect-trigger" });
				this.wrap.setWidth(this.el.getWidth()+this.customAddTrigger.getWidth());

				this.customAddTrigger.on("click", this.addEmailTrigger, this, {preventDefault:true});
				this.customAddTrigger.addClassOnOver('x-form-trigger-over');
				this.customAddTrigger.addClassOnClick('x-form-trigger-click');
				this.holder.addClass('withTrigger');
		}
	},

	addItem: function(id, caption){
		var that = this;
		var box = new Ext.ux.BoxSelect.Item({
			id			: 'Box_' + id,
			maininput	: this.maininput,
			renderTo	: this.holder,
			className	: this.options['className'],
			caption		: caption,
			disabled	: this.disabled,
			'value'		: id,
			lastClick	: (new Date()).getTime(),
			onLnkClick : function(e){
				e.stopEvent();
				if(!that.readOnly){
					this.fireEvent('remove', this);
					this.dispose();
				}
			},
			onElContextMenu : function(e){
				(that.contextMenu(this.value)).show(this.el);
			},
			onElClick : function(e){
				var t = (new Date()).getTime();
				if(t-this.lastClick<400 && !that.readOnly){
					that.el.dom.value=id;
					e.stopEvent();
					this.fireEvent('remove', this);
					this.dispose(true);
					that.autoSize();
					/*var evt=document.createEventObject?document.createEventObject():document.createEvent("Event");
					evt.ctrlKey = false;
					evt.which = e.LEFT;
					that.fireEvent('keyup',evt);
					that.fireEvent('render');*/
				}else{
					this.focus();
				}
				this.lastClick=t;
			},

			listeners: {
				'remove': function(box){
					delete this.selectedValues[box.value];
					var rec = this.removedRecords[box.value];
					if(rec){
						this.store.add(rec);
						this.sortStore();
						this.view.render();
						//this.removedRecords[box.value] = null;
					}
				},
				scope: this
			},
			enableElListeners : function() {
				this.el.on('click', this.onElClick, this, {stopEvent:true});
				if(that.contextMenu){
					this.el.on('contextmenu', this.onElContextMenu, this, {stopEvent:true});
				}
			},

			onRender: function(ct, position){
				Ext.ux.BoxSelect.Item.superclass.onRender.call(this, ct, this.maininput);

				this.addEvents('remove');

				this.addClass('bit-box');

				this.el = ct.createChild({ tag: 'li' }, this.maininput);
				this.el.addClassOnOver('bit-hover');

				Ext.apply(this.el, {
					'focus': function(){
						if(that.readOnly){
							this.down('a.focusbutton').focus();
						}else{
							this.down('a.closebutton').focus();
						}
					},
					'dispose': function(){
						this.dispose();
					}.createDelegate(this)

				});

				this.enableElListeners();

				this.el.update(this.caption);
				if(that.readOnly){
					this.lnk = this.el.createChild({
						'tag': 'a',
						'class': 'focusbutton',
						'href':'#'
					});
				}else{
					this.lnk = this.el.createChild({
						'tag': 'a',
						'class': 'closebutton',
						'href':'#'
					});
				}

				if(!this.disabled)
					this.enableLnkListeners();
				else
					this.disableAllListeners();

				this.on({
					'disable': this.disableAllListeners,
					'enable': this.enableAllListeners,
					scope: this
				});

				new Ext.KeyMap(this.lnk, [{
					key: [Ext.EventObject.BACKSPACE, Ext.EventObject.DELETE],
					fn: function(e){
						if(!that.readOnly){
							this.dispose();
						}
					}.createDelegate(this)
				},{
					key: Ext.EventObject.RIGHT,
					fn: function(){
						this.move('right');
					}.createDelegate(this)
				},{
					key: Ext.EventObject.LEFT,
					fn: function(){
						this.move('left');
					}.createDelegate(this)
				},{
					key: Ext.EventObject.TAB,
					fn: function(){
					}.createDelegate(this)
				}]).stopEvent = true;
			}
		});
		box.render();

		box.hidden = this.el.insertSibling({
			'tag'	: 'input',
			'type'	: 'hidden',
			'value'	: id,
			'name'	: (this.hiddenName || this.name)
		},'before', true);

		this.boxElements['Box_' + id] = box;
	}
});

Ext.reg('mailselect',Ext.eu.sm.MailBox.MailSelect);