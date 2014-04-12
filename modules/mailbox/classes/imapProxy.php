<?php
class imapProxy{
	var $cacheFolder	;
	var $currentFolder	;
	var $imapStream		;
	var $accounts		= array();
	var $cacheEnabled	= true;

	var $imap_order		= array(
		'date'		=> SORTDATE,
		'arrival'	=> SORTARRIVAL,
		'from'		=> SORTFROM,
		'subject'	=> SORTSUBJECT,
		'size'		=> SORTSIZE
	);

	function __construct ($accounts){
		$this->accounts = $accounts;
	}

	function __destruct (){
		if ($this->imapStream){
			imap_close($this->imapStream);
		}
	}

	function setAccount ($account){
		$this->account = $account;
	}

	function getAccountVar ($var = false){
		if($var){
			return $this->accounts[$this->account][$var];
		}else{
			return $this->accounts[$this->account];
		}
	}

	function setCache($folder){
		$this->cacheFolder = $folder;
	}

	function getCacheFileName($type,$message_no,$partno='body'){
		$foldA = md5($this->getAccountVar('cnx')).'_'.$this->getAccountVar('user');
		$foldB = str_replace('/','.',$this->currentFolder);
		$foldC = $type."-".$message_no%1000;
		$folderName = sprintf('%s/%s/%s/%s',$this->cacheFolder,$foldA,$foldB,$foldC);
		if(!file_exists($folderName)){
			mkdir($folderName,0755,true);
		}
		return sprintf("%s/%s_%s",$folderName,$message_no,$partno);
	}

	function open ($subFolder=''){
		$this->currentFolder = $subFolder;
		$this->imapStream = imap_open($this->accounts[$this->account]['cnx'].$subFolder, $this->accounts[$this->account]['user'],$this->accounts[$this->account]['pass']);
	}

	function getmailboxes ($filter){
		return imap_getmailboxes($this->imapStream, $this->accounts[$this->account]['cnx'], $filter);
	}

	function getacl ($mailbox){
		return imap_getacl($this->imapStream, $mailbox);
	}

	function isConnected(){
		return ($this->imapStream)?true:false;;
	}

	function search ($query){
		return imap_search($this->imapStream,$query,SE_UID,"UTF-8");
	}

	function renamemailbox($old,$new){
		return imap_renamemailbox($this->imapStream, $this->getAccountVar('cnx').$old, $this->getAccountVar('cnx').$new);
	}

	function createmailbox($folder){
		return imap_createmailbox($this->imapStream, $this->getAccountVar('cnx').$folder);
	}

	function deletemailbox($folder){
		return imap_deletemailbox($this->imapStream, $this->getAccountVar('cnx').$folder);
	}

	function status ($mailbox,$options=SA_ALL){
		return imap_status($this->imapStream,$mailbox,$options);
	}

	function sort ($sort,$dir){
		return imap_sort($this->imapStream,$this->imap_order[$sort],$dir=='ASC'?0:1,SE_UID);
	}

	function thread (){
		return imap_thread($this->imapStream,SE_UID);
	}

	function num_msg (){
		return imap_num_msg($this->imapStream);
	}

	function uid ($message_no){
		return imap_uid($this->imapStream,$message_no);
	}
	function msgno ($message_no){
		return imap_msgno($this->imapStream,$message_no);
	}

	function fetch_overview ($p){
		return imap_fetch_overview($this->imapStream, $p,FT_UID);
	}

	function fetchheader ($message_no){
		return imap_fetchheader($this->imapStream,$message_no,FT_UID);
	}

	function fetchbody ($message_no,$partno){
		$file = $this->getCacheFileName(__FUNCTION__,$message_no,$partno);
		if($this->cacheEnabled && file_exists($file)){
			return json_decode(file_get_contents($file));
		}else{
			$tmp = imap_fetchbody($this->imapStream,$message_no,$partno,FT_UID);
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
			$tmp = imap_body($this->imapStream,$message_no,FT_UID);
			if($tmp){
				file_put_contents($file,json_encode($tmp));
			}
			return $tmp;
		}
		//return imap_body($this->imapStream,$message_no);
	}

	function fetchstructure ($message_no){
		$file = $this->getCacheFileName(__FUNCTION__,$message_no,'struct');
		if($this->cacheEnabled && file_exists($file)){
			return json_decode(file_get_contents($file));
		}else{
			$tmp = imap_fetchstructure($this->imapStream,$message_no,FT_UID);
			if($tmp){
				file_put_contents($file,json_encode($tmp));
			}
			return $tmp;
		}
		//return imap_fetchstructure($this->imapStream,$message_no);
	}

	function setflag_full($message_no,$flag){
		return imap_setflag_full($this->imapStream,$message_no,$flag,ST_UID);
	}

	function clearflag_full($message_no,$flag){
		return imap_clearflag_full($this->imapStream,$message_no,$flag,ST_UID);
	}

	function expunge(){
		return imap_expunge($this->imapStream);
	}

	function mail_copy($sequence,$dest){
		return imap_mail_copy($this->imapStream,$sequence,$dest,CP_UID);
	}

	function mail_move($sequence,$dest){
		return imap_mail_move($this->imapStream,$sequence,$dest,CP_UID);
	}

	function append($folder, $mail_string,$flag){
		return imap_append($this->imapStream, $this->accounts[$this->account]['cnx'].$folder, $mail_string, $flag);
	}
}