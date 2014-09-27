<?php

require_once QDBASE.'../roundcubemail/program/lib/Roundcube/bootstrap.php';

class QDServiceLocatorRoundcube implements QDLocator{
	protected $base = '.';

	public function __construct($directory='.')    {
		$this->map = array();
	}

	public function canLocate($class)    {
		/*if(array_key_exists($class, $this->map)){
			return file_exists($this->map[$class]);
		}*/
		return false;
	}

	public function getPath($class)    {
		return rcube_autoload($class);
	}
}
QDServiceLocator::attachLocator(new QDServiceLocatorRoundcube(), 'roundcube');

if (defined('QDServiceLocatorRoundcubeLoaded')) {
	return;
}
define('QDServiceLocatorRoundcubeLoaded', true);

?>