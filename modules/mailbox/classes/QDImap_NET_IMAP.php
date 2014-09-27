<?php
class QDImap_NET_IMAP extends QDImap{
	var $imapStream		;

	var $pear_imap_order		= array(
		'date'		=> 'INTERNALDATE',
		'arrival'	=> 'UID',
		'from'		=> SORTFROM,
		'subject'	=> 'SUBJECT',
		'size'		=> 'RFC822.SIZE'
	);

	function getmailboxes ($filter){
		return $this->imapStream->getMailboxes($filter);
	}

	function __destruct (){
		if($this->imapStream){
			$this->imapStream->disconnect();
		}
	}

	function open ($subFolder=''){
		$this->currentFolder	= $subFolder;
		$this->currentFolder64	= base64_encode($subFolder);
		//$this->imapStream = new \Noi\Util\Mail\ImapIdleClient('localhost',143,false,'UTF-8');
		$this->imapStream = new QDNet_IMAP('localhost',143,false,'UTF-8');
		$this->imapStream->login($this->accounts[$this->account]['user'],$this->accounts[$this->account]['pass']);
		$this->imapStream->selectMailbox('INBOX');
	}

	function getacl ($mailbox){
		return $this->imapStream->getACL($mailbox);
	}

	function isConnected(){
		return isset($this->imapStream);
	}

	function search ($query){
		return $this->imapStream->search($query);
	}

	function renamemailbox($old,$new){
		//return $this->imapStream->;
	}

	function createmailbox($folder){
	}

	function deletemailbox($folder){
	}

	function status ($mailbox,$options=SA_ALL){
		return $this->imapStream->getStatus($mailbox);
	}

	function sort ($sort,$dir){
		$sort='arrival';
		if($this->imapStream->hasCapability('SORT')){
			//getFieldForSort
			return $this->imapStream->sort(($dir=='ASC'?:'REVERSE ').strtoupper($sort),true);
		}else{
			$aTmp = $this->imapStream->getFieldForSort(null,true,$this->pear_imap_order[$sort]);
			asort($aTmp, SORT_NATURAL);
			return $aTmp;
		}
	}

	function thread (){
	}

	function num_msg (){
		return $this->imapStream->getNumberOfMessages();
	}

	function uid ($message_no){
	}

	function msgno ($message_no){
	}

	function fetch_overview ($p,$uid=true){
		return $this->imapStream->getSummary($p,true);
	}

	function fetchheader ($message_no){
		return $this->imapStream->getRawHeaders($message_no,'',true);
	}

	function fetchbody ($message_no,$partno){
		$file = $this->getCacheFileName(__FUNCTION__,$message_no,$partno);
		if($this->cacheEnabled && file_exists($file)){
			return json_decode(file_get_contents($file));
		}else{
			$tmp = $this->imapStream->getBodyPart($message_no,$partno,true);

			if($tmp){
				file_put_contents($file,json_encode($tmp));
			}
			return $tmp;
		}
	}

	function body($message_no){
		$file = $this->getCacheFileName(__FUNCTION__,$message_no);
		if($this->cacheEnabled && file_exists($file)){
			return json_decode(file_get_contents($file));
		}else{
			$tmp = $this->imapStream->getBody($message_no,true);

			if($tmp){
				file_put_contents($file,json_encode($tmp));
			}
			return $tmp;
		}
	}

	function fetchstructure ($message_no){
		$file = $this->getCacheFileName(__FUNCTION__,$message_no,'struct');
		if($this->cacheEnabled && file_exists($file)){
			return json_decode(file_get_contents($file));
		}else{
			$tmp = $this->imapStream->getStructure($message_no,true);

			if($tmp){
				file_put_contents($file,json_encode($tmp));
			}
			return $tmp;
		}
	}

	function setflag_full($message_no,$flag){
		return $this->imapStream->setFlags($message_no, $flag);
	}

	function clearflag_full($message_no,$flag){
		return $this->imapStream->setFlags($message_no, '','remove',true);
	}

	function expunge(){
		return $this->imapStream->expunge();
	}

	function mail_copy($sequence,$dest){
		return $this->imapStream->copyMessages($dest,$sequence,null,true);
	}

	function mail_move($sequence,$dest){
	}

	function append($folder, $mail_string,$flag){
		return $this->imapStream->appendMessage($mail_string,$folder,$flag);
	}

	function fetch_overviewWithCache($aID,$o){
		$aMsgs	= $this->fetch_overview(implode(',',$aID));
		$aRet	= array();
		$aMID	= array();
		if ($aMsgs) {
			foreach ($aMsgs as $msg) {
				$oTmp = (object) array();
				if($msg['MESSAGE_ID']){
					$oTmp->message_id	= $msg['MESSAGE_ID'];
					$oTmp->subject		= $msg['SUBJECT'];
					$oTmp->from			= sprintf('"%s" <%s>',$msg['FROM'][0]['PERSONAL_NAME'	],$msg['FROM'	][0]['EMAIL']);
					$oTmp->to			= sprintf('"%s" <%s>',$msg['TO'][0]['PERSONAL_NAME'	],$msg['TO'		][0]['EMAIL']);
					$oTmp->date			= $msg['DATE'];
					$oTmp->size			= $msg['SIZE'];
					$oTmp->uid			= $msg['UID'];
					$oTmp->msgno		= $msg['MSG_NUM'];
					$oTmp->recent		= akead('recent',$msg['FLAGS'],false)?1:0;
					$oTmp->flagged		= akead('flagged',$msg['FLAGS'],false)?1:0;
					$oTmp->answered		= akead('answered',$msg['FLAGS'],false)?1:0;
					$oTmp->deleted		= akead('deleted',$msg['FLAGS'],false)?1:0;
					$oTmp->seen			= akead('\seen',$msg['FLAGS'],false)?1:0;
					$oTmp->draft		= akead('draft',$msg['FLAGS'],false)?1:0;
					$oTmp->udate		= strtotime($msg['INTERNALDATE']);
					$msg				= $oTmp;

					$msg->folder		= $folder;
					$msg->msgid			= $msg->uid;
					$msg->date			= date('Y-m-d H:i:s',strtotime($msg->date));
					$msg->account		= $o['account'];
					$msg->folder		= $o['folder'];
					$aMID[]				= $msg->msgid;
					$aRet[]				= $msg;
				}
			}
			$aMMGCache = $this->getMMGCache($aMID);
			foreach($aRet as &$msg){
				$this->getMsgWithCacheSupport($aMMGCache,$msg);
			}
		}
		return $aRet;
	}
}