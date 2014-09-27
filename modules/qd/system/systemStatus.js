Ext.define('qd.system.systemStatus', {
	extend		: 'Ext.Panel',
	alias		: 'widget.qd.system.systemStatus',
	timer		: null,

	afterRender: function () {
		var that = this;
		Ext.Function.defer(that.refresh, 500, that);
		that.callParent();
	},

	closeTimer : function(){
		var that = this;
		if (that.timer) {
			window.clearTimeout(that.timer);
			that.timer = null;
		}
	},

	onClose: function () {
		var that = this;
		that.closeTimer();
		that.callParent();
	},

	onDestroy: function () {
		var that = this;
		that.closeTimer();
		that.callParent();
	},

	initComponent : function() {
		var that			= this;
		that.combospeedid	= Ext.id();
		that.statusid		= Ext.id();

		Ext.define('diskitem', {
			extend	: 'Ext.data.Model',
			fields	: [
				'device'	,
				'mountPoint',
				'type'		,
				'totalSize'	,
				'totalSizeH',
				'freeSpace'	,
				'freeSpaceH',
				'percent'
			]
		});

		that.diskitemStore = Ext.create('Ext.data.Store',{
			model		: 'diskitem',
			autoLoad	: true,
			proxy		: {
				type			: 'ajaxEx',
				url				: 'p/QDMediaDBSystemStatus.diskStatus/',
				reader			: {
					type			: 'json',
					root			: 'data'
				}
			}
		});

		Ext.define('processitem', {
			extend	: 'Ext.data.Model',
			fields	: [
				{name: 'pid',	type: 'int'},
				'tcomm'			,
				'state'			,
				'ppid'			,
				'pgid'			,
				'sid'			,
				'tty_nr'		,
				'tty_pgrp'		,
				'flags'			,
				'min_flt'		,
				'cmin_flt'		,
				'maj_flt'		,
				'cmaj_flt'		,
				'utime'			,
				'stime'			,
				'cutime'		,
				'cstime'		,
				'priority'		,
				'nice'			,
				'num_threads'	,
				'it_real_value'	,
				'start_time'	,
				'vsize'			,
				'rss'			,
				'rsslim'		,
				'start_code'	,
				'end_code'		,
				'start_stack'	,
				'esp'			,
				'eip'			,
				'pending'		,
				'blocked'		,
				'sigign'		,
				'sigcatch'		,
				'wchan'			,
				'zero1'			,
				'zero2'			,
				'exit_signal'	,
				'cpu'			,
				'rt_priority'	,
				'policy'		,
				'cmd_line'		,
				{name: 'user_util'	,	type: 'float'},
				{name: 'system_util',	type: 'float'},
				{name: 'total_util'	,	type: 'float'},
			]
		});

		that.processitemStore = Ext.create('Ext.data.Store',{
			model		: 'processitem',
			autoLoad	: true,
			proxy		: {
				type			: 'ajaxEx',
				url				: 'p/QDMediaDBSystemStatus.processes/',
				reader			: {
					type			: 'json',
					root			: 'processes'
				}
			},
			sorters: [{
				property: 'total_util',
				direction: 'DESC'
			}]
		});

		Ext.define('cpuitem', {
			extend	: 'Ext.data.Model',
			fields	: [
				'idle'	,
				'sys'	,
				'user'	,
				'ts'
			]
		});

		that.cpuhistoStore = Ext.create('Ext.data.Store',{
			model		: 'cpuitem',
			autoLoad	: false,
			proxy		: {
				type			: 'ajaxEx',
				url				: 'p/QDMediaDBSystemStatus.cpuStatus/',
				reader			: {
					type			: 'json',
					root			: 'data'
				}
			}
		});

		that.refresh = function(){
			Ext.Ajax.request({
				url		: 'p/QDMediaDBSystemStatus.status/',
				method	: 'GET',
				scope	: this,
				success	: function(response, opts) {
					response = Ext.decode(response.responseText);
					that.processitemStore.removeAll();
					that.processitemStore.loadData(response.processes);
					that.diskitemStore.removeAll();
					if(that.cpuhistoStore.count()==1){
						response.cpu.cpu0.ts --;
						that.cpuhistoStore.loadData([response.cpu.cpu0],true)
						response.cpu.cpu0.ts ++;
					}
					that.diskitemStore.loadData(response.disks);
					that.cpuhistoStore.loadData([response.cpu.cpu0],true)
					if(that.cpuhistoStore.count()>10){
						that.cpuhistoStore.removeAt(0);
					}
					if(that.getEl()){
						Ext.Function.defer(that.refresh, 3*1000, that);
					}
				},
				failure : Ext.emptyFn
			});
		}

		that.addSeparatorsNF = function (nStr, inD, outD, sep){
			nStr += '';
			var dpos = nStr.indexOf(inD);
			var nStrEnd = '';
			if (dpos != -1) {
				nStrEnd = outD + nStr.substring(dpos + 1, nStr.length);
				nStr = nStr.substring(0, dpos);
			}
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(nStr)) {
				nStr = nStr.replace(rgx, '$1' + sep + '$2');
			}
			return nStr + nStrEnd;
		}

		that.floatRenderer=function (value) {
			if (value) {
				if(! value.toFixed){
					console.log(value);
				}
				var val = value.toFixed(2);
				return that.addSeparatorsNF(val, '.', ',', '.');
			}
			else return "";
		}

		Ext.apply(this, {
			layout		: 'border',
			/*tbar		:[{
				xtype		: 'button',
				text		: 'refresh',
				handler		: function(){
					that.refresh();
				}
			}],*/
			items		: [{
				xtype		: 'grid',
				region		: 'east',
				layout		: 'fit',
				width		: 500,
				split		: true,
				border		: false,
				store		: that.diskitemStore,
				loadMask	: true,
				autoFit		: true,
				bbar		:[{
					xtype		: 'button',
					text		: 'refresh',
					handler		: function(){
						that.diskitemStore.load();
						//that.refresh();
					}
				}],columns		: [{
					header: "mountPoint"		, width:  80,flex : 1, dataIndex: 'mountPoint'			, sortable: true,
				},{
					header: "device"	, width:  110, dataIndex: 'device'		, sortable: true,fixed	:true,
					renderer : function (val, meta, record, rowIndex, colIndex, store){
						var percent = 100-record.data.percent;
						var width = this.columns[0].getWidth();
						var bar = parseInt(percent/25)+1;
						meta.style = meta.style+";background-position: "+(percent==0?-120:(width*percent/100)-120)+"px 50%; background-image: url('skins/resources/progressbar/percentImage_back"+bar+".png'); background-repeat:no-repeat;";
						return record.data.device;
					}
				},{
					header: "type"	, width:  80, dataIndex: 'type'				, sortable: true
				},{
					header: "free"	, width: 100, dataIndex: 'freeSpaceH'		, sortable: true
				},{
					header: "size"	, width: 100, dataIndex: 'totalSizeH'		, sortable: true
				}]
			},{
				layout	: 'border',
				region	: 'center',
				border	: false,
				items	: [{
					xtype		: 'grid',
					region		: 'center',
					layout		: 'fit',
					border		: false,
					store		: that.processitemStore,
					loadMask	: true,
					split		: true,
					autoFit		: true,
					autoExpandColumn: 'cmd_line',
					bbar		:[{
						xtype		: 'button',
						text		: 'refresh',
						handler		: function(){
							that.processitemStore.load();
						}
					}],
					columns		: [{
						header: "pid"		, width: 50, dataIndex: 'pid'			, sortable: true,align	: 'right'
					},{
						header: "bin"		, width: 100, dataIndex: 'tcomm'		, sortable: true
					},{
						header: "threads"	, width: 50, dataIndex: 'num_threads'	, sortable: true,align	: 'right'
					},{
						header: "priority"	, width: 50, dataIndex: 'priority'		, sortable: true,align	: 'right'
					},{
						header: "total"		, width: 60, dataIndex: 'total_util'	, sortable: true,align	: 'right',renderer : that.floatRenderer
					},{
						header: "user"		, width: 60, dataIndex: 'user_util'		, sortable: true,align	: 'right',renderer : that.floatRenderer
					},{
						header: "system"	, width: 60, dataIndex: 'system_util'	, sortable: true,align	: 'right',renderer : that.floatRenderer
					},{
						header: "command"	, flex	: 1, dataIndex: 'cmd_line'
					}]
				},{
					id		: 'chartCPU',
					xtype	: 'chart',
					border	: false,
					region	: 'south',
					style	: 'background:#fff',
					animate	: true,
					split	: true,
					height	: 200,
					store	: that.cpuhistoStore,
					legend	: {
						position	: 'right'
					},
					axes	: [{
						type	: 'Numeric',
						grid	: true,
						position: 'left',
						fields	: ['idle', 'sys', 'user'],
						title	: 'load',
						minimum	: 0,
						adjustMinimumByMajorUnit: 0,
						grid	: {
							odd		: {
								opacity	: 1,
								fill	: '#ddd',
								stroke	: '#bbb',
								'stroke-width': 1
							}
						}
					}],
					series	: [{
						type		: 'line',
						highlight	: false,
						axis		: 'left',
						xField		: 'ts',
						yField		: 'idle',
						style		: {
							opacity: 0.93
						}
					},{
						type		: 'line',
						highlight	: false,
						axis		: 'left',
						xField		: 'ts',
						yField		: 'sys',
						style		: {
							opacity: 0.93
						}
					},{
						type		: 'line',
						highlight	: false,
						axis		: 'left',
						xField		: 'ts',
						yField		: 'user',
						style		: {
							opacity: 0.93
						}
					}]
				}]
			}]
		});
		this.callParent(this);
	}
});