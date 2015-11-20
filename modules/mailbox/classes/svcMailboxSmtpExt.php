<?php
class svcMailboxSmtpExt extends svcMailboxSmtp{
	function pub_uploadAttachment($o){
		$success = true;
		$aUpload = parent::pub_uploadAttachment($o);
		if($aUpload['success']){
			foreach($aUpload['files'] as $k=>$file){
				$aUpload['files'][$k]['zimbra'] = $this->imapProxy->uploadAttachment(123, $file['path'], $file['prefix'].'-'.$file['origin']);
				if(!$aUpload['files'][$k]['zimbra']['success']){
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