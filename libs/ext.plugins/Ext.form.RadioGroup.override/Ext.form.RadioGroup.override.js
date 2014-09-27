//http://webspotlite.blogspot.fr/2010/06/ext-22-radiogroup-getvaluesetvalue.html
Ext.override(Ext.form.RadioGroup, {
	rgGetName : function() {
		return (this.items.first && this.items.first().name) || (this.items[0] && this.items[0].name);
	},
	rgGetValue : function() {
		var v;
		if (this.rendered) {
			this.items.each(function(item) {
				if (!item.getValue())
					return true;
				v = item.getRawValue();
				return false;
			});
		} else {
			for ( var k in this.items) {
				if (this.items[k].checked) {
					v = this.items[k].inputValue;
					break;
				}
			}
		}
		return v;
	},
	rgSetValue : function(v) {
		if (this.rendered) {
			this.items.each(function(item) {
				item.setValue(item.getRawValue() == v);
			});
		} else {
			for ( var k in this.items) {
				this.items[k].checked = this.items[k].inputValue == v;
			}
		}
	}
});
