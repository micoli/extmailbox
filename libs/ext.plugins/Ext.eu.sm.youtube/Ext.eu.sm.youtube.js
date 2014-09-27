Ext.ns('Ext.eu.sm');
//https://developers.google.com/youtube/js_api_reference
Ext.eu.sm.youtube = Ext.extend(Ext.Panel, {
	youtubeId				: '',
	frame					: true,
	swfObj					: null,
	timer					: null,

	initComponent			: function(){
		var that=this;
		that.swfContainerId		= Ext.id();
		that.toolbarcenterID	= Ext.id();
		that.sliderPosID		= Ext.id();
		that.sliderVolID		= Ext.id();
		that.lblloadedID		= Ext.id();
		that.lbldurationID		= Ext.id();
		that.btplayID			= Ext.id();
		that.btpauseID			= Ext.id();

		Ext.eu.sm.youtube.init();
		Ext.eu.sm.youtube.refById[that.swfContainerId] = that;

		that.globalNamespaceId = 'Ext_eu_sm_youtube_'+that.swfContainerId.replace('-','');

		Ext.apply(this,{
			layout	: 'border',
			items	: [{
				region		: 'center',
				xtype		: 'eu.sm.swfobject',
				border		: false,
				swfConfig	: {
					swfUrlStr		: "http://www.youtube.com/v/"+that.youtubeId+"?enablejsapi=1&version=3&playerapiid="+that.swfContainerId,
					swfContainerId	: that.swfContainerId,
					widthStr		: "100",
					heightStr		: "100",
					swfVersionStr	: "8",
					xiSwfUrlStr		: null,
					flashVarsObj	: null,
					parObj			: {
						allowScriptAccess: "always"
					}
				},
				listeners	: {
					objectCreated : function (obj,swfObj){
						that.swfObj=swfObj;
					}
				}
			},{
				region	: 'south',
				layout	: 'border',
				height	: 30,
				items	: [{
					region	: 'west',
					width	: 60,
					xtype	: 'toolbar',
					items : [{
						xtype	: 'label',
						text	: '',
						width	: 50,
						id		: that.lbldurationID,
					}],
				},{
					region	: 'center',
					xtype	: 'toolbar',
					id		: that.toolbarcenterID,
					items	: [{
						id			: that.sliderPosID,
						xtype		: 'slider',
						minValue	: 0,
						maxValue	: 1000,
						width		: 1,
						disabled	: true,
						listeners : {
							'drag' : function (slider, e ){
								//that.cmpPlayer.currentTime = that.cmpPlayer.duration/1000*slider.getValue();
							}
						}
					}]
				},{
					region	: 'east',
					xtype	: 'toolbar',
					width	: 170,
					items : [{
						xtype	: 'button',
						id		: that.btplayID,
						iconCls	: 'icon-playerPlay', //class defini dans cyrus_crm/css/desktop.css
						disabled: true,
						handler	: that.play
					},{
						xtype	: 'button',
						id		: that.btpauseID,
						iconCls	: 'icon-playerPause',
						disabled: true,
						handler	: that.pause
					},{
						id		: that.sliderVolID,
						xtype	: 'slider',
						disabled: true,
						minValue: 0,
						maxValue: 100,
						value	: 100,
						width	: 40,
						listeners : {
							'drag' : function (slider, e ){
								//that.cmpPlayer.volume = slider.getValue()/100;
							}
						}
					},{
						xtype	: 'label',
						style	: {
							color		:	'#00F',
							paddingLeft	:	10
						},
						text	: '',
						id		: that.lblloadedID,
					}],
					listeners:{
						'resize'  : function ( p ){
							that.initSlider();
						}
					}
				}]
			}],
			listeners	: {
				beforedestroy	: function(){
					that.iterateSwfEvent(function(funcName,handler,eventName){
						delete(window[funcName]);
					})
				}
			}
		});
		Ext.eu.sm.youtube.superclass.initComponent.call(this);
	},

	updateProgress			: function (){
		var that = this;
		if(!Ext.getCmp(that.sliderPosID)){
			that.stopTimer();
			return;
		}
		//if(that.duration>0){
		var currentTimeInt = that.swfObj.getCurrentTime();
		Ext.getCmp(that.sliderPosID).setValue(currentTimeInt / that.duration*1000);
		var divisor_for_minutes = that.duration % (60 * 60);
		var duration_minutes = Math.floor(divisor_for_minutes / 60);
		var divisor_for_seconds = divisor_for_minutes % 60;
		var duration_seconds = Math.ceil(divisor_for_seconds);
		if(duration_seconds<10){
			var duration = (that.duration==0?"--":parseInt(duration_minutes)) +':'+ (that.duration==0?"--":"0"+parseInt(duration_seconds));
		}else{
			var duration = (that.duration==0?"--":parseInt(duration_minutes)) +':'+ (that.duration==0?"--":parseInt(duration_seconds));
		}

		var divisor_for_minutes2 = currentTimeInt % (60 * 60);
		var currentTime_minutes = Math.floor(divisor_for_minutes2 / 60);
		var divisor_for_seconds2 = divisor_for_minutes2 % 60;
		var currentTime_seconds = Math.ceil(divisor_for_seconds2);
		if(currentTime_seconds<10){
			seconds = 0;
		}else{
			seconds = -1;
		}

		//var duration = (that.duration==0?"--":parseInt(duration_minutes)) +':'+ (that.duration==0?"--":parseInt(duration_seconds));
		var currentTime = parseInt(currentTime_minutes) +':'+ (seconds==0?"0"+parseInt(currentTime_seconds):parseInt(currentTime_seconds));

		Ext.getCmp(that.lbldurationID).setText(currentTimeInt +'/'+ duration);
		//Ext.getCmp(that.lbldurationID).setText(parseInt(that.cmpPlayer.currentTime) +'/'+ (that.duration==0?"--":parseInt(that.duration)));
	},

	initSlider				: function(){
		var that=this;
		Ext.getCmp(that.sliderPosID).setWidth(Ext.getCmp(that.toolbarcenterID).getSize().width-10);
	},

	initTimer				: function(){
		var that=this;
		that.timer = setInterval(function(){
			that.updateProgress.call(that);
		}, 200);
	},

	stopTimer				: function(){
		var that=this;
		window.clearInterval(that.timer);
	},

	iterateSwfEvent			: function (callback){
		var that=this;
		for (var handlerName in that){
			if ((typeof that[handlerName] =='function') && /^swfOn/.test(handlerName)){
				callback(that.globalNamespaceId+'_'+handlerName,that[handlerName],handlerName.replace(/^swfOn/,'on'));
			}
		}
	},

	initControls		: function (){
		var that=this;

		that.iterateSwfEvent(function(funcName,handler,eventName){
			window[funcName] = handler.createDelegate(that);
			that.swfObj.addEventListener(eventName,funcName);
		});


		that.initSlider();

		/*
		that.cmpPlayer.addEventListener("durationchange",function(){
			//console.log("durationchange ",that.cmpPlayer.duration);
			if(that.cmpPlayer.duration != Infinity && that.cmpPlayer.duration>0){
				that.duration = that.cmpPlayer.duration;
				//console.log("durationchange <>0",that.cmpPlayer.duration);
			}
		},false);

		that.cmpPlayer.addEventListener("error",function(){
			if(that.src!='') Ext.getCmp(that.lblloadedID).setText('error')
		},false);
		*/
	},

	changeDuration : function(){
		var that=this;
		duration = that.swfObj.getDuration();
		console.log("durationchange ",duration);
		if(duration != Infinity && duration>0){
			that.duration = duration;
			//console.log("durationchange <>0",that.cmpPlayer.duration);
		}
	},

	swfOnStateChange : function(state){
		var that=this;
		switch(state){
			case -1 ://(unstarted)
				that.changeDuration();
			break;
			case 0 ://(ended)
				that.stopTimer();
				that.lastTimerState = 0;
			break;
			case 1 ://(playing)
				that.initSlider();
				Ext.getCmp(that.btplayID).setDisabled(true);
				Ext.getCmp(that.btpauseID).setDisabled(false);
				Ext.getCmp(that.lblloadedID).setText('');
				that.lastTimerState = 1;
				that.initTimer();
			break;
			case 2 ://(paused)
				Ext.getCmp(that.btplayID).setDisabled(false);
				Ext.getCmp(that.btpauseID).setDisabled(true);
				that.stopTimer();
				that.lastTimerState = 0;
			break;
			case 3 ://(buffering)
				Ext.getCmp(that.lblloadedID).setText('loading')
				that.changeDuration();
			break;
			case 5 ://(video cued).
				Ext.getCmp(that.lblloadedID).setText('OK')
				Ext.getCmp(that.btplayID).setDisabled(false);
				that.changeDuration();
			break;

		}
		console.log(arguments);
	},

	swfOnPlaybackQualityChange : function(){
		console.log(arguments);
	},

	swfOnPlaybackRateChange : function(){
		console.log(arguments);
	},

	loadVideo		: function(id){
		var that = this;
		that.youtubeId = id;
		//cueVideoById
		that.swfObj.loadVideoById({
			'videoId'			: that.youtubeId,
			//'startSeconds'		: 5,
			//'endSeconds'		: 60,
			//'suggestedQuality'	: 'large'
		});
	},

	getPlayer		: function(){
		var that = this;
		return that.player;
	}
});

