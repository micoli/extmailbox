<?php
class svcCalendar{
	private function getAllUsersDependendBy($aut_id){
		include'exportSalesTeamFR.php';
		$auths=array();
		foreach($T_AUTH as &$v){
			if($v['AUT_ACTIF']==1){
				$auths[$v['AUT_ID']] = array(
					'id'			=> $v['AUT_ID'],
					'leaf'			=> 0,
					'text'			=> $v['AUT_PRENOM'].' '.$v['AUT_NOM'].' ('.$v['AUT_ID'].')',
					'group'			=> str_replace(',','',str_replace('level_1_leader','',str_replace('calc_commission_sales_','',str_replace('cdr_sales_services_','',$v['GROUPS'])))),
					'initial'		=> $v['AUT_INITIALES'],
					'id_superior'	=>$v['AUT_HIERARCHY_SUPERIOR'],
					'expanded'		=> $aut_id==$v['AUT_ID'],
					'level'			=> 0,
					'all_child_id'	=> array(),
					'children'		=> array()
				);
			}
		}
		$res = $auths[$aut_id];
		$this->getAllUsersChildren($res,$auths,1);
		return $res;
	}

	private function cmpUserByName($a,$b){
		if ((array_key_exists('children',$a)&&array_key_exists('children',$b))||(!array_key_exists('children',$a)&&!array_key_exists('children',$b))){
			return strcmp($a['text'],$b['text']);
		}elseif(array_key_exists('children',$a)){
			return 1;
		}elseif(array_key_exists('children',$b)){
			return -1;
		}
	}

	private function getAllUsersChildren(&$res,$auths,$level){
		foreach($auths as $auth){
			if($auth['id_superior']==$res['id']){
				$res['children'][]=array_merge($auth,array('level'=>$level));
				$res['all_child_id'][]=$auth['id'];
			}
		}
		if(count($res['children'])==0){
			$res['leaf']=1;
			unset($res['children']);
			$res['all_child_id']=array();
		}else{
			$res['text'].=' '.$res['group'];
			foreach($res['children'] as &$child){
				$res['all_child_id'] = array_merge($res['all_child_id'],$this->getAllUsersChildren($child, $auths,$level+1));
			}
			usort($res['children'],array($this,'cmpUserByName'));
		}
		return $res['all_child_id'];
	}
	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getUsers($o){
		return array($this->getAllUsersDependendBy(1071));
		return array(array(
			'text'	=>"DirCom",	'id'=>1071,	'expanded'=> true,'leaf' => false,'level'=>'DC','checked'=>true,
			'children'	=> array(
				array(
					'text'=>"Team leader 1",'id'=>1072,'leaf' => false,'level'=>'TL',
					'children'	=> array(
						array('text'=>"Comm 11",'id'=>1074),
						array('text'=>"Comm 12",'id'=>1075),
						array('text'=>"Comm 13",'id'=>1076),
						array('text'=>"Comm 14",'id'=>1077),
						array('text'=>"Comm 15",'id'=>1078),
					)
				),
				array(
					'text'=>"Team leader 1",'id'=>2073,'leaf' => false,'level'=>'TL',
					'children'	=> array(
						array('text'=>"Comm 21",'id'=>2074),
						array('text'=>"Comm 22",'id'=>2075),
						array('text'=>"Comm 23",'id'=>2076),
						array('text'=>"Comm 24",'id'=>2077),
						array('text'=>"Comm 25",'id'=>2078),
						array('text'=>"Comm 26",'id'=>2079),
						array('text'=>"Comm 27",'id'=>2080),
					)
				),
				array(
					'text'=>"Team leader 3",'id'=>3073,'leaf' => false,'level'=>'TL',
					'children'	=> array(
						array('text'=>"Comm 31",'id'=>3074),
						array('text'=>"Comm 32",'id'=>3075),
						array('text'=>"Comm 33",'id'=>3076),
						array('text'=>"Comm 34",'id'=>3077),
						array('text'=>"Comm 35",'id'=>3078),
						array('text'=>"Comm 36",'id'=>3079),
					)
				)
			)
		));
	}

