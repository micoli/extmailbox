Ext.data.ArrayStore = function(c){
	/**
	 * @cfg {Ext.data.DataReader} reader @hide
	 */
	/**
	 * @cfg {Ext.data.DataProxy} proxy @hide
	 */
	Ext.data.JsonStore.superclass.constructor.call(this, Ext.apply(c, {
		proxy: new Ext.data.MemoryProxy([]),
		reader: new Ext.data.JsonReader(c, c.fields)
	}));
};
Ext.extend(Ext.data.ArrayStore,Ext.data.JsonStore);
