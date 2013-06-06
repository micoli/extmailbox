Ext.ns('Ext.eu.sm.MailBox');
Ext.eu.sm.MailBox.i18n = {
	lng : 'fr',
	_ : function (text){
		var lng = Ext.eu.sm.MailBox.i18n.lng;
		return (Ext.eu.sm.MailBox.i18n.translation[lng][text]==undefined)?text:Ext.eu.sm.MailBox.i18n.translation[lng][text];
	},
	translation :{
	}
}

Ext.eu.sm.MailBox.i18n.translation.fr = {
	'Displaying mails {0} - {1} of {2}'	: 'messages {0} - {1} sur {2}',
	'No mails to display'				: 'Aucun mails à afficher',
	'Create mail to : '					: 'Create mail to : ',
	'Send'								: 'Send',
	'Save as Draft' 					: 'Save as Draft',
	'Attach'							: 'Attach',
	'From'								: 'From',
	'Select an account...'				: 'Select an account...',
	'Subject'							: 'Subject',
	'To'								: 'To',
	'Cc'								: 'Cc',
	'Bcc'								: 'Bcc',
	'Subject'							: 'Subject',
	'From'								: 'From',
	'Seen'								: 'Seen',
	'Date'								: 'Date',
	'Size'								: 'Size',
	'Reply'								: 'Reply',
	'Reply to all'						: 'Reply to all',
	'Forward'							: 'Forward',
	'Move'								: 'Move',
	'View header'						: 'View header',
	'Raw headers'						: 'Raw headers',
	'Still loading email body'			: 'Still loading email body',
	'd/m/Y H:i:s'						: 'd/m/Y H:i:s',
	'failure on retreiving mail'		: 'failure on retreiving mail',
	'View'								: 'View',
}