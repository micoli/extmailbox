Ext.ns('Ext.eu.sm.prospectImporter');
Ext.eu.sm.prospectImporter.main = Ext.extend(Ext.Panel, {
	initComponent	: function (){
		var that = this;
		that.uploadFormId		= Ext.id();
		that.mainGridId			= Ext.id();
		that.uploadButtonId		= Ext.id();
		that.browseButtonId		= Ext.id();
		that.filenameLabelId	= Ext.id();


/*		ImporterCmp.store.data.each(function(v,k){
			objToSend.attachments.push(objToSend.message_id + '-' + v.get('fileName'));
			if(v.get('state')=='queued' || v.get('state')=='uploading'){
				uploadsOk=false;
			}
		});
*/
		Ext.apply(that,{
			layout	: 'border',
			items	: [{
				xtype			: 'tabpanel',
				activeItem		: 2,
				region			: 'center',
				split			: true,
				frame			: true,
				height			: 100,
				listeners		: {
					tabchange		: function(tabpanel,tab){
						if(tab && tab.refresh){
							tab.refresh();
						}
					}
				},
				items			: [{
					title			: 'Uploader',
					xtype			: 'prospectImporter.batchConfigurationEditor',
				},{
					title			: 'Campaign',
					xtype			: 'prospectImporter.campaignEditor',
				},{
					title			: 'batch grid editor',
					xtype			: 'prospectImporter.importGridEditor',
				}]
			}]
		});
		Ext.eu.sm.prospectImporter.main.superclass.initComponent.call(this);
	}
});

Ext.reg('prospectImporter.main',Ext.eu.sm.prospectImporter.main);