/*
that.on('activate',function(){
	new Ext.util.DelayedTask(function(){
	}, this).delay(400);
});
that.on('render',function(){
	new Ext.util.DelayedTask(function(){
		var center = Ext.getCmp(that.centerId);

		center.tpl.overwrite(center.body, {
			src	: that.src
		});
	}, this).delay(400);
})*/
Ext.ns('Ext.eu.sm');
Ext.ns('Ext.eu.sm.inlineViewerAddons');

Ext.eu.sm.inlineViewerAddons.inscribed = function (originalWidth,originalHeight,inscribedWidth,inscribedHeight){
	var thumbWidth,thumbHeight;
	if( (originalHeight/originalWidth)>(inscribedHeight/inscribedWidth)){
		thumbHeight	= inscribedHeight;
		thumbWidth	= (originalWidth	/ originalHeight) * inscribedHeight;
	}else{
		thumbHeight	= (originalHeight	/ originalWidth	) * inscribedWidth;
		thumbWidth	= inscribedWidth;
	}
	//console.log('w',originalWidth,'h',originalHeight,'r',originalHeight/originalWidth,'tw',thumbWidth,'th',thumbHeight,'tr',thumbHeight/thumbWidth);
	return {
		width : thumbWidth,
		height: thumbHeight,
		ratio : thumbWidth/originalWidth
	}
}

Ext.eu.sm.inlineViewerAddons.img = Ext.extend(Ext.Panel, {
	debug			: false,
	frame			: true,
	initComponent	: function (){
		var that				= this;
		that.afterlayoutDone	= false;
		that.centerId			= Ext.id();
		that.imgId				= Ext.id();
		that.internalImg		= null;

		that.inlineWidth		= null;
		that.inlineHeight		= null;
		that.inscribedZoom		= null;
		that.fZoom				= 0;
		that.fAngle				= 0;

		that.fnDisplay = function(){
			if(!that.internalImg){
				that.internalImg = Ext.get(that.imgId).dom;
			}
			that.internalImg.height	= that.inlineHeight	* (1+that.fZoom);
			that.internalImg.width	= that.inlineWidth		* (1+that.fZoom);
			Ext.apply(that.internalImg.style,{
				'-webkit-transform'	: 'rotate('+that.fAngle+'deg)',
				'-moz-transform'	: 'rotate('+that.fAngle+'deg)',
				'transform'			: 'rotate('+that.fAngle+'deg)'
			});
			if(that.debug) console.log(that.fZoom,that.internalImg.width,that.internalImg.height);
		}

		Ext.apply(that,{
			tbar		: [{
				xtype		: 'button',
				iconCls		: 'inline-viewer-addons-icon-zoom-out',
				handler		: function(){
					that.fZoom -= .1;
					that.fnDisplay();
				}
			},{
				xtype		: 'button',
				iconCls		: 'inline-viewer-addons-icon-zoom-in',
				handler		: function(){
					that.fZoom += .1;
					that.fnDisplay();
				}
			},{
				xtype		: 'button',
				iconCls		: 'inline-viewer-addons-icon-zoom-original',
				handler		: function(){
					that.fZoom = 0;
					that.fnDisplay();
				}
			},{
				xtype		: 'button',
				iconCls		: 'inline-viewer-addons-icon-zoom-best-fit',
				handler		: function(){
					that.fZoom =that.inscribedZoom;
					that.fnDisplay();
				}
			},{
				xtype		: 'button',
				iconCls		: 'inline-viewer-addons-icon-rotate-left',
				handler		: function(){
					that.fAngle -= 90;
					that.fnDisplay();
				}
			},{
				xtype		: 'button',
				iconCls		: 'inline-viewer-addons-icon-rotate-right',
				handler		: function(){
					that.fAngle += 90;
					that.fnDisplay();
				}
			}],
			layout		: 'fit',
			autoScroll	: true,
			items		: [{
				autoScroll	: true,
				id			: that.centerId,
				cls			: 'inline-viewer-addons-img',
				xtype		: 'box',
				listeners:{
					render:function(){
						var el = Ext.get(that.imgId);
						el.mon('click',function(){
							if(that.debug)	console.log(this);
						});
						el.mon('load',function(){
							that.inlineWidth	= this.width;
							that.inlineHeight	= this.height;
							if(that.debug) console.log('loaded',that.inlineWidth,that.inlineHeight);
							var containerSize = Ext.getCmp(that.centerId).getSize();
							var newSize = Ext.eu.sm.inlineViewerAddons.inscribed(this.width+10,this.height+10,containerSize.width,containerSize.height);
							that.fZoom = that.inscribedZoom = -(1-newSize.ratio);
							that.fnDisplay();
						},el.dom);
						el.dom.src = that.url;
					}
				},
				autoEl		: {
					tag		: 'div',
					style	: {
						margin	: 'auto'
					},
					children: [{
						tag		: 'img',
						id		: that.imgId,
						src		: ''
					}]
				}
			}]
		});

		that.afterRender.createSequence(function(){
			console.log('afterRender');
		});
		that.on('afterLayout',function(){
			console.log('afterLayout');
			if(that.afterlayoutDone == false){
				that.afterlayoutDone = true;
			}
		});

		Ext.eu.sm.inlineViewerAddons.img.superclass.initComponent.call(this);
	}
});

