<?php
class svcCalendar{
	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getEvents($o){
		$tmp = array();
		$tmp[]=array('idx'=>1,'title'=>'aaa 1','date_begin'=>'2014-01-13 00:00:00','date_end'=>'2014-01-14 12:00:00');
		$tmp[]=array('idx'=>2,'title'=>'bbb 2','date_begin'=>'2014-01-14 12:00:00','date_end'=>'2014-01-15 23:59:59');
		$tmp[]=array('idx'=>3,'title'=>'ccc 3','date_begin'=>'2014-01-15 00:00:00','date_end'=>'2014-01-15 23:59:59');
		return array(
			'data'=>$tmp
		);
	}
}
