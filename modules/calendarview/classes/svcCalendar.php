<?php
class svcCalendar{
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
