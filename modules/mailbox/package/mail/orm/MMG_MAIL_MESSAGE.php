<?php
namespace qd\mail\orm;

class baseMMG_MAIL_MESSAGE extends \QDOrm{
	public $table	= 'MMG_MAIL_MESSAGE';

	public $pk		= 'MMG_ID';

	public $fields = array(
		'MMG_ID'			,
		'MMG_SUBJECT'		,
		'MMG_FROM'			,
		'MMG_FOLDER'		,
		'MMG_FOLDER_UUID'	,
		'MMG_UID'			,
		'MMG_MESSAGE_ID'	,
		'MMG_REFERENCES'	,
		'MMG_IN_REPLY_TO'	,
		'MMG_SIZE'			,
		'MMG_NB_ATTACHMENTS',
		'MMG_TO'			,
		'MMG_CC'			,
		'MMG_RAWHEADER'		,
	);

	public function getConnectionName(){
		return 'extmailbox';
	}
}

class MMG_MAIL_MESSAGE extends baseMMG_MAIL_MESSAGE{

}