	private function transformCxd2Event($cxd){
		$event = array(
			'type'			=> 'event',
			'idx'			=> $cxd['cxd_id'],
			'date_begin'	=> $cxd['cxd_date'].' 00:00:00',
			'date_end'		=> $cxd['cxd_date'].' '.($cxd['cxd_percent']==50?'12:00:00':'23:59:59'),
			'eventClass'	=> 'event_cxd_'.$cxd['cxd_type'].' '.($cxd['cxd_percent']>0?' cxd_percent_'.$cxd['cxd_percent']:' '),
			'title'			=> $cxd['aut_nom'].' '.$cxd['cxd_type'].' ',
			'cxd'			=> $cxd
		);
		switch($cxd['cxd_type']){
			case 'ghost':
				$event['date_end'	] = date('Y-m-d 23:59:59',strtotime($cxd['cxd_date'].' +6 days '));
			break;
			case 'allowance':
			case 'rainy':
				$event['title'		] .= $cxd['cxd_percent'	].'%';
			break;
			case 'contest':
				$event['title'		] .= $cxd['cxd_contest_point'	].' points';
			break;
			case 'long':
				$event['date_end'	] = date('Y-m-d 23:59:59',strtotime($cxd['cxd_date'].' +36 days '));
			break;
		}
		if($cxd['aut_nom']=='ALL'){
			$event['eventClass'	].=' eventPatternHStripes ';
		}
		return $event;
	}

	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getEvents($o){
		$tmp = array();
		$id=0;
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'long'			,'cxd_date'=>'2013-12-23', 'aut_nom'=>'RT','cxd_id_employe'=>3074);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'ghost'		,'cxd_date'=>'2014-01-06', 'aut_nom'=>'RT','cxd_id_employe'=>3074);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'ghost'		,'cxd_date'=>'2014-01-13', 'aut_nom'=>'RT','cxd_id_employe'=>3074);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'ghost'		,'cxd_date'=>'2014-01-27', 'aut_nom'=>'AL','cxd_id_employe'=>3075);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'allowance'	,'cxd_date'=>'2014-01-03', 'aut_nom'=>'RE','cxd_id_employe'=>1074,'cxd_percent'=>50);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'allowance'	,'cxd_date'=>'2014-01-08', 'aut_nom'=>'RT','cxd_id_employe'=>2074,'cxd_percent'=>100);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'rainy'		,'cxd_date'=>'2014-01-23', 'aut_nom'=>'AL','cxd_id_employe'=>3074,'cxd_percent'=>50);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'rainy'		,'cxd_date'=>'2014-01-15', 'aut_nom'=>'ALL','cxd_id_employe'=>-1,'cxd_percent'=>50);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'contest'		,'cxd_date'=>'2014-01-10', 'aut_nom'=>'KL','cxd_id_employe'=>1074,'cxd_contest_point'=>10);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'contest'		,'cxd_date'=>'2014-01-17', 'aut_nom'=>'KL','cxd_id_employe'=>1076,'cxd_contest_point'=>10);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'contest'		,'cxd_date'=>'2014-01-08', 'aut_nom'=>'HJ','cxd_id_employe'=>1077,'cxd_contest_point'=>20);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'contest'		,'cxd_date'=>'2014-01-28', 'aut_nom'=>'KL','cxd_id_employe'=>2073,'cxd_contest_point'=>5);
		$tmp[]=array('cxd_id'=>$id++,'cxd_type'=>'contest'		,'cxd_date'=>'2014-01-13', 'aut_nom'=>'RT','cxd_id_employe'=>2074,'cxd_contest_point'=>20);


		/*$tmp[]=array('type'=>'event','idx'=>1,'title'=>'aaa 1','date_begin'=>'2014-01-13 08:00:00','date_end'=>'2014-01-14 12:00:00','eventClass'=>'event-color-2 eventPatternVStripes');
		$tmp[]=array('type'=>'event','idx'=>2,'title'=>'bbb 2','date_begin'=>'2014-01-14 12:00:00','date_end'=>'2014-01-15 23:59:59');
		$tmp[]=array('type'=>'event','idx'=>3,'title'=>'ccc 3','date_begin'=>'2014-01-15 00:00:00','date_end'=>'2014-01-21 23:59:59');
		//$tmp[]=array('type'=>'event','idx'=>4,'title'=>'ddd 3','date_begin'=>'2014-01-15 00:00:00','date_end'=>'2014-01-15 23:59:59');
		$tmp[]=array('type'=>'event','idx'=>5,'title'=>'eee 3','date_begin'=>'2014-01-01 00:00:00','date_end'=>'2014-01-15 12:00:00');
		$tmp[]=array('type'=>'event','idx'=>6,'title'=>'fff 3','date_begin'=>'2014-01-15 08:00:00','date_end'=>'2014-01-15 18:00:00');
		$tmp[]=array('type'=>'event','idx'=>7,'title'=>'ggg 3','date_begin'=>'2014-01-15 00:00:00','date_end'=>'2014-01-15 23:59:59');
		$tmp[]=array('type'=>'event','idx'=>8,'title'=>'hhh 3','date_begin'=>'2014-01-15 00:00:00','date_end'=>'2014-01-15 23:59:59');
		$tmp[]=array('type'=>'event','idx'=>9,'title'=>'iii 3','date_begin'=>'2014-01-15 00:00:00','date_end'=>'2014-01-15 23:59:59','eventClass'=>'event-color-0 eventPatternRDStripes');
		$tmp[]=array('type'=>'event','idx'=>9,'title'=>'iii 3','date_begin'=>'2014-01-15 00:00:00','date_end'=>'2014-01-15 23:59:59','eventClass'=>'event-color-1 eventPatternDStripes');
		$tmp[]=array('type'=>'day','idx'=>10,'title'=>'jjj 3','date_begin'=>'2014-01-18 00:00:00','date_end'=>'2014-02-15 23:59:59','eventClass'=>'event-color-5');
		*/
		$result = array();
		foreach($tmp as $v){
			$result[]=$this->transformCxd2Event($v);
		}
		return array(
			'data'=>$result
		);
	}
}
