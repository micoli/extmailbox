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
						var modalContPos= that.modalContainer.getPosition();
						var modalContEl = that.modalContainer.getEl();
						if(that.modalContainerBorder==-1){
							that.setPosition(modalContPos[0]+modalContEl.getWidth()/2-that.el.getWidth()/2,modalContPos[1]+modalContEl.getHeight()/2-that.el.getHeight()/2);
						}else{
							that.setPosition(modalContPos[0]+that.modalContainerBorder,modalContPos[1]+that.modalContainerBorder);
							that.setSize(modalContEl.getWidth()-that.modalContainerBorder*2, modalContEl.getHeight()-that.modalContainerBorder*2);
						}
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
			resizeFunc();
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
