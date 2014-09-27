<?php
class svcMailboxImapExt extends svcMailboxImap{
	function pub_getMailListInFolders($o){
		set_time_limit(600);
		$tmp = parent::pub_getMailListInFolders($o);
		foreach($tmp['data'] as &$record){
			$record->user_data_01=$record->uid%7+3;
		}
		return $tmp;
	}
}
