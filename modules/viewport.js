Ext.define('modules.viewport', {
	extend : 'Ext.container.Viewport',
	layout: 'border',
	requires	: [
		'Ext.modules.redmine4.main'
	],
	items: [{
		xtype	: 'redmine4_main'	,
		title	: 'RedMine'			,
		region	: 'center'
	}]
});