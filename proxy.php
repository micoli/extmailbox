<?php
ini_set('pdo_mysql.default_socket','/tmp/mysql.sock');
	chdir(dirname(__FILE__));
	define ('QDBASE'			,realpath(dirname(__FILE__).'/../qd_lib_local').'/');
	define ('QD_PATH_MODULES'	,realpath(dirname(__FILE__)).'/');
	define ('CONF_ROOT'			,dirname(__FILE__).'/conf/');

	header('Content-type: text/html; charset=UTF-8');
	require QDBASE.'classes/QDGlobal.php';
	QDSvc::run();
?>