Ext.eu.sm.youtube = Ext.apply(Ext.eu.sm.youtube,{
	refById					: {},
	init					: function (){
		if(typeof window.onYouTubePlayerReady == 'function'){
			if(window.onYouTubePlayerReady!=Ext.eu.sm.youtube.onYouTubePlayerReady){
				window.onYouTubePlayerReady.createInterceptor(Ext.eu.sm.youtube.onYouTubePlayerReady);
			}
		}else{
			window.onYouTubePlayerReady = Ext.eu.sm.youtube.onYouTubePlayerReady
		}
	},

	onYouTubePlayerReady	: function(playerId){
		Ext.eu.sm.youtube.refById[playerId].initControls.call(Ext.eu.sm.youtube.refById[playerId]);
	}
});

Ext.reg('eu.sm.youtube',Ext.eu.sm.youtube);

/*
Ext.ns('Ext.ux.audioplayer');
Ext.ux.AudioPlayer = Ext.extend(Ext.Panel, {
	width	: 300,
	height	: 40,
	frame	: true,
	layout	: 'border',
	initComponent	: function(config) {
		var that = this;
		that.playerID = Ext.id();
		that.sliderPosID = Ext.id();
		that.sliderVolID = Ext.id();
		that.lblloadedID = Ext.id();
		that.lbldurationID = Ext.id();
		that.btplayID = Ext.id();
		that.btpauseID = Ext.id();
		that.toolbarcenterID = Ext.id();

		that.timer = 0;
		that.lastTimerState = 0;
		that.cmpPlayer = null;
		that.duration=0;

		that.initSlider = function(){
			Ext.getCmp(that.sliderPosID).setWidth(Ext.getCmp(that.toolbarcenterID).getSize().width-10);
		}

		that.initControls = function(){
			console.log('activation html5 player '+that.playerID);

			that.cmpPlayer = Ext.get(that.playerID).dom;
			that.cmpPlayer.volume = 1;
			that.initSlider();

			that.cmpPlayer.addEventListener("canplay",function(){
				Ext.getCmp(that.lblloadedID).setText('OK')
				Ext.getCmp(that.btplayID).setDisabled(false);
			},false);

			that.cmpPlayer.addEventListener("durationchange",function(){
				//console.log("durationchange ",that.cmpPlayer.duration);
				if(that.cmpPlayer.duration != Infinity && that.cmpPlayer.duration>0){
					that.duration = that.cmpPlayer.duration;
					//console.log("durationchange <>0",that.cmpPlayer.duration);
				}
			},false);

			that.cmpPlayer.addEventListener("loadstart",function(){
				Ext.getCmp(that.lblloadedID).setText('loading')
			},false);

			that.cmpPlayer.addEventListener("error",function(){
				if(that.src!='') Ext.getCmp(that.lblloadedID).setText('error')
			},false);

			that.cmpPlayer.addEventListener("playing",function(){
				that.initSlider();
				Ext.getCmp(that.btplayID).setDisabled(true);
				Ext.getCmp(that.btpauseID).setDisabled(false);
				Ext.getCmp(that.lblloadedID).setText('');
				that.lastTimerState = 1;
				that.initTimer();
			},false);

			that.cmpPlayer.addEventListener("ended",function(){
				that.stopTimer();
				that.lastTimerState = 0;
			},false);

			that.cmpPlayer.addEventListener("pause",function(){
				Ext.getCmp(that.btplayID).setDisabled(false);
				Ext.getCmp(that.btpauseID).setDisabled(true);
				that.stopTimer();
				that.lastTimerState = 0;
			},false);
		}

		that.updateProgress = function (){
			if(!Ext.getCmp(that.sliderPosID)){
				that.stopTimer();
				return;
			}
			//if(that.duration>0){
				Ext.getCmp(that.sliderPosID).setValue(that.cmpPlayer.currentTime / that.cmpPlayer.duration*1000);
				var divisor_for_minutes = that.duration % (60 * 60);
				var duration_minutes = Math.floor(divisor_for_minutes / 60);
				var divisor_for_seconds = divisor_for_minutes % 60;
				var duration_seconds = Math.ceil(divisor_for_seconds);
				if(duration_seconds<10){
					var duration = (that.duration==0?"--":parseInt(duration_minutes)) +':'+ (that.duration==0?"--":"0"+parseInt(duration_seconds));
				}else{
					var duration = (that.duration==0?"--":parseInt(duration_minutes)) +':'+ (that.duration==0?"--":parseInt(duration_seconds));
				}

				var divisor_for_minutes2 = that.cmpPlayer.currentTime % (60 * 60);
				var currentTime_minutes = Math.floor(divisor_for_minutes2 / 60);
				var divisor_for_seconds2 = divisor_for_minutes2 % 60;
				var currentTime_seconds = Math.ceil(divisor_for_seconds2);
				if(currentTime_seconds<10){
					seconds = 0;
				}else{
					seconds = -1;
				}

				//var duration = (that.duration==0?"--":parseInt(duration_minutes)) +':'+ (that.duration==0?"--":parseInt(duration_seconds));
				var currentTime = parseInt(currentTime_minutes) +':'+ (seconds==0?"0"+parseInt(currentTime_seconds):parseInt(currentTime_seconds));

			Ext.getCmp(that.lbldurationID).setText(currentTime +'/'+ duration);
			//Ext.getCmp(that.lbldurationID).setText(parseInt(that.cmpPlayer.currentTime) +'/'+ (that.duration==0?"--":parseInt(that.duration)));
		}

		that.initTimer = function(){
			that.timer = setInterval(that.updateProgress, 200);
		}

		that.stopTimer= function(){
			window.clearInterval(that.timer);
		}

		that.setSrc = function(src){
			that.duration=0;

			Ext.getCmp(that.lblloadedID).setText("Loading");
			Ext.getCmp(that.sliderPosID).setDisabled(false);
			Ext.getCmp(that.sliderVolID).setDisabled(false);

			that.cmpPlayer.src = src;
		}

		that.play = function(src){
			that.cmpPlayer.play();
		}

		that.pause = function(src){
			that.cmpPlayer.pause();
		}

		Ext.apply(this,{
			items : [{
				region	: 'north',
				height	: 1,
				html	: 	'<audio  id="'+that.playerID+'" style="display:none;width:100px;height:80px;" controls="controls" '+(that.src?(' src="'+that.src+'" '):"")+'"></audio>'
			},{
				region	: 'west',
				width	: 60,
				xtype	: 'toolbar',
				items : [{
					xtype	: 'label',
					text	: '',
					width	: 50,
					id		: that.lbldurationID,
				}],
			},{
				region	: 'center',
				xtype	: 'toolbar',
				id		: that.toolbarcenterID,
				items	:[{
					id		: that.sliderPosID,
					xtype	: 'slider',
					minValue: 0,
					maxValue: 1000,
					width	: 1,
					disabled: true,
					listeners : {
						'drag' : function (slider, e ){
							that.cmpPlayer.currentTime = that.cmpPlayer.duration/1000*slider.getValue();
						}
					}
				}]
			},{
				region	: 'east',
				xtype	: 'toolbar',
				width	: 170,
				items : [{
					xtype	: 'button',
					id		: that.btplayID,
					//text	: 'play',
					iconCls	: 'icon-playerPlay', //class defini dans cyrus_crm/css/desktop.css
					disabled: true,
					handler	: that.play
				},{
					xtype	: 'button',
					id		: that.btpauseID,
					//text	: 'pause',
					iconCls	: 'icon-playerPause',
					disabled: true,
					handler	: that.pause
				},{
					id		: that.sliderVolID,
					xtype	: 'slider',
					disabled: true,
					minValue: 0,
					maxValue: 100,
					value	: 100,
					width	: 40,
					listeners : {
						'drag' : function (slider, e ){
							that.cmpPlayer.volume = slider.getValue()/100;
						}
					}
				},{
					xtype	: 'label',
					style	: {
						color		:	'#00F',
						paddingLeft	:	10
					},
					text	: '',
					id		: that.lblloadedID,
				}],
				listeners:{
					'resize'  : function ( p ){
						that.initControls();
					}
				}
			}]
		});
		Ext.ux.AudioPlayer.superclass.initComponent.apply(this,arguments);
	}
});
Ext.reg('audioplayer', Ext.ux.AudioPlayer);
*/