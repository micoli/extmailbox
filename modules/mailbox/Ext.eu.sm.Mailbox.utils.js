Ext.ns('Ext.eu.sm.MailBox');
Ext.eu.sm.MailBox.utils={

	formatRecipient	: function (recipients,before,after,separator){
		if(!recipients){
			return '';
		}
		before		= before	|| '';
		after		= after		|| '';
		separator	= separator	|| ',';
		var str = '';
		var sepa = '';
		Ext.each(recipients,function(v,k){
			if(v.personal){
				str = str + sepa + before+v.personal+ ' ('+v.email+')'+after;
			}else{
				str = str + sepa + before+v.email+after;
			}
			sepa = separator;
		});
		return str;
	},

	humanFileSize		: function (size) {
		var i = Math.floor( Math.log(size) / Math.log(1024) );
		return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' '+ ['B', 'kB', 'MB', 'GB', 'TB'][i];
	}
}