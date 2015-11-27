<?php
class svcMailboxImapExt extends svcMailboxImap{

	public function pub_getAccountFolders($o){
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open();
		if(!$this->imapProxy->isConnected()){
			return array();
		}
		return $this->imapProxy->getmailboxes("*");
	}

	public function pub_getMailListInFolders($o){
		$o['folder']=base64_decode($o['folder']);
		$this->imapProxy->setAccount($o['account']);
		if(!$this->imapProxy->isConnected()){
			return array('error'=>true);
		}

		$query = array_key_exists_assign_default('query',$o,false);

		if($query){
			$res = $this->imapProxy->search(array(
				'query'=>$query
			));
		}else{
			$o['query']='in:"'.$o['folder'].'"';
			$res = $this->imapProxy->search($o);
			//db($res);
		}
		return array('data'=>$res,'totalCount'=>count($res)*200,'s'=>0,'m'=>count($res)*200);
	}
	public function pub_searchContact($o){
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open();
		if(!$this->imapProxy->isConnected()){
			return array();
		}
		return $this->imapProxy->searchContact($o);
	}

}