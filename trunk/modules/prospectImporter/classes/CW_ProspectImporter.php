<?php
class CW_ProspectImporter{
	/**
	 *
	 * @param unknown $o
	 * @return Ambigous <string, multitype:, mixed>
	 */
	static function getIPBRawMapping($o){
		$oIPB = new IPB_IMPORTED_PROSPECT_BATCH();
		$aIPB = $oIPB->get(array(
			'cols'	=> array('IPB_ACT_MAPPING'),
			'where'	=> array(
				'ipb_id'	=> $o['ipb_id']
			)
		));
		$aMappingTmp	= $aIPB[0]['ipb_act_mapping'];
		$aMappingTmp	= ($aMappingTmp!='') ? json_decode($aMappingTmp) : array();
		$aMapping		= array();
		foreach($aMappingTmp as $v){
			$v=(array)$v;
			$aMapping[$v['original_id']]=$v['mapped_id'];
		}
		$oIPR = new IPR_IMPORTED_PROSPECT();
		$aIPR = $oIPR->get(array(
			'cols'	=> array(
				'distinct IPR_RAW_ACTIVITIES as activities'
			),
			'where'=> array(
				'IPR_IPB_ID'	=> $o['ipb_id']
			)
		));

		if(is_array($aIPR) && count($aIPR)>0){
			foreach($aIPR as $v){
				$aAct = explode('/',$v['activities']);
				foreach($aAct as $act){
					$act = trim($act);
					if(!array_key_exists($act, $aMapping)){
						$aMapping[$act]='';
					}
				}
			}
		}
		$aTmp = array();
		foreach($aMapping as $k=>$v){
			$aTmp[]=array(
				'original_id'	=>$k,
				'mapped_id'		=>$v
			);
		}
		return $aTmp;
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:boolean Ambigous <boolean, multitype:multitype: , multitype:string >
	 */
	function importCSVToIPR($o){
		$aDatas = CW_ToolsCSV::readCSVToArray(array(
			'filename'			=> $o['filename'],
			'mandatoryFormat'	=> self::$importedColumns
		));

		if($aDatas['success']){
			$oIPR = new IPR_IMPORTED_PROSPECT();
			foreach($aDatas['data'] as $v){
				$v = array_combine(self::$dbImportedColumns,$v);
				$r = $oIPR->set(array_merge(array(
						'ipr_ipb_id'	=> $o['ipb_id']
				),$v));
			}
			return array(
					'success'	=> true,
					'error'		=> array()
			);
		}else{
			return array(
					'success'	=> false,
					'error'		=> $aDatas['error']
			);
		}
	}


}