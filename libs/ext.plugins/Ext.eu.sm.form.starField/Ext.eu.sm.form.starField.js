Ext.ns('Ext.eu.sm.form');

Ext.eu.sm.form.starField = Ext.extend(Ext.eu.sm.form.renderedField,{
	starType	: 2 			, //[1,2,3]
	mode		: 'proportional', //[proportional,byhalf]
	renderer	: function (v){
		v = parseFloat(v);
		v = Math.min(v,5);
		v = Math.max(v,0);
		if(this.mode=='byhalf'){
			v = parseInt(v*2)/2;
		}
		return '<div class="Ext_eu_sm_form_starField_'+this.starType+'_off">'+
					'<div class="Ext_eu_sm_form_starField_'+this.starType+'_on" style="width:'+(v/5*100)+'%;">'+
						'<img src="'+Ext.BLANK_IMAGE_URL+'">'+
					'</div>'+
				'</div>';
	}
});
Ext.reg('eu.sm.form.starField',Ext.eu.sm.form.starField);
