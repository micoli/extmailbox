Ext.ns('Ext.eu.sm.MailBox.MailSelect');

Ext.eu.sm.MailBox.MailSelect.ContactWindow = Ext.extend(Ext.grid.GridPanel, {
	initComponent	: function (){
		var that			= this;
		that.txtPersonalId	= Ext.id();
		that.txtEmailId		= Ext.id();

		this.addEvents('selected');

		that.refreshSearch = function(){
			var options = {params:{}};
			var txt='';
			var ok2load = false;
			txt=Ext.getCmp(that.txtEmailId).getValue();
			if (txt){
				options.params['email']=txt;
				ok2load=true;
			}
			txt=Ext.getCmp(that.txtPersonalId).getValue();
			if (txt){
				options.params['personal']=txt;
				ok2load=true;
			}
			if(ok2load){
				that.store.load(options);
			}
		}

		//that.store.removeAll();

		Ext.apply(that,{
			tbar				:[Ext.eu.sm.MailBox.i18n._('Name'),{
				xtype				: 'textfield',
				width				: 140,
				id					: that.txtPersonalId,
				enableKeyEvents		: true,
				listeners			: {
					keyup:function(field,e){
						if(e.getKey() == e.ESC){
							that.fireEvent("cancel");
							e.preventDefault();
						}
						if(e.getKey() == e.ENTER){
							that.refreshSearch();
							e.preventDefault();
						}
					}
				}
			},Ext.eu.sm.MailBox.i18n._('email'),{
				xtype				: 'textfield',
				width				: 140,
				id					: that.txtEmailId,
				enableKeyEvents		: true,
				listeners			: {
					keyup:function(field,e){
						if(e.getKey() == e.ESC){
							that.fireEvent("cancel");
							e.preventDefault();
						}
						if(e.getKey() == e.ENTER){
							that.refreshSearch();
							e.preventDefault();
						}
					}
				}
			}],
			autoExpandColumn	: 'personal',
			selModel			: new Ext.grid.RowSelectionModel({
				singleSelect		: true
			}),
			columns				: [{
				dataIndex	: 'personal',
				id			: 'personal',
				fixed		: false,
				width		: 200
			},{
				dataIndex	: 'email',
				id			: 'email',
				fixed		: true ,
				width		: 200
			}]
		});

		Ext.eu.sm.MailBox.MailSelect.ContactWindow.superclass.initComponent.call(this);

		this.on('rowdblclick'	, function(grid,rowIndex,e) {
			that.fireEvent("selected",grid.getStore().getAt(rowIndex));
		});

		this.on('render'	, function(e) {
			window.setTimeout(function(){
				Ext.getCmp(that.txtPersonalId).focus();
			},150);
		});
	}
});

Ext.reg('mailbox.contactWindow',Ext.eu.sm.MailBox.MailSelect.ContactWindow);
