<?php

class svcRedmineTest{
	// http://localhost/extmailbox_local/proxy.php?exw_action=local.redmineTest.test1&group=a
	function pub_test1($o){
		sleep(rand(1,40)/10);
		$res = array();
		for($i=1;$i<=rand(10,30);$i++){
			/*$res[] = array(
				'id'		=> sprintf('i%02d'	,$i),
				'display'	=> sprintf('val%02d',$i),
				'group'		=> akead('group',$o,'--')
			);*/
			$res[] = array(
				sprintf('i%02d'	,$i),
				sprintf('val%02d',$i),
				akead('group',$o,'--')
			);
		}
		return array('result'=>$res,'total_count'=>count($res));
	}
}