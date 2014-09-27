<?php
/*
CREATE TABLE IPB_IMPORTED_PROSPECT_BATCH (
		IPB_ID					INT NOT NULL AUTO_INCREMENT,
		IPB_BATCH_ID			VARCHAR(255) NULL,
		IPB_CAMPAIGN_ID			INT(11),
		IPB_ACT_MAPPING			TEXT NULL,
		PRIMARY KEY (`IPB_ID`)
);
 */
class baseIPB_IMPORTED_PROSPECT_BATCH extends QDOrm{
	public $table	='test.IPB_IMPORTED_PROSPECT_BATCH';

	public $pk		='IPB_ID';

	public $fields = array(
		'IPB_ID'				,
		'IPB_BATCH_ID'			,
		'IPB_CAMPAIGN_ID'		,
		'IPB_ACT_MAPPING'		,
		'IPB_DEDUP_OPTIONS'		,
	);

	public function getConnectionName(){
		return 'main';
	}
}

class IPB_IMPORTED_PROSPECT_BATCH extends baseIPB_IMPORTED_PROSPECT_BATCH{

}
