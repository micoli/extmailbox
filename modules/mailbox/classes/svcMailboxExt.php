<?php
class svcMailboxExt extends svcMailboxImap{
	function pub_getMailListInFolders($o){
		$tmp = parent::pub_getMailListInFolders($o);
		foreach($tmp['data'] as &$record){
			$record->user_data_01=rand(0,100);
		}
		return $tmp;
	}
}