Ext.eu.sm.inlineViewerAddons.pdf = Ext.extend(Ext.Panel, {
	debug			: false,
	frame			: true,
	initComponent	: function (){
		var that				= this;
		that.afterlayoutDone	= false;
		that.centerId			= Ext.id();
		that.pdfId				= Ext.id();
		that.internalImg		= null;

		that.inlineWidth		= null;
		that.inlineHeight		= null;
		that.inscribedZoom		= null;
		that.fZoom				= 0;

		that.fnDisplay = function(){
		}

		Ext.apply(that,{
			layout		: 'fit',
			autoScroll	: true,
			items		: [{
				autoScroll	: true,
				id			: that.centerId,
				cls			: 'inline-viewer-addons-img',
				xtype		: 'box',
				listeners:{
					render:function(){
						return;
						var el = Ext.get(that.pdfId);
						el.mon('click',function(){
							if(that.debug)	console.log(this);
						});
						el.mon('load',function(){
							that.inlineWidth	= this.width;
							that.inlineHeight	= this.height;
							if(that.debug) console.log('loaded',that.inlineWidth,that.inlineHeight);
							var containerSize = Ext.getCmp(that.centerId).getSize();
							var newSize = Ext.eu.sm.inlineViewerAddons.inscribed(this.width+10,this.height+10,containerSize.width,containerSize.height);
							that.fZoom = that.inscribedZoom = -(1-newSize.ratio);
							that.fnDisplay();
						},el.dom);
						el.dom.data = that.url;
					}
				},
				autoEl		: {
					tag		: 'iframe',
					id		: that.pdfId,
					src		: that.url+'&onlyView=true'
				}
			}]
		});

		that.afterRender.createSequence(function(){
			console.log('afterRender');
		});
		that.on('afterLayout',function(){
			console.log('afterLayout');
			if(that.afterlayoutDone == false){
				that.afterlayoutDone = true;
			}
		});

		Ext.eu.sm.inlineViewerAddons.pdf.superclass.initComponent.call(this);
	}
});

