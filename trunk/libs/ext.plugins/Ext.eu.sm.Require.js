Ext.ns('Ext.eu.sm');
/*
Ext.eu.sm.Require = function() {
	//Ext.ComponentMgr.register = Ext.ComponentMgr.register.createInterceptor(Ext.eu.sm.Require.load);
	var all = new Ext.util.MixedCollection();
	var that = this;

	// A lil' function that requires stuff.
	// http://evanhahn.com/javascript-method_missing/
	that.loadScript = function(src,object) {
		// Define a queue of methods which we'll run when we get things loaded.
		var methodQueue = [];
		try{
			// Load the script.
			var script = document.createElement("script");
			script.src = src;
			//script.async=false;
			// When the script loads, run everything in the method queue.
			script.onload = script.onerror = function() {
				debugger;
				var exported = that.objectFromPointedNotation(object);
				methodQueue.forEach(function(method) {
					exported[method.id].apply(exported, method.args);
				});
			};

			document.head.appendChild(script);
		}catch(E){
			console.log(E);
		}

		// Return a dummy object which will throw methods into the queue.
		return {
			__noSuchMethod__: function(id, args) {
				methodQueue.push({
					id: id,
					args: args
				});
			}
		};

	}

	that.objectFromPointedNotation = function(varName){
		var parent = window;
		varName.split('.').forEach(function (name) {
			if (parent[name] === undefined) {
				throw 'undefined';
			}

			parent = parent[name];
		});
		return parent;
	}

	that.classExists = function(varName) {
		//http://stackoverflow.com/questions/8313726/how-to-check-for-a-javascript-object-given-its-name-as-a-string
		return new Function('return typeof(' + varName + ') === "undefined" ? false : true;')();
	}

	return {
		all : all,
		addLocator : function(){

		},
		load : function(cmp) {
			if(cmp.clsRequire){
				Ext.each((typeof cmp.clsRequire == 'String')?[cmp.clsRequire]:cmp.clsRequire,function(Class){
					if(!that.classExists(Class)){
						Ext.ns(Class);
						var exported = that.objectFromPointedNotation(Class);
						console.log('need '+Class+' ')
						exported = that.loadScript('modules/calendarview/'+Class+'.js',Class);
					}
				})
			}
			//return true;
		}
	};
}();

Ext.ComponentMgr.register = Ext.ComponentMgr.register.createInterceptor(function(){
	console.log(arguments[0].initialConfig.xtype||this.defaultType);
});
*/