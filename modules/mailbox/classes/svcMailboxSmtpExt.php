<?php
class svcMailboxSmtpExt extends svcMailboxSmtp{
	function pub_uploadAttachment($o){
		$success = true;
		$aUpload = parent::pub_uploadAttachment($o);
		if($aUpload['success']){
			$atmp = $aUpload['files'];
			$aUpload['files']=array();
			foreach($atmp as $k=>$file){
				$aUpload['files'][$file['origin']]['zimbra'] = $this->imapProxy->uploadAttachment(123, $file['path'], $file['prefix'].'-'.$file['origin']);
				if(!$aUpload['files'][$file['origin']]['zimbra']['success']){
					$success = false;
				}
			}
		}
		return array (
			'success'	=> $success,
			'files'		=> $aUpload ['files']
		);
	}
}
