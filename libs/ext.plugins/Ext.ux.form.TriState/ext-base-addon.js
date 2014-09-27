Ext.lib.Event.fireEvent = function(el, eventName, e) {
	var listeners = this.getListeners(el, eventName);
	if (listeners) {
		for (var i = 0, len = listeners.length; i < len; i++) {
			var listener = listeners[i];
			var scope = window;
			if (listener.adjust) {
				scope = listener.adjust === true ? listener.obj : listener.adjust;
			}
			listener.fn.call(scope, e, listener.obj);
		}
	}
}

Ext.EventManager.fireEvent = function(el, eventName, e) {
	Ext.lib.Event.fireEvent(Ext.getDom(el), eventName, e);	
}

Ext.Element.prototype.fireEvent = function(eventName, e) {
	Ext.EventManager.fireEvent(this.dom, eventName, e);
}
