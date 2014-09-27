<?php
class QDrcube extends rcube{
	static function get_instance($mode = 0, $env = ''){
		if (!self::$instance) {
			self::$instance = new QDrcube($env);
			self::$instance->init($mode);
		}

		return self::$instance;
	}

	protected function __construct($env = ''){
		// load configuration
		$this->config  = new QDrcube_config($env);
		$this->config->set('db_dsnw'	,'mysql://root:toor@localhost/roundcubemail');
		$this->config->set('log_driver'	,'syslog');
		$this->config->set('imap_cache'	,'db');
		$this->config->set('messages_cache'	,'db');
		$this->config->set('enable_caching'	,true);

		$this->plugins = new rcube_dummy_plugin_api;
		register_shutdown_function(array($this, 'shutdown'));
	}
}