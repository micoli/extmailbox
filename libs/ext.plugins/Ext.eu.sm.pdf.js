Ext.ns('Ext.eu.sm');
//http://www.worldwidewhat.net/2011/08/render-pdf-files-with-html5/

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

	load : function (url) {
		var that = this;
		PDFJS.getDocument(url).then(function(pdf) {
			that.pdfDocument	= pdf;
			that.pageCount		= that.pdfDocument.numPages;
			that.pageNum		= 1;
			Ext.getCmp(that.pageCountId).setText(" / "+that.pageCount);
			that.displayPage();
		});
	},

	setScale	: function (scale){
		var that = this;
		that.scale = scale;
		that.displayPage();
		Ext.getCmp(that.zoomLabelId).setText(''+scale*100+' %')
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

	changeZoom	: function(z){

	},

	displayPage : function(){
		var that = this;
		if(!that.pdfDocument){
			return;
		}
		Ext.getCmp(that.pageNumFieldId).setValue(that.pageNum);
		that.pdfDocument.getPage(that.pageNum).then(function(page) {
			var viewport = page.getViewport(that.scale);
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
		});
	},

	initComponent	: function (){
		var that = this;
		that.pdfCanvasId	= Ext.id();
		that.pageNumFieldId	= Ext.id();
		that.pageCountId	= Ext.id();
		that.zoomComboId	= Ext.id();
		that.zoomLabelId	= Ext.id();
		Ext.apply(that,{
			bbar:[{
				xtype		: 'button',
				iconCls		: 'x-tbar-page-prev',
				handler		: function(){
					that.goPrev();
				}
			},{
				xtype		: 'textfield',
				id			: that.pageNumFieldId,
				style		: {
					'text-align' : 'right',
				},
				width		: 30
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
			},'->',/*{
				width		: 150,
				id			: that.zoomComboId,
				xtype		: 'combo',
				triggerAction: 'all',
				mode		: 'local',
				store		: new Ext.data.SimpleStore({
					fields:['scale', 'zoom'],
					data	:[[0.2,20],[0.4,40],[0.5,50],[0.6,60],[0.8,80],[1,100],[1.2,120],[1.4,140],[1.6,160]]
				}),
				listeners	:{
					change		: function(combo,value){
						that.scale = value;
						that.displayPage();
					}
				},
				displayField: 'zoom',
				valueField	: 'scale'
			},*/{
				xtype		: 'slider',
				width		: 150,
				increment	: 20,
				value		: that.scale*100,
				minValue	: 20,
				maxValue	: 200,
				listeners	:{
					change		: function(combo,value){
						that.setScale(value/100)
					}
				}
			},{
				xtype		: 'label',
				width		: 30,
				id			: that.zoomLabelId,
				text		: ""+that.scale*100+'%'
			}],
			autoScroll:true,
			html: '<canvas class="pdfjs-canvas" id="'+that.pdfCanvasId+'">aa</canvas>'
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
	}
});

Ext.reg('sm.pdf',Ext.eu.sm.pdf)