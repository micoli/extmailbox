<?php
class WTF_WEB_TAG_FRONT extends baseWTF_WEB_TAG_FRONT{
}
class baseWTF_WEB_TAG_FRONT extends QDOrm{
	public $table	= 'test.WTF_WEB_TAG_FRONT';

	public $pk		= array ('WTF_SITE','WTF_TAG');

	public $fields = array(
			'WTF_SITE'			,
			'WTF_TAG'			,
			'WTF_CONFIG'		,
			'WTF_DISABLED'		,
			'WTF_LAST_UPDATE'	,
			'WTF_PARENT_SITE'
	);

	public function getConnectionName(){
		return 'test';
	}
}