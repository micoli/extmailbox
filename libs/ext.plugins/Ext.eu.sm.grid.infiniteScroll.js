/**
 * @author Olivier MICHAUD
 * @class Ext.eu.sm.grid.infiniteScroll
 * @extends Ext.util.Observable
 * <p>A plugin for an infiniteScroll on ExtJS2 grid.</p>
 */
Ext.ns('Ext.eu.sm.grid');
Ext.eu.sm.grid.infiniteScroll = Ext.extend(Ext.util.Observable, {
	init: function(grid){
		var that = this;
		that.grid = grid;
		that.infiniteScrl=null;
		that.infiniteBody=null;
		that.minBottom = 20;
		that.pagingBar = (that.grid.bottomToolbar && that.grid.bottomToolbar.pageSize)?that.grid.bottomToolbar:that.grid.topToolbar;
		that.grid.on('bodyscroll', that.onBodyscroll, that);
	},

	firstInit : function(){
		var that = this;
		if(!that.infiniteScrl){
			that.infiniteScrl = Ext.get(Ext.query('.x-grid3-scroller'	,that.grid.body.dom)[0]);
			that.infiniteBody = Ext.get(Ext.query('.x-grid3-body'		,that.grid.body.dom)[0]);
		}
	},

	onBodyscroll : function (scrollLeft, scrollTop){
		var that = this;
		that.firstInit();
		if(
			((that.infiniteBody.getHeight() - that.infiniteScrl.getHeight() - scrollTop)<that.minBottom)
			&&
			( that.infiniteBody.getHeight() > that.infiniteScrl.getHeight())
		){
			that.grid.getStore().load({
				h			: that.infiniteBody.getHeight() - that.infiniteScrl.getHeight() - that.minBottom,
				add			: true,
				params		: {
					start		: that.pagingBar.pageSize + that.pagingBar.cursor,
					limit		: that.pagingBar.pageSize
				},
				callback	: function(records,options,success){
					that.infiniteScrl.scrollTo('top',options.h,false);
				}
			});
		}
	}
});