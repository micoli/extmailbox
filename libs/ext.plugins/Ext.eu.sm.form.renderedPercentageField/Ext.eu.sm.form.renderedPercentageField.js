Ext.ns('Ext.eu.sm.form');

Ext.eu.sm.form.renderedPercentageField = Ext.extend(Ext.eu.sm.form.renderedField,{
	renderer	: function (percent) {
		var width = Math.min(120,this.el.getWidth());
		var bar = 4-parseInt(percent/25);
		var style='';
		style = style + ';width: '+width+'px';
		style = style + ';background-position: '+(percent==0?-120:(width*percent/100)-120)+'px 50%';
		style = style + '; background-repeat:no-repeat;';
		return '<div class="progressBar-back-'+bar+'" style="'+style+'">'+percent+' %</div>';
	},
	listeners	: {
		afterrender : function(ct){
			var field = this;
			this.el.on('click',function(){
				var cmp = this;
				var sm = new Ext.grid.RowSelectionModel({
					singleSelect	: true
				});
				cmp.attachedCmp = new Ext.eu.attachedWindow({
					resizeTriggerCmp: this,
					stickCmp		: this,
					resizable		: false,
					frame			: true,
					hideBorders		: true,
					border			: false,
					height			: 150,
					layout			: 'fit',
					width			: Math.min(120,ct.getWidth()),
					items			: [{
						xtype			: 'grid',
						hideHeaders		: true,
						store			: new Ext.data.SimpleStore({
							fields			: ['prct'],
							data			: [[0],[10],[20],[30],[40],[50],[60],[70],[80],[90],[100]]
						}),
						autoExpandColumn	: 'prct',
						sm					: sm,
						cm					: new Ext.grid.ColumnModel([{
							header				: '-',
							dataIndex			: 'prct',
							align				: 'right',
							id					: 'prct',
							width				: '100%',
							fixed				: false,
							stripeRows			: true,
							renderer			: function(v){
								return v+' %';
							}
						}]),
						listeners	: {
							render		: function(grid){
								setTimeout(function(){
									var valIndex = grid.getStore().find('prct',field.getValue());
									grid.getView().focusRow({rowIndex:valIndex});
									grid.getView().focusEl.focus();
									grid.getSelectionModel().selectRow(valIndex);
								},100);
							},
							rowdblclick		: function(grid,rowIndex,e){
								field.setValue(grid.getStore().getAt(rowIndex).data.prct);
								cmp.attachedCmp.hide();
							},
							keypress		: function(grid,rowIndex,e){
								//field.setValue(grid.getStore().getAt(rowIndex).data.prct);
								//cmp.attachedCmp.hide();
							}
						}
					}]
				});
				cmp.attachedCmp.show();
			});
		}
	}
});

Ext.reg('eu.sm.form.renderedPercentageField',Ext.eu.sm.form.renderedPercentageField);