Ext.ns('Ext.eu.sm.form');
/*
	{
		xtype		: 'datepickerbutton',
		iconCls		: 'calendarSelectIcon',
		listeners 	: {
			select		: function(datePicker, date){
				console.log(date.format('Y-m-d');
			}
		}
}
 */
Ext.eu.sm.form.datePickerButton = Ext.extend(Ext.Button, {
	displayFormat		: 'd/m/Y',
	date				: (new Date()),
	initComponent		: function(){
		var that = this;
		that.addEvents(
			'select'
		)
		Ext.apply(this,{
			text		: that.date.format(that.displayFormat),
			menu		: new Ext.menu.DateMenu({
				startDay	: 1,
				listeners	: {
					show		: function(datePickerMenu){
						datePickerMenu.picker.setValue(that.date);
					}
				},
				handler 	: function(dp, date){
					that.setText(date);
					that.fireEvent('select',that,date);
				}
			})
		});
		Ext.eu.sm.form.datePickerButton.superclass.initComponent.call(this);
	}
});

Ext.reg('datepickerbutton',Ext.eu.sm.form.datePickerButton);
