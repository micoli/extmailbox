Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.timeLogEditor = Ext.extend(Ext.ux.ExtForm,{

	setValues : function (val){
		var that = this;
		return that.getForm().setValues(val);
	},

	initComponent	: function(){
		var that	= this;
		var aTime_entry_activities=[];
		that.defaultTimeEntryActivity=-1;
		Ext.each(Ext.org.micoli.redmine.service.enumerations.time_entry_activities.raw,function(v,k){
			if(k==0){
				that.defaultTimeEntryActivity=v.id
			}
			aTime_entry_activities.push({
				boxLabel	: v.name,
				name		: 'activity_id',
				inputValue	: v.id
			})
		});
		var aButtons = [];
		if(that.addOrEdit=='add'){
			aButtons.push({
				text : 'Add',
				handler	: function(){
					that.addRecord();
				}
			});
		}
		if(that.addOrEdit=='edit'){
			aButtons.push({
				text : 'Update',
				handler	: function(){
					that.saveRecord();
				}
			});
		}
		aButtons.push({
			text : 'Cancel',
			handler	: function(){
				that.fireEvent('cancel');
			}
		});

		Ext.apply(this,{
			frame	: true,
			layout:'column',
			items:[{
				columnWidth:.5,
				layout: 'form',
				defaults: {
					anchor	: '97%'
				},
				items: [{
					fieldLabel	: 'id',
					xtype		: 'hidden',
					dataIndex	: 'id',
					name		: 'id',
					readOnly	: true
				},{
					fieldLabel	: 'issue id',
					xtype		: 'hidden',
					dataIndex	: 'issue_id',
					name		: 'issue_id',
					readOnly	: false
				},{
					fieldLabel	: 'Date',
					xtype		: 'datefield',
					dataIndex	: 'date',
					name		: 'date'
				},{
					fieldLabel	: 'Hours',
					xtype		: 'numberfield',
					dataIndex	: 'hours',
					name		: 'hours'
				},{
					fieldLabel	: 'Comment',
					xtype		: 'textarea',
					dataIndex	: 'comments',
					name		: 'comments',
					height		: 50
				}]
			},{
				columnWidth:.5,
				layout: 'form',
				defaults: {
					anchor	: '97%'
				},
				items: [{
					fieldLabel	: 'Activities',
					xtype		: 'radiogroup',
					name		: 'activity_id',
					columns		: 1,
					items		: aTime_entry_activities
				}]
			}],
			buttons		: aButtons
		});

		that.addRecord = function(){
			that.redmineService.request({
				method			: 'POST',
				url				: 'time_entries.json',
				jsonData		:  {
					time_entry		: that.getForm().getValues(),
				},
				success			: function (response){
					that.fireEvent('saved');
				},
				failure			: Ext.org.micoli.redmine.service.requestFailure
			});
		}

		that.saveRecord = function(){
			that.redmineService.request({
				method			: 'PUT',
				url				: 'time_entries/'+that.getForm().findField('id').getValue()+'.json',
				jsonData		:  {
					time_entry		: that.getForm().getValues(),
				},
				success			: function (response){
					that.fireEvent('saved');
				},
				failure			: Ext.org.micoli.redmine.service.requestFailure
			});
		}
		Ext.org.micoli.redmine.timeLogEditor.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('eu.sm.redmine.timeLogEditor', Ext.org.micoli.redmine.timeLogEditor);
