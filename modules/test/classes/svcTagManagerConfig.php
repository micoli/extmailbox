<?php
class svcTagManagerConfig{

	function __construct(){
		header('Content-Type: text/html');
		QDOrm::addConnection('test', new QDPDO($GLOBALS['conf']['qddb']['connection'], $GLOBALS['conf']['qddb']['username'], $GLOBALS['conf']['qddb']['password']));
	}

	function pub_getTagConfigurators($o){
		$oWTF = new WTF_WEB_TAG_FRONT();
		$aWTFs = $oWTF->get(array(
			'cols'		=> array('distinct wtf_site'),
			'orderBy'	=> array('wtf_site')
		));
		$aSites = array();
		foreach($aWTFs as $aWTF){
			$aSites[] = $aWTF['wtf_site'];
		}
		return array(
			'tagConfigurators'	=> CW_TagManager::getAllTagConfig(),
			'sites'				=> $aSites
		);
	}

	function pub_getTagConfigs($o){
		$data=array(
			'where'=>array()
		);
		if($site= akead('wtf_site',$o,false)){
			$data['where']['wtf_site'	]=array('like','%'.$site.'%');
		}
		if($tag	= akead('wtf_tag',$o,false)){
			$data['where']['wtf_tag'	]=array('like','%'.$tag.'%'	);
		}
		$oWTF = new WTF_WEB_TAG_FRONT();
		$aWTFs = $oWTF->get($data);
		foreach($aWTFs as $k=>$aWTF){

		}
		return array('data'=>$aWTFs);
	}

	function pub_setTagConfig($o){
		$oWTF = new WTF_WEB_TAG_FRONT();
		$record=json_decode($o['record'],true);
		if (is_null($record['WTF_PARENT_SITE'])){
			$record['WTF_PARENT_SITE']='';
		}
		//$record['wtf_config']=json_decode($record['wtf_config'],true);
		//db($record);
		$oWTF->set($record);
		/*
		$aWTFs = $oWTF->get($data);
		foreach($aWTFs as $k=>$aWTF){
		}
		*/
		return array('success'=>true);
	}
}