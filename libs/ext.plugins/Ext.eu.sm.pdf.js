Ext.ns('Ext.eu.sm');

// http://www.worldwidewhat.net/2011/08/render-pdf-files-with-html5/
// http://www.sencha.com/forum/showthread.php?237361-A-PDF-Viewer-Panel-No-Browser-Plugin-required-pure-JavaScript
Ext.eu.sm.pdf = Ext.extend(Ext.Panel,{
	url			: null,
	pdfDocument	: null,
	canvas		: null,
	context		: null,
	pageNum		: 0,
	pageCount	: 0,
	pageInterval: 1,
	numPages	: 0,
	scale		: 1,
	lock		: false,
	defaultScale: 1,
	withControls: true,

	load : function (url) {
		var that = this;
		PDFJS.getDocument(url).then(function(pdf) {
			that.pdfDocument	= pdf;
			that.pageCount		= that.pdfDocument.numPages;
			that.pageNum		= 1;
			Ext.getCmp(that.pageCountId).setText(" / "+that.pageCount);
			Ext.getCmp(that.pageNumFieldId).maxValue = that.pageCount;
			that.setScale(that.defaultScale);
		});
	},

	goToPage	: function(p){
		var that = this;
		if(p>=1 && p<=that.pageCount){
			that.pageNum = p;
			that.displayPage();
		}
	},

	goPrev		: function(){
		var that = this;
		that.goToPage(that.pageNum-1);
	},

	goNext		: function(){
		var that = this;
		that.goToPage(that.pageNum+1);
	},

	setScale	: function (scale){
		var that = this;
		that.pdfDocument.getPage(that.pageNum).then(function(page){
			var viewport = page.getViewport(1);
			var scaleW = that.el.getWidth()	/ viewport.width;
			var scaleH = that.el.getHeight()/ viewport.height;
			switch (scale){
				case -1:
					that.scale	= scaleW;
				break
				case -2:
					that.scale	= scaleH;
				break;
				case -3:
					that.scale = Math.min(scaleH,scaleW);
				break;
				default:
					that.scale = scale;
				break;
			}
			that.scale = parseInt(that.scale*100)/100;
			console.log('calculated scale',that.scale);
			that.displayPage();
			Ext.getCmp(that.zoomSliderId).setValue(that.scale*100);
			Ext.getCmp(that.zoomLabelId).setText((that.scale*100)+'%');
			Ext.getCmp(that.pageNumFieldId).setValue(that.pageNum);
		});
	},


	displayPage : function(){
		var that = this;
		if(!that.pdfDocument){
			return;
		}
		if(that.lock){
			return;
		}
		that.lock=true;

		that.pdfDocument.getPage(that.pageNum).then(function(page) {
			var viewport = page.getViewport(that.scale);
			Ext.getCmp(that.pageNumFieldId).setValue(that.pageNum);
			console.log('scale',that.scale);
			that.canvas.height	= viewport.height;
			that.canvas.width	= viewport.width;
			that.context.save();
			that.context.fillStyle = 'rgb(255, 255, 255)';
			that.context.fillRect(0, 0, that.canvas.width, that.canvas.height);
			that.context.restore();

			page.render({
				canvasContext	: that.context,
				viewport		: viewport
			});
			that.lock=false;
		});
	},

	initComponent	: function (){
		var that = this;
		that.pdfCanvasId	= Ext.id();
		that.pageNumFieldId	= Ext.id();
		that.pageCountId	= Ext.id();
		that.zoomComboId	= Ext.id();
		that.zoomSliderId	= Ext.id();
		that.zoomLabelId	= Ext.id();
		Ext.apply(that,{
			bbar : [{
				xtype		: 'button',
				iconCls		: 'x-tbar-page-prev',
				handler		: function(){
					that.goPrev();
				}
			},{
				xtype			: 'numberfield',
				id				: that.pageNumFieldId,
				minValue		: 1,
				maxValue		: 1,
				enableKeyEvents	: true,
				style			: {
					'text-align' : 'right',
				},
				listeners		: {
					specialkey		: function(f,e){
						if(e.getKey()==e.ENTER){
							that.goToPage(f.getValue());
						}
					}
				},
				width			: 30
			},{
				xtype		: 'label',
				id			: that.pageCountId,
				width		: 50
			},{
				xtype		: 'button',
				iconCls		: 'x-tbar-page-next',
				handler		: function(){
					that.goNext();
				}
			},'->',{
				text		: '-',
				handler		: function(){

				}
			},{
				xtype		: 'slider',
				id			: that.zoomSliderId,
				width		: 150,
				value		: that.scale*100,
				increment	: 25,
				minValue	: 25,
				maxValue	: 200,
				listeners	:{
					change		: function(slider,value){
						that.setScale(value/100);;
					}
				}
			}/*,{
				width		: 150,
				id			: that.zoomComboId,
				xtype		: 'combo',
				triggerAction: 'all',
				mode		: 'local',
				store		: new Ext.data.SimpleStore({
					fields	:['scale', 'zoom'],
					data	:[[0.25,25],[0.5,50],[0.75,75],[1,100],[1.25,125],[1.5,150],[1.75,175],[2,200],[-1,"Page width"],[-2,"Page height"]]
				}),
				listeners	:{
					change		: function(combo,value){
						that.setScale(value,'combo');
						that.displayPage();
					}
				},
				displayField: 'zoom',
				valueField	: 'scale'
			}*/,{
				xtype		: 'button',
				iconCls		: 'pdfViewerPageFull',
				handler		: function(){
					that.setScale(-3);
				}
			},{
				xtype		: 'button',
				iconCls		: 'pdfViewerPageHeight',
				handler		: function(){
					that.setScale(-2);
				}
			},{
				xtype		: 'button',
				iconCls		: 'pdfViewerPageWidth',
				handler		: function(){
					that.setScale(-1);
				}
			},{
				xtype		: 'label',
				width		: 30,
				id			: that.zoomLabelId,
				text		: ""+(that.scale*100)+'%'
			}],
			autoScroll		: true,
			bodyStyle		: {
				'background-color'	:'#686868'
			},
			html			: '<canvas class="pdfjs-canvas" id="'+that.pdfCanvasId+'">aa</canvas>'

		});

		Ext.eu.sm.pdf.superclass.initComponent.call(this);
	},

	afterRender : function (container) {
		var that = this;

		Ext.eu.sm.pdf.superclass.afterRender.apply(this,arguments);
		that.canvas = document.getElementById(that.pdfCanvasId);
		that.canvas.mozOpaque = true;
		that.context = that.canvas.getContext('2d');
		if(that.url){
			that.load(that.url);
		}
		if(!that.withControls){
			that.bbar.setVisibilityMode(Ext.Element.DISPLAY);
			that.bbar.hide();
			that.syncSize();
		}
	}

});

Ext.reg('sm.pdf',Ext.eu.sm.pdf)