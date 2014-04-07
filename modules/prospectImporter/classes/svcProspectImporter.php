<?php
class svcProspectImporter{
	static $importedColumns=array(
		'company_name'		,
		'company_number'	,
		'address1'			,
		'address2'			,
		'town_name'			,
		'raw_activities'	,
		'postcode'			,
		'phone'				,
		'email'				,
		'contact_title'		,
		'contact_firstname'	,
		'contact_lastname'	,
		'contact_function'	,
		'description'
	);
	static $dbImportedColumns=null;

	var $uploadPath='/tmp/';

	/**
	 *
	 */
	function __construct(){
		if(function_exists('xdebug_disable')) {
			xdebug_disable();
		}
		QDOrm::addConnection('main', new QDPDO("mysql:dbname=imail;host=127.0.0.1", 'root', 'toor'));
		if(!file_exists($this->uploadPath)){
			mkdir($this->uploadPath);
		}
		if(is_null(self::$dbImportedColumns)){
			foreach(self::$importedColumns as $v){
				self::$dbImportedColumns[]='ipr_'.$v;
			}
		}
	}

	/**
	 *
	 * @param unknown $o
	 */
	function pub_testOrm($o){
		header('Content-Type: text/html, charset=utf-8');

		$oIPR = new IPR_IMPORTED_PROSPECT();
		$r = $oIPR->set(array(
			'IPR_COMPANY_NAME'		=> "eezeze",
			'IPR_COMPANY_NUMBER'	=> "eezeze"
		));
		db($r);
		$r = $oIPR->set(array(
			'IPR_ID'				=> 3,
			'IPR_COMPANY_NAME'		=> "aaa",
			'IPR_COMPANY_NUMBER'	=> "bbb"
		));
		db($r);
		$r = $oIPR->get(array(
			'cols'	=> array('*'),
			'where'	=> array(
				'IPR_COMPANY_NAME'		=> array('IN',array("aaa")),
				'OPE1'					=> array("SQL","IPR_COMPANY_NAME like '%a%'"),
			),
			'start' => 0,
			'limit' => 2,
		));
		db($r);
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number multitype:multitype:number string
	 */
	function pub_getProspects($o){
		$oIPR = new IPR_IMPORTED_PROSPECT();
		$aIPR = $oIPR->get(array(
			'where'		=>array(
				'ipr_ipb_id'	=> $o['ipb_id']
			),
			'start'		=> $o['start'],
			'limit'		=> $o['limit'],
		));
		$aIPRCnt = $oIPR->get(array(
			'cols'		=> array('count(*) as cnt'),
			'where'		=> array(
				'ipr_ipb_id'	=> $o['ipb_id']
			),
		));
		return array(
			'data'	=> $aIPR,
			'total'	=> $aIPRCnt[0]['cnt']
		);
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number unknown
	 */
	function pub_getBatch($o){
		$oIPB = new IPB_IMPORTED_PROSPECT_BATCH();
		$aIPB = $oIPB->get(array());
		return array(
			'data'	=> $aIPB,
			'total'	=> count($aIPB)
		);
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number unknown
	 */
	function pub_getBatchMapping($o){
		$oIPB = new IPB_IMPORTED_PROSPECT_BATCH();
		$aIPB = $oIPB->get(array(
			'where'		=> array(
				'ipb_id'	=> $o['ipb_id']
			)
		));
		if(is_array($aIPB) && count($aIPB)==1){
			$aIPB = array_pop($aIPB);

		}else{
			$aIPB = array();
		}
		return array(
			'data'	=> $aIPB,
			'total'	=> count($aIPB)
		);
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number unknown |multitype:number
	 */
	function pub_setBatch($o){
		$oIPB = new IPB_IMPORTED_PROSPECT_BATCH();
		$aIPB = array();
		foreach($o as $k=>$v){
			if(preg_match('/^ipb_/',$k)){
				$aIPB[$k]=$v;
				//if($k=='ipb_act_mapping'){
				//	$acts= json_decode($o['ipb_act_mapping']);
				//}
			}
		}
		if($aIPB['ipb_id']==-1){
			$aIPB['ipb_id']=null;
		}
		$aIPB = $oIPB->set($aIPB);
		if($aIPB){
			return $this->pub_getBatch(array());
		}else{
			return array('error'=>1);
		}
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number
	 */
	function pub_getCampaign($o){
		$oCam = new T_CAMPAIGN();
		$aCam = $oCam->get(array());
		if(is_array($aCam)){
			foreach($aCam as $k=>$v){
				$aCam[$k]['cam_percent_rep']=$v['cam_percent_rep']*100;
				$aCam[$k]['cam_percent_sup']=$v['cam_percent_sup']*100;
			}
		}
		return array(
			'data'	=> $aCam,
			'total'	=> count($aCam)
		);
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number
	 */
	function pub_getGrpActivities($o){
		$oGRP = new GRP_ACTIVITY();
		$aGRP = $oGRP->get(array(
			'where'		=> array(
				'grp_key'	=> 'KEY_TRADE'
			)
		));
		return array(
			'data'	=> $aGRP,
			'total'	=> count($aGRP)
		);
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number
	 */
	function pub_setCampaign($o){
		$oCam = new T_CAMPAIGN();
		$aCam = array();
		foreach($o as $k=>$v){
			if(preg_match('/^cam_/',$k)){
				$aCam[$k]=$v;
				if(in_array($k,array('cam_percent_rep','cam_percent_sup'))){
					$aCam[$k]=$aCam[$k]/100;
				}
			}
		}
		if($aCam['cam_id']==-1){
			$aCam['cam_id']=null;
		}

		$aCam = $oCam->set($aCam);
		if($aCam){
			return $this->pub_getCampaign(array());
		}else{
			return array('error'=>1);
		}
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number Ambigous <Ambigous, multitype:multitype:unknown  >
	 */
	function pub_getIPBRawMapping($o){
		$aTmp = CW_ProspectImporter::getIPBRawMapping($o);
		return array(
			'data'	=> $aTmp,
			'total'	=> count($aTmp)
		);
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number Ambigous <Ambigous, multitype:multitype:unknown  >
	 */
	function pub_setIPBRawMapping($o){
		$acts= json_decode($o['ipb_act_mapping']);
		if(is_array($acts) && count($acts)>0){
			$oIPB = new IPB_IMPORTED_PROSPECT_BATCH();
			$oIPB->set(array(
				'ipb_id'			=> $o['ipb_id'],
				'ipb_act_mapping'	=> $o['ipb_act_mapping']
			));
		}
		return array(
			'success'	=>true
		);
	}

	/**
	 *
	 * curl -F "exw_action=local.prospectImporter.importFile" -F "ipb_id=1" -F fileupload=@uploaderFR.csv http://127.0.0.1/extmailbox_local/proxy.php
	 * sudo vi /usr/local/php5/lib/php.ini
	 * sudo /usr/sbin/apachectl restart
	 */
	function pub_importFile($o){
		header('Content-Type: text/html, charset=utf-8');
		$success	= true;
		$arrErrors	= array();
		foreach($_FILES as $k=>$file){
			$dest		= sprintf('%s/prospectImporter-%04d.csv',$this->uploadPath,$o['ipb_id']);

			if(file_exists($dest)){
				unlink($dest);
			}
			if (!move_uploaded_file($file['tmp_name'], $dest)){
				$arrErrors[$k]	= 'can not move upload file';
				$success		= false;
			}else{
				$success		= true;
			}
		}

		if(count($arrErrors)){
			return array('success'	=>$success,'error'	=>$arrErrors);
		}else{
			$res = CW_ProspectImporter::importCSVToIPR(array(
				'filename'	=> $dest,
				'ipb_id'	=> $o['ipb_id']
			));
			return array(
				'success'	=> $res['success'	],
				'error'		=> $res['error'		],
				'filename'	=> $dest,
			);
		}
	}
}