Ext.eu.sm.inlineViewer = Ext.extend(Ext.Panel, {
	selectedIndex	: true,
	selectorWidth	: 200,
	thumbWidth		: 120,
	thumbHeight		: 170,
	initComponent	: function (){
		var that				= this;
		that.detailPanelId		= Ext.id();
		that.detailPanelHeaderId= Ext.id();
		that.ratio				= that.thumbHeight/that.thumbWidth;//1.4142;

		that.inlineStore = new Ext.data.JsonStore({
			fields		: [
				'idx'	,
				'type'	,
				'url'	,
				'suburl',
				'name'
			],
			root		: 'data',
			idProperty	: 'idx',
			proxy		: new Ext.data.MemoryProxy([])
		});

		this.addEvents('selected');
		that.addRecord = function(v){
			v.uid = Ext.id();
			if(!v.idx){
				v.idx = Ext.id();
			}
			if(!v.type){
				if (/\.gif$/.test(v.name)){
					v.type='img';
				}
				if (/\.png$/.test(v.name)){
					v.type='img';
				}
				if (/\.jpg$/.test(v.name)){
					v.type='img';
				}
				if (/\.pdf$/.test(v.name)){
					v.type='pdf';
				}
			}
			that.inlineStore.add(new that.inlineStore.recordType(v));
			if(v.type=='img'){
				v.img = new Object();
				v.img.onload = function(){
					var el = Ext.get(v.uid);
					var newSize = Ext.eu.sm.inlineViewerAddons.inscribed(this.width,this.height,that.thumbWidth,that.thumbHeight);
					el.dom.width	= newSize.width;
					el.dom.height	= newSize.height;
					el.dom.data		= v.url;
					delete(this);
				}
				v.img.src=v.url;
			}
		}

		if(that.data){
			that.inlineStore.removeAll();
			Ext.each(that.data,function(v,k){
				that.addRecord(v);
			})
		}

		that.thumbTpl = new Ext.XTemplate(
			'<tpl for=".">'+
				'<div class="inline-viewer-display-wrap" style="height:'+(that.thumbHeight+30)+'px;width:'+(that.thumbWidth)+'px;">'+
					'<div class="name">{name}</div>'+
					'<div class="body" style="height:'+(that.thumbHeight)+'px;width:'+(that.thumbWidth)+'px;">'+
						'<tpl if="values.type== \'img\'">'+
							'<img id="{uid}" src="">'+
						'</tpl>'+
						'<tpl if="values.type== \'img\'">'+
							'{uid}'+
						'</tpl>'+
					'</div>'+
				'</div>'+
			'</tpl>'+
			'<div class="x-clear"></div>'
		);

		that.detailTpl = new Ext.XTemplate(
			'<tpl for=".">'+
				'<div class="inline-viewer-display-detail">'+
					'<div class="name">{name}</div>'+
				'</div>'+
			'</tpl>'+
			'<div class="x-clear"></div>'
		);
		that.slideCmp = function(){

		}

		Ext.apply(that,{
			collapsible	: true,
			layout		: 'border',
			items		: [{
				xtype			: 'dataview',
				region			: 'west',
				width			: that.selectorWidth,
				minWidth		: 50,
				maxWidth		: 900,
				store			: that.inlineStore,
				multiSelect		: false,
				autoScroll		: true,
				split			: true,
				overClass		: 'x-view-over',
				itemSelector	: 'div.inline-viewer-display-wrap',
				cls				: 'inline-viewer-display-display',
				emptyText		: 'Nothing to display',
				tpl				: that.thumbTpl,
				listeners: {
					click	: {
						fn		: function(cmp,index,el,event){
							var detailEl = Ext.getCmp(that.detailPanelHeaderId);
							if(detailEl && detailEl.body){
								var record = that.inlineStore.getAt(index).data;

								that.slideCmp(detailEl.body);
								detailEl.body.hide();
								detailEl.tpl.overwrite(detailEl.body, record);
								detailEl.body.slideIn('l', {
									stopFx	: true,
									duration: .2
								});
								that.fireEvent('show',index,that.inlineStore.getAt(index),record)

								var detailPanel = Ext.getCmp(that.detailPanelId)
								detailPanel.removeAll();
								if(Ext.eu.sm.inlineViewerAddons[record.type]){
									var newPanel = new Ext.eu.sm.inlineViewerAddons[record.type](record)
									detailPanel.add(newPanel);
									detailPanel.doLayout();

									newPanel.body.hide();
									newPanel.body.slideIn('l', {
										stopFx	: true,
										duration: .2
									});
								}
							}
						},
						scope	: that,
						buffer	: 100
					},
					dblclick	: function(cmp,index,el,event){
						that.fireEvent('selected',that.store.getAt(index),index)
					}
				}
			},{
				region		: 'center',
				layout		: 'border',
				border		: false,
				items		: [{
					region		: 'north',
					border		: false,
					height		: 50,
					frame		: true,
					split		: true,
					tpl			: that.detailTpl,
					id			: that.detailPanelHeaderId
				},{
					region		: 'center',
					border		: false,
					layout		: 'fit',
					id			: that.detailPanelId,
					items		: [{
						frame		: true
					}]
				}]
			}]
		});
		Ext.eu.sm.inlineViewer.superclass.initComponent.call(this);
	}
});

Ext.reg('inlineviewer',Ext.eu.sm.inlineViewer);