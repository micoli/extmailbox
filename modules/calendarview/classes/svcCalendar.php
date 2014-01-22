<?php
class svcCalendar{
	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getUsers($o){
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
	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getEvents($o){
		$tmp = array();
		$tmp[]=array('type'=>'event','idx'=>1,'title'=>'aaa 1','date_begin'=>'2014-01-13 08:00:00','date_end'=>'2014-01-14 12:00:00','eventClass'=>'event-color-2 eventPatternVStripes');
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
		return array(
			'data'=>$tmp
		);
	}
}
