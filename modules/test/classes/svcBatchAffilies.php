<?php
class svcBatchAffilies{
	function pub_showConfLMC($o){
		include "var_export.php";
		$tmp=array();
		foreach($aConfLMC as $conf){
			unset($conf['main_libelle_category']);
			unset($conf['libelle_category']);
			$tmp[]=$conf;
		}
		return array('retour'=>$tmp);
	}
	function pub_getPPActivities($o){
		include "var_export.php";
		return array('results'=>$aListAct);
	}
}