Ext.ns('Ext.eu');

Ext.eu.attachedWindow = Ext.extend(Ext.Window, {
	resizable		: true,
	draggable		: false,
	title			: null,
	modalPanel		: null,
	resizeTriggerCmp: null,
	stickCmp		: null,
	resizeHandles	: 's e se',
	closable		: false,

	initComponent	: function (){
		var that = this;
		if(typeof that.stickCmp == 'object' && that.stickCmp.hasOwnProperty('dom')){
			that.attachedEl = that.stickCmp;
		}else{
			that.attachedEl = that.stickCmp.getEl();
		}
		that.stickCmpSize = that.attachedEl.getSize();

		Ext.apply(that,{
			x	: that.attachedEl.getX(),
			y	: that.attachedEl.getY()+that.stickCmpSize.height,
		});

		Ext.eu.attachedWindow.superclass.initComponent.call(this);

		if(that.modalPanel){
			that.mon(that.modalPanel,'beforedestroy',function(){
				that.destroy();
			});
		}

		that.on('beforerender'		, function(){
			if (that.modalPanel){
				that.modalPanel.getEl().mask();
			}
			that.mon(that.resizeTriggerCmp,'resize',function(){
				window.setTimeout(function(){
					that.setPosition(that.attachedEl.getX(),that.attachedEl.getY()+that.stickCmpSize.height);
				},70);
			});
		});

		that.on('render'		, function(){
			window.setTimeout(function(){
				that.mon(Ext.getBody(), 'click', function (event,t) {
					var el = that.getEl();
					if (!(el.dom === t || el.contains(t))) {
						event.preventDefault();
						that.destroy();
					}
				});
			},50);
		});

		that.on('beforedestroy'	, function(){
			if (that.modalPanel){
				that.modalPanel.getEl().unmask();
			}
			//that.resizeTriggerCmp.removeListener('resize',that.resizePanelHandler);
		});

	}
});