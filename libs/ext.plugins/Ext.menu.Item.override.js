Ext.override(Ext.menu.Item, {
	onClick : function(e){
		if(!this.disabled && !this.disabledSelect && this.fireEvent("click", this, e) !== false
				&& this.parentMenu.fireEvent("itemclick", this, e) !== false){
			this.handleClick(e);
		}else{
			e.stopEvent();
		}
	},

	getInnerHtmlFormat : function(){
		return String.format(
			'<img src="{0}" class="x-menu-item-icon {2}" />{1}',
			this.icon || Ext.BLANK_IMAGE_URL, '<span class="'+(this.disabledSelect?'x-item-disabled':'')+'">'+(this.itemText||this.text)+'</span>', this.iconCls || '');
	},

	onRender : function(container, position){
		var el = document.createElement("a");
		el.hideFocus = true;
		el.unselectable = "on";
		el.href = this.href || "#";
		if(this.hrefTarget){
			el.target = this.hrefTarget;
		}
		el.className = this.itemCls + (this.menu ?  " x-menu-item-arrow" : "") + (this.cls ?  " " + this.cls : "");
		el.innerHTML = this.getInnerHtmlFormat();
		this.el = el;
		Ext.menu.Item.superclass.onRender.call(this, container, position);
	},

	setText : function(text){
		this.text = text;
		if(this.rendered){
			this.el.update(this.getInnerHtmlFormat());
			this.parentMenu.autoWidth();
		}
	}
});