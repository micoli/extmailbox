Ext.ns('Ext.eu.sm');


Ext.eu.sm.clsAutoRequired = function() {
	var all = new Ext.util.MixedCollection();
	var that = this;
	that.classExists = function(varName) {
		//http://stackoverflow.com/questions/8313726/how-to-check-for-a-javascript-object-given-its-name-as-a-string
		return new Function('return typeof(' + varName + ') === "undefined" ? false : true;')();
	};

	return {
		all : all,
		addLocator : function(){

		},
		load : function(cmp) {
			if(cmp.clsAutoRequired){
				Ext.each((typeof cmp.clsAutoRequired == 'String')?[cmp.clsAutoRequired]:cmp.clsAutoRequired,function(Class){
					if(that.classExists(Class)){
						console.log('interceptor not required, already loaded '+Class);
					}else{
						//that.loadJavascript('modules/calendarview/'+Class+'.js');
						console.log('need '+Class)
					}
				})
			}
			//return true;
		}
	};
}();

Ext.ComponentMgr.register = Ext.ComponentMgr.register.createSequence(Ext.eu.sm.clsAutoRequired.load);