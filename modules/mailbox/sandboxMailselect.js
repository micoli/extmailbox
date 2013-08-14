Ext.onReady(function(){
	var that = this;
	that.accountComboId	= Ext.id();
	that.formId			= Ext.id();
	var emails = [{
		personal:"toto1",
		email	:"titi1@toto.com"
	},{
		personal:"toto2",
		email	:"titi2@toto.com"
	},{
		personal:"toto3",
		email	:"titi3@toto.com"
	}];
	that.accountStore = new Ext.data.JsonStore({
		fields			: [
			'account',
			'email'
		],
		root			: 'data',
		idProperty		: 'account',
		remoteSort		: true,
		autoLoad		: true,
		baseParams		: {
			'exw_action'	: 'local.MailboxImap.getAccounts'
		},
		proxy			: new Ext.data.HttpProxy({
			url				: 'proxy.php',
		}),
	});

	that.recipientSearchStore = new Ext.data.JsonStore({
		id				:'email',
		root			:'data',
		totalProperty	:'totalCount',
		fields:[
			{name:'email'		, type:'string'},
			{name:'personal'	, type:'string'},
		],
		url			:'proxy.php',
		baseParams	: {
			exw_action		: 'local.MailboxImap.searchContact'
		}
	});
	new Ext.Viewport({
		layout	: 'border',
		items	: [{
			region		: 'center',
			xtype		: 'form',
			labelWidth	: 100,
			frame		: true,
			items		: [{
				fieldLabel		: 'From',
				xtype			: 'combo',
				name			: 'from',
				store			: that.accountStore,
				id				: that.accountComboId,
				anchor			: '-10',
				displayField	: 'email',
				valueField		: 'email',
				emptyText		: 'Select an account...',
				mode			: 'local',
				triggerAction	: 'all',
				typeAhead		: true,
				forceSelection	: true,
				selectOnFocus	: true,
			},{
				fieldLabel		: 'Subject',
				xtype			: 'textfield',
				text			: 'subject',
				value			: 'sujet',
				anchor			: '-10',
			},{
				fieldLabel		: 'To',
				xtype			: 'mailselect',
				name			: 'to',
				anchor			: '-30',
				value			: emails,
				store			: that.recipientSearchStore,
				addEmailTrigger	: function(){
					console.log(this,'ee');
				},
				tpl				:'<tpl for="."><div class="x-combo-list-item">{email}, <i>{personal}</i></div></tpl>',
			},{
				xtype			: 'mailselect',
				fieldLabel		: 'Cc',
				name			: 'cc',
				anchor			: '-30',
				value			: emails,
				store			: that.recipientSearchStore,
				tpl				:'<tpl for="."><div class="x-combo-list-item">{email}, <i>{personal}</i></div></tpl>',
			}]
		},{
			xtype	: 'panel',
			region	: 'east',
			split	: true,
			width	: 550,
			layout	: 'border',
			items : [{
				region		: 'north',
				xtype		: 'tabpanel',
				height		: 400,
				activeTab	: 0,
				items		: [{
					xtype		: 'panel',
					id			: 'test123',
					title		: 'aa1',
					frame		: true,
					layout		: 'form',
					maskDisabled:false,
					buttons		: [{
						text		:'test',
						handler		: function(){
							var win = new Ext.ModalWindow({
								modalContainer	: Ext.getCmp('test123'),
								title			: 'eeee',
								modalContainerBorder	: 20,
								items		: {
									html : 'test'
								},
							});
							win.show();
						}
					}],
					items		: [{
						fieldLabel		: 'Subject1',
						xtype			: 'textfield',
						text			: 'subject',
						value			: 'sujet',
						anchor			: '100%',
					}]
				},{
					xtype		: 'panel',
					title		: 'aa2',
					layout		: 'form',
					items		: [{
						fieldLabel		: 'Subject2',
						xtype			: 'textfield',
						text			: 'subject',
						value			: 'sujet',
						anchor			: '100%',
					}]
				}]
			},{
				html	: 'attachments',
				region	: 'center'
			}]

		}]
	});


	Ext.ModalWindow = Ext.extend(Ext.Window, {
		okButton		: true,
		okButtonText	: 'OK',
		cancelButton	: true,
		cancelButtonText: 'cancel',
		otherButton		: false, /** CYRCLI-262 **/
		otherButtonText	: 'OK',
		modal			: true,
		closable		: false,
		shadow			: false,
		minimizable		: false,
		modalContainerBorder : 10,
		draggable		: true,
		height			: 'auto',
		width			: 'auto',
		plain			: true,
		buttonPresent	: function(name){
			if (!this.buttons) return ;
			var buttons = this.buttons;
			Ext.each(buttons,function (v,k){
				if (v.name && v.name ==name) buttons.splice(k,1);
			});

		},
		initComponent : function(){
			var that = this;
			if (!that.buttons) that.buttons=[];
			if (this.okButton ){
				that.buttonPresent.call(this,'modal_ok');
				that.buttons.push({
					text		: this.okButtonText,
					name		: 'modal_ok',
					scope		: this,
					handler		: function(){
						if (this.callbackOK){
						this.callbackOK(this);
						}
						that.destroy();
					}
				});
			}
			if (this.otherButton ){
				that.buttonPresent.call(this,'modal_ok');
				that.buttons.push({
					text		: this.otherButtonText,
					name		: 'modal_ok',
					scope		: this,
					handler		: function(){
						if (this.callbackOK){
							this.callbackOK(this);
						}
					}
				});
			}
			if (this.cancelButton ){
				that.buttonPresent.call(this,'modal_cancel');
				that.buttons.push({
					text		: this.cancelButtonText,
					name		: 'modal_cancel',
					scope		: this,
					handler		: function(){
						if (this.callbackCancel){
						this.callbackCancel(this);
						}
						that.destroy();
					}
				});
			}
			Ext.apply(this,{
				listeners  : {
					beforedestroy : function(w){
					if (w.mask){Ext.destroy(w.mask);}
					if (w.proxy){Ext.destroy(w.proxy);}
					if (w.plain){Ext.destroy(w.plain);}
					}
				}
			});
			if (that.modalContainer){
				Ext.apply(that,{
					closable 		: false,
					resizable		: false,
					draggable		: false,
					movable			: false,
					plain			: true,
					layout			: 'fit'
				});
				var resizeFunc = function (){
					window.setTimeout(function(){
						that.setPosition(that.modalContainer.getPosition()[0]+that.modalContainerBorder,that.modalContainer.getPosition()[1]+that.modalContainerBorder);
						that.setSize(that.modalContainer.getEl().getWidth()-that.modalContainerBorder*2, that.modalContainer.getEl().getHeight()-that.modalContainerBorder*2);
					},50);
				};

				that.on('activate', resizeFunc);
				that.on('close', function(){
					that.mask.hide();
				});
				that.modalContainer.on('resize', resizeFunc);
				that.modalContainer.on('show', function ( container, rawWidth, rawHeight ){
					window.setTimeout(function(){
						that.show();
					},50);
				});
				that.modalContainer.on('hide', function ( container, rawWidth, rawHeight ){
					window.setTimeout(function(){
						that.hide();
					},50);
				});
			}
			Ext.ModalWindow.superclass.initComponent.call(this);
		},
		onRender		: function(ct, position){
			var that = this;
			Ext.Window.superclass.onRender.call(this, ct, position);
			if(this.plain){
				this.el.addClass('x-window-plain');
			}

			// this element allows the Window to be focused for keyboard events
			this.focusEl = this.el.createChild({
						tag: "a", href:"#", cls:"x-dlg-focus",
						tabIndex:"-1", html: "&#160;"});
			this.focusEl.swallowEvent('click', true);

			this.proxy = this.el.createProxy("x-window-proxy");
			this.proxy.enableDisplayMode('block');
			if(this.modal){
				this.mask = this.container.createChild({cls:"ext-el-mask"}, this.el.dom);
				this.mask.enableDisplayMode("block");
				this.mask.hide();
				this.mask.on('click', this.focus, this);
			}
			if(this.modalContainer){
				this.mask = this.modalContainer.el.mask();
			}
		}

	});
});