<?php
define('QD_SWIFT_AUTOLOADL_PATH',dirname(__FILE__) . '/../../libs/swift-mailer');
class QDServiceLocatorSwift implements QDLocator{
	protected $base = '.';

	public function __construct($directory='.')    {
		$this->map = array();
		$this->recursPath(require QD_SWIFT_AUTOLOADL_PATH. '/lib/classes','');
	}

	public function canLocate($class)    {
		if(array_key_exists($class, $this->map)){
			return file_exists($this->map[$class]);
		}
		return false;
	}
	public function getPath($class)    {
		return $this->map[$class];
	}

	function recursPath($path,$prefix){
		$t = glob($path.'/*');
		foreach ($t as $v){
			if(is_dir($v)){
				$this->recursPath($v,$prefix?$prefix.'_'.basename($v):basename($v));
			}else{
				$this->map[str_replace('.php','',$prefix?$prefix.'_'.basename($v):basename($v))]=$v;
			}
		}
	}
}
QDServiceLocator::attachLocator(new QDServiceLocatorSwift(), 'swift');

if (defined('SWIFT_INIT_LOADED')) {
	return;
}
define('SWIFT_INIT_LOADED', true);

// Load in dependency maps
require QD_SWIFT_AUTOLOADL_PATH. '/lib/dependency_maps/cache_deps.php';
require QD_SWIFT_AUTOLOADL_PATH. '/lib/dependency_maps/mime_deps.php';
require QD_SWIFT_AUTOLOADL_PATH. '/lib/dependency_maps/message_deps.php';
require QD_SWIFT_AUTOLOADL_PATH. '/lib/dependency_maps/transport_deps.php';
// Load in global library preferences
require QD_SWIFT_AUTOLOADL_PATH. '/lib/preferences.php';

?>