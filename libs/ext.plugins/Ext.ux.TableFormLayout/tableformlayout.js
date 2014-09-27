/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */

Ext.onReady(function() {
    var form = new Ext.form.FormPanel({
        baseCls: 'x-plain',
        labelWidth: 55,
        url:'save-form.php',
        defaultType: 'textfield',
	layout: "tableform",
	layoutConfig: {
	    columns: 3,
	    columnWidths: [0.25,0.5,0.25]
	},
        items: [{
            fieldLabel: 'Send From',
            anchor:'100%'
        },{
            fieldLabel: 'Send To',
            anchor:'100%'
        },{
            fieldLabel: 'Check me',
	    xtype: 'checkbox',
            anchor:'100%'
        },{
            fieldLabel: 'Subject',
            anchor:'100%',
	    colspan: 3
        },{
            xtype: 'textarea',
	    anchor: '100%',
	    colspan: 3
        }]
    });

    var window = new Ext.Window({
        title: 'Resize Me',
        width: 500,
        height:300,
        minWidth: 300,
        minHeight: 200,
        layout: 'fit',
        plain:true,
        bodyStyle:'padding:5px;',
        buttonAlign:'center',
        items: form,

        buttons: [{
            text: 'Send'
        },{
            text: 'Cancel'
        }]
    });

    window.show();
});