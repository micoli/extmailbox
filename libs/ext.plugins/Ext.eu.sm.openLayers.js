Ext.ns('Ext.eu.sm');
/*
that.nominatimSearch({
	q			: 'marseille, France',
	success		: function(data){
		console.log('success',data);
	},
	failure		: function(xhr,e){
		console.log('error',xhr,e);
	}
});
*/
Ext.eu.sm.openLayers = Ext.extend(Ext.Panel,{
	fromProjection			: null,
	fromProjectionText		: 'EPSG:4326'	, // Transform from WGS 1984

	toProjection			: null,
	toProjectionText		: 'EPSG:900913'	, // to Spherical Mercator Projection

	zoom					: 14,
	maxZoom					: 15,

	dispersRadius			: 0.0025,
	vectorLayers			: [],

	initComponent	: function (){
		var that = this;
		if(!OpenLayers.ImgPath){
			OpenLayers.ImgPath = "http://www.openlayers.org/api/img/";
		}
		that.mapPanelId		= Ext.id();
		that.zoomSliderId	= Ext.id();
		that.zoomTextId		= Ext.id();
		that.posTextId		= Ext.id();

		that.addEvents('moveend','zoomend');
		that.layerMenu = new Ext.menu.Menu();

		Ext.apply(that,{
			bbar : [{
				xtype		: 'slider',
				id			: that.zoomSliderId,
				width		: 100,
				value		: that.zoom,
				increment	: 1,
				minValue	: 1,
				maxValue	: Math.min(that.maxZoom,16),
				listeners	: {
					change		: function(slider,value){
						that.openMap.zoomTo(value);
					}
				}
			},{
				text			: '-',
				xtype			: 'button',
				handler			: function(){
					that.openMap.zoomOut();
				},
			},{
				text			: '+',
				xtype			: 'button',
				handler			: function(){
					that.openMap.zoomIn();
				},
			},{
				xtype			: 'label',
				id				: that.zoomTextId,
				text			: '-'
			},'-',{
				xtype			: 'label',
				id				: that.posTextId,
				text			: '-'
			},'-',{
				xtype			: 'combo',
				store			: new Ext.data.Store({
					proxy			: new Ext.data.HttpProxy ({ //Ext.eu.sm.cors.Proxy
						method			: 'GET',
						url				: 'http://nominatim.openstreetmap.org/search',
					}),
					reader			: new Ext.data.JsonReader({
						id				: 'osm_id',
					}, [
						'display_name'	,'osm_id','class','type','icon','lon','lat'
					]),
					baseParams		: {
						format			: 'json',
						limit			: 40,
						dedup			: 1
					},
					remoteSort		: false,
				}),
				tpl					: new Ext.XTemplate(
					'<tpl for="."><div class="search-item">',
						'<div><tpl if="icon"><img src="{icon}"></tpl> {display_name}</div>',
						'<u>{type}</u> : <i>{lon}/{lat}</i>',
						'<hr>',
					'</div></tpl>'
				),
				itemSelector	: 'div.search-item',
				displayField	: 'display_name',
				loadingText		: 'Searching...',
				typeAhead		: false,
				hideTrigger		: true,
				queryParam		: 'q',
				width			: 270,
				validationEvent	: false,
				queryDelay		: 3000,
				listeners		: {
					specialkey		: function(field,e){
						if(e.getKey()==e.ENTER){
							field.doQuery(field.getRawValue(),true,true)
						}
					},
					beforeselect : function(combo, record){
						that.position	= new OpenLayers.LonLat(record.get('lon'),record.get('lat')).transform(that.fromProjection,that.toProjection);
						that.openMap.setCenter(that.position, 14);
						return true;
					}
				}
			},{
				text	: 'layers',
				xtype	: 'button',
				menu	: that.layerMenu
			}]
		});

		that.addEvents('layerschanged');

		Ext.eu.sm.pdf.superclass.initComponent.call(this);

		that.on('bodyresize',function(){
			if(that.openMap){
				that.openMap.updateSize();
			}
		})
	},

	afterRender : function (container) {
		var that = this;
		Ext.eu.sm.pdf.superclass.afterRender.apply(this,arguments);
		window.setTimeout(function(){
			that.generateOpenStreetMap(that.mapConfig);
		},100)
	},

	generateOpenStreetMap 	: function (config){
		var that = this;
		that.mapConfig			= config;
		that.lon				= config.lon?config.lon:0;
		that.lat				= config.lat?config.lat:0;
		that.openMap			= new OpenLayers.Map(that.body.id,{
			controls: [new OpenLayers.Control.Navigation()],
			eventListeners:{
				addlayer	: function (layer){
					if (!layer.layer.isBaseLayer){
						that.layerMenu.add({
							text			: layer.layer.name,
							id				: 'chek_'+layer.layer.id,
							layerInstance	: layer.layer,
							checked			: true,
							checkHandler	: function (menuItem,checked){
								menuItem.layerInstance.setVisibility(checked);
								return false;
							}
						});
					}
					that.fireEvent('layerschanged','addlayer',layer)
				},

				preremovelayer	: function(layer){
					that.layerMenu.items.each(function(item,k){
						if(item.layerInstance.id == layer.layer.id){
							that.layerMenu.remove(item);
						}
					});
					that.fireEvent('layerschanged','preremovelayer',layer);
					return true;
				},

				changelayer	: function(layer){
					that.fireEvent('layerschanged','changelayer',layer)
				}
			}
		});

		/*movestart,move,moveend,zoomend,updatesize*/

		that.mapnik				= new OpenLayers.Layer.OSM();
		that.fromProjection		= new OpenLayers.Projection(that.fromProjectionText);
		that.toProjection		= new OpenLayers.Projection(that.toProjectionText);
		that.position 			= new OpenLayers.LonLat(that.lon,that.lat).transform(that.fromProjection,that.toProjection);

		that.vectors			= config.vectors;

		that.openMap.events.register('zoomend', this, function (event) {
			that.zoom = that.openMap.getZoom();
			if ( that.zoom > that.maxZoom ){
				that.openMap.zoomTo(that.maxZoom);
				that.zoom=that.maxZoom;
			}
			Ext.getCmp(that.zoomSliderId).setValue(that.zoom);
			Ext.getCmp(that.zoomTextId).setText(that.zoom);
		});

		that.openMap.events.register('moveend', this, function (event) {
			var pos = that.openMap.getCenter();
			pos = pos.transform(that.toProjection,that.fromProjection);
			Ext.getCmp(that.posTextId).setText('Ln: '+parseInt(pos.lon*1000)/1000+' / Lt: '+parseInt(pos.lat*1000)/1000);
		});

		that.openMap.addLayer(that.mapnik);
		that.openMap.setCenter(that.position, that.zoom);

		Ext.each(config.vectors,function(vector){
			that.vectorLayers[vector.name]	= new OpenLayers.Layer.Vector(vector.name,{});
			var vectorLayer=that.vectorLayers[vector.name];
			that.openMap.addLayer(vectorLayer);
			that.clearVectors(vectorLayer);
			that.initVectors(vectorLayer,vector);
			if(vector.eventMode){
				switch (vector.eventMode.type){
					case 'bubble':
						that.initMapBubble(vectorLayer);
					break;
					case 'events':
						vectorLayer.events.register('featurehover',vectorLayer, function(e) {
							console.log(e.object.name + " says: " + e.feature.id + " hovered.",e);
							return false;
						});
						vectorLayer.events.register('featureclick',vectorLayer, function(e) {
							console.log(e.object.name + " says: " + e.feature.id + " clicked.",e);
							return false;
						});
						vectorLayer.events.register('nofeatureclick',vectorLayer, function(e) {
							console.log(e.object.name + " says: No feature clicked.",e);
							return false;
						});
					break;

				}
			}
			that.openMap.zoomToExtent(vectorLayer.getDataExtent());
			that.openMap.zoomOut();
		});

		Ext.each(config.layers,function(layer){
			that.openMap.addLayer(layer);
		});
	},

	clearVectors	: function(vectorLayer){
		var that = this;
		vectorLayer.removeAllFeatures();
	},

	initVectors		: function(vectorLayer,vectors){
		var that = this;
		var nbDispers	= 0;

		if(!vectors.items){
			return;
		}

		var positions = {}
		Ext.each(vectors.items,function(marker,k){
			var key = marker.coordinates.lon+'_'+marker.coordinates.lat;
			if (positions[key]==undefined){
				nbDispers++;
				positions[key]={
					lon		: marker.coordinates.lon,
					lat		: marker.coordinates.lat,
					points	: [k]
				}
			}else{
				positions[key].points.push(k);
			}
		});

		for(var k in positions){
			var point=positions[k];
			if(point.points.length>1){
				var angle = 2*Math.PI/(point.points.length);
				Ext.each(point.points,function(idxInArray,idx){
					vectors.items[idxInArray].coordinates.lon		= vectors.items[idxInArray].coordinates.lon	+ Math.cos((angle)*parseInt(idx))*that.dispersRadius;
					vectors.items[idxInArray].coordinates.lat		= vectors.items[idxInArray].coordinates.lat	+ Math.sin((angle)*parseInt(idx))*that.dispersRadius;
				});
			}
		};

		Ext.each(vectors.items,function(marker){
			that.position = new OpenLayers.LonLat(marker.coordinates.lon, marker.coordinates.lat).transform( that.fromProjection, that.toProjection);
			vectorLayer.addFeatures(new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.Point( marker.coordinates.lon, marker.coordinates.lat).transform(that.fromProjection, that.toProjection),{
					description		: marker.label,
					record			: marker
				},OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'],{
					externalGraphic	: that.mapConfig.urlMarker,
					graphicHeight	: 17,
					graphicWidth	: 29,
				})
			));
		});
	},

	initMapBubble	: function (vectorLayer){
		var that = this;
		vectorLayer.mapSelector = new OpenLayers.Control.SelectFeature(vectorLayer, {
			onSelect: function (feature) {

				feature.popup = new OpenLayers.Popup.FramedCloud(
					"pop",
					feature.geometry.getBounds().getCenterLonLat(),
					null,
					'<div class="markerContent">'+feature.attributes.description+'</div>',
					{'size':  new OpenLayers.Size(0,0), 'offset': new OpenLayers.Pixel(5, true?-15:15)},
					true,
					function() {
						vectorLayer.mapSelector.unselectAll();
					}
				);
				// Force popin to open on TopRight positition
				feature.popup.calculateRelativePosition = function () {
					return 'tr';
				}
				//feature.popup.closeOnMove = true;
				that.openMap.addPopup(feature.popup);
			}
			, onUnselect: function (feature) {
				feature.popup.destroy();
				feature.popup = null;
			}
		});

		that.openMap.addControl(vectorLayer.mapSelector);
		vectorLayer.mapSelector.activate();
	},

	getMapDescriptionLabelProperties : function (idxInList,offset){
		return {
			label			: ""+(parseInt(idxInList)+1+offset) ,
			labelYOffset	: -15,
			labelXOffset	: parseInt(idxInList)>9?-6:-2,
			fontColor		: "#FFF",
			fontSize		: "10px",
			fontFamily		: "Verdana, Geneva, sans-serif",
			fontWeight		: "bold",
			graphicHeight	: 17,
			graphicWidth	: 29,
			graphicXOffset	: -12,
			graphicYOffset	: 5
		}
	},

	nominatimSearch	: function(param){
		Ext.Ajax.request ({
			method	: 'GET',
			url		: 'http://nominatim.openstreetmap.org/search',
			params	: Ext.apply({
				format	: 'json'
			},param),
			success	: function(data){
				try{
					var result = JSON.parse(data.responseText);
					param.success(result);
				}catch(e){
					param.failure(e);
				}
			},
			failure	: function(data){
				param.failure(data);
			}
		});
	},
});

Ext.reg('sm.openLayers',Ext.eu.sm.openLayers)