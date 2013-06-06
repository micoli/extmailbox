Ext.ns('Ext.ux');
Ext.ux.sandboxViewport = Ext.extend(Ext.Viewport, {
	initComponent : function(){
		var that = this;
		that.eventsStore = new Ext.data.Store({
			reader: new Ext.data.JsonReader({}, [
				'date',
				'title',
				'text'
			]),
			proxy : new Ext.data.MemoryProxy([])
		});

		window.sandBoxAddToList = function(text,title){
			that.eventsStore.add([new that.eventsStore.recordType({
				date	: new Date(),
				title	: title,
				text	: text
			})]);
			that.eventsStore.commitChanges();
		}

		Ext.apply(that,{
			layout		: 'border',
			autoScroll	: true,
			items		: [{
				xtype				: 'grid',
				region				: 'center',
				ds					: that.eventsStore,
				autoExpandColumn	: 'text',
				cm					: new Ext.grid.ColumnModel([
					{header: 'date' , width: 110, dataIndex: 'date',renderer: Ext.util.Format.dateRenderer('m-d H:i:s')},
					{header: 'title', width:  50, dataIndex: 'title'},
					{header: 'text' , width: 150, dataIndex: 'text',id:'text'}
				]),
				listeners: {
					rowclick:function(grid, rowIndex, e) {
						var p = Ext.getCmp('showMsg');
						p.tpl.overwrite(p.body,grid.getStore().data.items[rowIndex].data);
					}
				}
			},{
				xtype	: 'panel',
				id		: 'showMsg',
				region	: 'east',
				width	: 200,
				tpl		: new Ext.XTemplate(
					'<tpl for=".">',
					'<div class="search-item">',
						'<h3><span>{title}</span></h3>',
						'<pre>{text}</pre>',
					'</div></tpl>'
				)
			},{
				xtype	: 'panel',
				region	: 'south',
				height	: 200,
				items	: that.customItems
			}]
		});
		Ext.ux.sandboxViewport.superclass.initComponent.call(that);
	}
});
