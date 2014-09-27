<?php
/**
 *
ALTER TABLE IPB_IMPORTED_PROSPECT_BATCH
ADD COLUMN `IPB_DEDUP_OPTIONS` VARCHAR(255) NOT NULL DEFAULT '' AFTER `IPB_ACT_MAPPING`;

update IPR_IMPORTED_PROSPECT set IPR_STATUS='RAW' where IPR_STATUS is null

 */
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
	 * @return multitype:number multitype:multitype:number string
	 */
	function pub_getProspects($o){
		$aDuplColumn=array(
			'ipr_dupl_company_name'		,
			'ipr_dupl_email'			,
			'ipr_dupl_phone'			,
			'ipr_dupl_company_number'	,
			'ipr_dupl_postcode'
		);

		$where = array(
			'ipr_ipb_id'	=> akead('ipb_id',$o,-1)
		);
		$where['ipr_status'] = array('<>','DUPL');
		foreach($aDuplColumn as $col){
			if(akead('with_'.$col,$o,'false')=='true'){
				$where['ipr_status'] = array('=','DUPL');
				$where['AND'][$col] = array('!=','');
			}
		}
		$oIPR = new IPR_IMPORTED_PROSPECT();
		$aIPRs = $oIPR->get(array(
			'where'		=> $where,
			'debugsql'	=> 1,
			'start'		=> akead('start',$o, 0),
			'limit'		=> akead('limit',$o,25),
		));
		$aAllDuplIdClients = array();
		if(is_array($aIPRs) && count($aIPRs)>0){
			foreach($aIPRs as $k=>$aIPR){
				$aIPRs[$k]['duplClients']=null;
				foreach($aDuplColumn as $col){
					$aIdClient=$aIPR[$col];
					if(!is_null($aIdClient) && trim($aIdClient)!=''){
						$aIdClient = explode(',',$aIdClient);
						$aIPRs[$k]['duplClients']=array_merge(akead('duplClients',$aIPR,array()),$aIdClient);
						$aAllDuplIdClients = array_merge($aAllDuplIdClients,$aIPRs[$k]['duplClients']);
					}
				}
			}
		}

		if(count($aAllDuplIdClients)>0){
			$oClient = new client();
			$aClientTmp = $oClient->get(array(
				'debugsql'	=> 1,
				'where'		=> array(
					'id'	=> array('IN',$aAllDuplIdClients)
				)
			));
			$aClients=array();
			foreach($aClientTmp as $v){
				$aClients[$v['id']]=$v;
			}
			$aIPRtmps	= $aIPRs;
			$aIPRs		= array();
			foreach($aIPRtmps as $k=>$aIPR){
				$aIPRs[] = $aIPR;
				if(!is_null($aIPR['duplClients'])){
					foreach($aIPR['duplClients'] as $idClient){
						$aIPRs[]=array(
							'ipr_id'				=> $idClient.'#',
							'ipr_ipb_id'			=> '--',
							'ipr_company_name'		=> $aClients[$idClient]['raison_sociale'],
							'ipr_company_number'	=> $aClients[$idClient]['siret'],
							'ipr_address1'			=> $aClients[$idClient]['adresse1'],
							'ipr_address2'			=> $aClients[$idClient]['adresse1'],
							'ipr_town_name'			=> $aClients[$idClient]['ville'],
							'ipr_raw_activities'	=> '--',
							'ipr_mapped_activities'	=> '--',
							'ipr_postcode'			=> $aClients[$idClient]['codepostal'],
							'ipr_phone'				=> $aClients[$idClient]['telephone'],
							'ipr_phone2'			=> $aClients[$idClient]['portable'],
							'ipr_email'				=> $aClients[$idClient]['email'],
							'ipr_email2'			=> '--',
							'ipr_contact_title'		=> $aClients[$idClient]['contact_titre'],
							'ipr_contact_firstname'	=> $aClients[$idClient]['contact_prenom'],
							'ipr_contact_lastname'	=> $aClients[$idClient]['contact_nom'],
							'ipr_contact_function'	=> $aClients[$idClient]['contact_fonction'],
							'ipr_description'		=> '',
							'ipr_status'			=> 'CLIENT'
						);
					}
				}
			}
		}

		$aIPRCnt = $oIPR->get(array(
			'cols'		=> array(
				'count(*) as cnt',
				'sum(if(ipr_dupl_email			="",0,1)) as dupl_email			',
				'sum(if(ipr_dupl_phone			="",0,1)) as dupl_phone			',
				'sum(if(ipr_dupl_company_name	="",0,1)) as dupl_company_name	',
				'sum(if(ipr_dupl_company_number	="",0,1)) as dupl_company_number',
				'sum(if(ipr_dupl_postcode		="",0,1)) as dupl_postcode		'
			),
			'where'		=> array(
				'ipr_ipb_id'	=> $o['ipb_id']
			),
		));

		return array(
			'data'			=> $aIPRs,
			'total'			=> $aIPRCnt[0]['cnt'],
			'duplicates'	=> array(
				'dupl_phone'			=> $aIPRCnt[0]['dupl_phone'			],
				'dupl_email'			=> $aIPRCnt[0]['dupl_email'			],
				'dupl_company_name'		=> $aIPRCnt[0]['dupl_company_name'	],
				'dupl_company_number'	=> $aIPRCnt[0]['dupl_company_number'],
				'dupl_postcode'			=> $aIPRCnt[0]['dupl_postcode'		],
			)
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
			}
		}
		fb($aIPB);
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