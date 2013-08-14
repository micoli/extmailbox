<?php
	ini_set('pdo_mysql.default_socket','/tmp/mysql.sock');
	chdir(dirname(__FILE__));
	if(!defined('QD_BASE'))			define ('QDBASE'			,realpath(dirname(__FILE__).'/../qdmmmdb/lib/').'/');
	if(!defined('QD_PATH_MODULES'))	define ('QD_PATH_MODULES'	,realpath(dirname(__FILE__)).'/');
	if(!defined('CONF_ROOT'))		define ('CONF_ROOT'			,dirname(__FILE__).'/conf/');
	define('SMF_COMPATIBLE',true);

	header('Content-type: text/html; charset=UTF-8');
	require QDBASE.'classes/QDGlobal.php';
	QDSvc::run();
?>