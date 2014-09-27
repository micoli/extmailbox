<?php
class qdrcube_config extends rcube_config{
	public function __construct($env = ''){
		$this->env = $env;

		if ($paths = getenv('RCUBE_CONFIG_PATH')) {
			$this->paths = explode(PATH_SEPARATOR, $paths);
			// make all paths absolute
			foreach ($this->paths as $i => $path) {
				if (!rcube_utils::is_absolute_path($path)) {
					if ($realpath = realpath(RCUBE_INSTALL_PATH . $path)) {
						$this->paths[$i] = unslashify($realpath) . '/';
					}else {
						unset($this->paths[$i]);
					}
				}else {
					$this->paths[$i] = unslashify($path) . '/';
				}
			}
		}

		if (defined('RCUBE_CONFIG_DIR') && !in_array(RCUBE_CONFIG_DIR, $this->paths)) {
			$this->paths[] = RCUBE_CONFIG_DIR;
		}

		if (empty($this->paths)) {
			$this->paths[] = RCUBE_INSTALL_PATH . 'config/';
		}
		$this->loadExtended();
		$this->loadOverride();

		// Defaults, that we do not require you to configure,
		// but contain information that is used in various
		// locations in the code:
		$this->set('contactlist_fields', array('name', 'firstname', 'surname', 'email'));
	}

	private function loadExtended(){
		//$this->set('db_dsnw','mysql://root:toor@localhost/imail');
		//$this->set('log_driver','syslog');
	}

	/**
	 * Load config from local config file
	 *
	 * @todo Remove global $CONFIG
	 */
	private function loadOverride(){
		// Load default settings
		if (!$this->load_from_file('defaults.inc.php')) {
			$this->errors[] = 'defaults.inc.php was not found.';
		}

		// load main config file
		if (!$this->load_from_file('config.inc.php')) {
			// Old configuration files
			if (!$this->load_from_file('main.inc.php') ||
					!$this->load_from_file('db.inc.php')) {
				$this->errors[] = 'config.inc.php was not found.';
			}
			else if (rand(1,100) == 10) {  // log warning on every 100th request (average)
				trigger_error("config.inc.php was not found. Please migrate your config by running bin/update.sh", E_USER_WARNING);
			}
		}

		// load host-specific configuration
		$this->load_host_configOverride();

		// set skin (with fallback to old 'skin_path' property)
		if (empty($this->prop['skin'])) {
			if (!empty($this->prop['skin_path'])) {
				$this->prop['skin'] = str_replace('skins/', '', unslashify($this->prop['skin_path']));
			}
			else {
				$this->prop['skin'] = self::DEFAULT_SKIN;
			}
		}

		// larry is the new default skin :-)
		if ($this->prop['skin'] == 'default')
			$this->prop['skin'] = self::DEFAULT_SKIN;

		// fix paths
		$this->prop['log_dir'] = $this->prop['log_dir'] ? realpath(unslashify($this->prop['log_dir'])) : RCUBE_INSTALL_PATH . 'logs';
		$this->prop['temp_dir'] = $this->prop['temp_dir'] ? realpath(unslashify($this->prop['temp_dir'])) : RCUBE_INSTALL_PATH . 'temp';

		// fix default imap folders encoding
		foreach (array('drafts_mbox', 'junk_mbox', 'sent_mbox', 'trash_mbox') as $folder)
			$this->prop[$folder] = rcube_charset::convert($this->prop[$folder], RCUBE_CHARSET, 'UTF7-IMAP');

		if (!empty($this->prop['default_folders']))
			foreach ($this->prop['default_folders'] as $n => $folder)
			$this->prop['default_folders'][$n] = rcube_charset::convert($folder, RCUBE_CHARSET, 'UTF7-IMAP');

		// set PHP error logging according to config
		if ($this->prop['debug_level'] & 1) {
			ini_set('log_errors', 1);

			if ($this->prop['log_driver'] == 'syslog') {
				ini_set('error_log', 'syslog');
			}
			else {
				ini_set('error_log', $this->prop['log_dir'].'/errors');
			}
		}

		// enable display_errors in 'show' level, but not for ajax requests
		ini_set('display_errors', intval(empty($_REQUEST['_remote']) && ($this->prop['debug_level'] & 4)));

		// remove deprecated properties
		unset($this->prop['dst_active']);

		// export config data
		$GLOBALS['CONFIG'] = &$this->prop;
	}

	function load_host_configOverride(){
		if (empty($this->prop['include_host_config'])) {
			return;
		}

		foreach (array('HTTP_HOST', 'SERVER_NAME', 'SERVER_ADDR') as $key) {
			$fname = null;
			$name  = $_SERVER[$key];

			if (!$name) {
				continue;
			}

			if (is_array($this->prop['include_host_config'])) {
				$fname = $this->prop['include_host_config'][$name];
			}
			else {
				$fname = preg_replace('/[^a-z0-9\.\-_]/i', '', $name) . '.inc.php';
			}

			if ($fname && $this->load_from_file($fname)) {
				return;
			}
		}
	}
/*	public function load_from_file($file){
		$success = false;
		foreach ($this->resolve_paths($file) as $fpath) {
			if ($fpath && is_file($fpath) && is_readable($fpath)) {
				// use output buffering, we don't need any output here
				ob_start();
				include($fpath);
				ob_end_clean();

				if (is_array($config)) {
					$this->merge($config);
					$success = true;
				}
				// deprecated name of config variable
				if (is_array($rcmail_config)) {
					$this->merge($rcmail_config);
					$success = true;
				}
			}
		}
		return $success;
	}
	public function resolve_paths($file, $use_env = true)
	{
		$files    = array();
		$abs_path = rcube_utils::is_absolute_path($file);
		foreach ($this->paths as $basepath) {
			$realpath = $abs_path ? $file : realpath($basepath . '/' . $file);

			// check if <file>-env.ini exists
			if ($realpath && $use_env && !empty($this->env)) {
				$envfile = preg_replace('/\.(inc.php)$/', '-' . $this->env . '.\\1', $realpath);
				if (is_file($envfile))
					$realpath = $envfile;
			}

			if ($realpath) {
				$files[] = $realpath;

				// no need to continue the loop if an absolute file path is given
				if ($abs_path) {
					break;
				}
			}
		}

		return $files;
	}*/
}