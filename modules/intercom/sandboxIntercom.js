Ext.onReady(function(){
	var intercom = new Intercom();

	intercom.on('intercomHandler', function(data) {
		sandBoxAddToList(JSON.stringify(data.message),'message');
	});

	new Ext.ux.sandboxViewport({
		customItems:[{
			xtype	: 'panel',
			title	: 'ee',
			items : [{
				xtype: 'button',
				text : 'send',
				handler : function(){
					intercom.emit('intercomHandler', {message: new Date()})
				}
			}]
		}]
	});

});