Ext.define('modules.desktop', {
	extend: 'MyDesktop.genericDesktop',

	requires	: [
		'Ext.modules.redmine4.main'
	],

	autoExec 	: ['redmine4_main-RedMine'],

	appItems	: [{
		xtype	: 'redmine4_main'	,
		title	: 'RedMine'			,
		iconCls	: 'auto'
	},{
		xtype	: 'qd.system.systemStatus'	,
		title	: 'systemStatus'			,
		iconCls	: 'auto'
	}],

	extraInit	:function() {
	},

	init		: function() {
		var that = this;
		that.callParent.call(that);
	}
});