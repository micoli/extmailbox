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

	markers					: null,

	dispersRadius			: 0.0025,

	initComponent	: function (){
		var that = this;
		that.mapPanelId		= Ext.id();
		that.zoomSliderId	= Ext.id();
		that.zoomTextId		= Ext.id();
		that.posTextId		= Ext.id();

		that.addEvents('moveend','zoomend');

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
						{name: 'display_name'},
						{name: 'osm_id'},
						{name: 'class'},
						{name: 'type'},
						{name: 'icon'},
						{name: 'lon'},
						{name: 'lat'},
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
			}]
		});

		Ext.eu.sm.pdf.superclass.initComponent.call(this);
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
		that.lon							= config.lon?config.lon:0;
		that.lat							= config.lat?config.lat:0;
		that.openMap						= new OpenLayers.Map(that.body.id,{
			controls: [new OpenLayers.Control.Navigation()]
		});
		that.mapnik							= new OpenLayers.Layer.OSM();
		that.vectorLayer					= new OpenLayers.Layer.Vector("Overlay",{
			eventListeners: {
				featurehover: function(e) {
					console.log(e.object.name + " says: " + e.feature.id + " hovered.",e);
					return false;
				},
				featureclick: function(e) {
					console.log(e.object.name + " says: " + e.feature.id + " clicked.",e);
					return false;
				},
				nofeatureclick: function(e) {
					console.log(e.object.name + " says: No feature clicked.",e);
				}
			}
		});
		that.fromProjection					= new OpenLayers.Projection(that.fromProjectionText);
		that.toProjection					= new OpenLayers.Projection(that.toProjectionText);
		that.position 						= new OpenLayers.LonLat(that.lon,that.lat).transform(that.fromProjection,that.toProjection);

		that.markers						= config.markers;

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
		that.openMap.addLayer(that.vectorLayer);
		that.initMarkers(that.markers);
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

	initMarkers		: function(markers){
		var that = this;
		var nbDispers	= 0;

		if(!markers){
			return;
		}

		var positions = {}
		Ext.each(markers,function(marker,k){
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
					markers[idxInArray].coordinates.lon		= markers[idxInArray].coordinates.lon	+ Math.cos((angle)*parseInt(idx))*that.dispersRadius;
					markers[idxInArray].coordinates.lat		= markers[idxInArray].coordinates.lat	+ Math.sin((angle)*parseInt(idx))*that.dispersRadius;
				});
			}
		};

		Ext.each(markers,function(marker){
			that.position = new OpenLayers.LonLat(marker.coordinates.lon, marker.coordinates.lat).transform( that.fromProjection, that.toProjection);
			that.vectorLayer.addFeatures(new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.Point( marker.coordinates.lon, marker.coordinates.lat).transform(that.fromProjection, that.toProjection),{
					description		: marker.label,
					data			: marker
				},OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'],{
					externalGraphic	: 'http://front.data.servicemagic.eu/common/common/images/picto_house_map.png'
				})
			));
		});

		that.openMap.zoomToExtent(that.vectorLayer.getDataExtent());
		that.openMap.zoomOut();

	},

	initMapSelector	: function (){
		var that = this;
		that.mapSelector = new OpenLayers.Control.SelectFeature(that.vectorLayer, {
			onSelect: function (feature) {

				feature.popup = new OpenLayers.Popup.FramedCloud(
					"pop",
					feature.geometry.getBounds().getCenterLonLat(),
					null,
					'<div class="markerContent">'+feature.attributes.description+'</div>',
					{'size':  new OpenLayers.Size(0,0), 'offset': new OpenLayers.Pixel(5, isSpPage?-15:15)},
					true,
					function() {
						that.mapSelector.unselectAll();
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

		that.openMap.addControl(that.mapSelector);
		that.mapSelector.activate();

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
	}
});

Ext.reg('sm.openLayers',Ext.eu.sm.openLayers)