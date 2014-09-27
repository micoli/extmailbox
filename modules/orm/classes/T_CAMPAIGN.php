<?php
/*
CREATE TABLE `T_CAMPAIGN` (
`CAM_ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
`CAM_NAME` varchar(64) NOT NULL,
`CAM_MESSAGE` varchar(255) DEFAULT NULL,
`CAM_START` date NOT NULL,
`CAM_END` date DEFAULT NULL,
`CAM_ACTIVE` tinyint(1) unsigned DEFAULT '0',
`CAM_AUTOAFFECT` tinyint(1) NOT NULL DEFAULT '0',
`CAM_INJECTION` varchar(250) DEFAULT NULL,
`CAM_TYPE` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '0: sortant, 1: entrant',
`CAM_COMM_POINTS` decimal(10,2) unsigned NOT NULL DEFAULT '20.00' COMMENT 'Budget Points',
`CAM_PERCENT_REP` decimal(10,6) NOT NULL DEFAULT '0.090000' COMMENT 'Percentage Share Rep',
`CAM_PERCENT_SUP` decimal(10,6) NOT NULL DEFAULT '0.011250' COMMENT 'Percentage Share Supervisor',
PRIMARY KEY (`CAM_ID`),
UNIQUE KEY `CAM_NAME` (`CAM_NAME`),
KEY `T_CAMPAIGN_ACTIVE` (`CAM_ACTIVE`),
KEY `T_CAMPAIGN_START` (`CAM_START`),
KEY `CAM_TYPE` (`CAM_TYPE`)
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC
 */
class baseT_CAMPAIGN extends QDOrm{
	public $table	='test.T_CAMPAIGN';

	public $pk		='CAM_ID';

	public $fields = array(
		'CAM_ID' ,
		'CAM_NAME',
		'CAM_MESSAGE',
		'CAM_START',
		'CAM_END',
		'CAM_ACTIVE',
		'CAM_AUTOAFFECT',
		'CAM_INJECTION',
		'CAM_TYPE',
		'CAM_COMM_POINTS',
		'CAM_PERCENT_REP',
		'CAM_PERCENT_SUP',
	);

	public function getConnectionName(){
		return 'main';
	}
}

class T_CAMPAIGN extends baseT_CAMPAIGN{

}
