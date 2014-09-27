<?php
	chdir(dirname(__FILE__));

	if(!defined('QD_BASE'))			define ('QD_BASE'			,realpath(dirname(__FILE__).'/../qd_lib_local').'/');
	if(!defined('QDBASE'))			define ('QDBASE'			,realpath(dirname(__FILE__).'/../qd_lib_local').'/');
	if(!defined('QD_PATH_MODULES'))	define ('QD_PATH_MODULES'	,realpath(dirname(__FILE__)).'/');
	if(!defined('CONF_ROOT'))		define ('CONF_ROOT'			,dirname(__FILE__).'/conf/');
	require QD_BASE.'classes/QDGlobal.php';

	header('Content-type: text/html; charset=UTF-8');
?><html>
	<head>
		<?php print QDDesktop::desktop4_head();?>
	</head>
	<body >
		<?php print QDDesktop::desktop4_init();?>
		<?php
		include '../qd_lib_local/classes/QDExtLoader.php';
		QDExtLoader::init();
		QDExtLoader::loadDir('libs/ext.plugins/progressBar/*');
		QDExtLoader::loadDir('libs/ext.plugins/textile/*');
		QDExtLoader::render()
		?>

		<link rel="stylesheet" type="text/css"		href="skins/desktop.css" />

<!-- 	<script type="text/javascript"				src="http://192.168.1.14:3000/socket.io/socket.io.js"></script> -->
<!-- 	<script type="text/javascript"				src="http://192.168.1.14:3000/term.js"></script> -->
	</body>
</html>
