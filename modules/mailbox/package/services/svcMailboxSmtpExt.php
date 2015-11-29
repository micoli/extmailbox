<?php
namespace qd\services;

//new QDServiceLocatorRoundcube();

class svcMailboxSmtpExt extends svcMailboxSmtp{
	public function pub_uploadAttachment($o){
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

	public function pub_sendMail($o){
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open();
		if(!$this->imapProxy->isConnected()){
			return array();
		}
		return $this->imapProxy->saveDraft($o);
	}
}
