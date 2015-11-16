<?php
class QDImap{
	var $cacheFolder			;
	var $currentFolder			;
	var $currentFolderStatus	;
	var $imapStream				;
	var $accounts				= array();
	var $account				= '';
	var $cacheEnabled			= true;
	var $oDBCacheObject			= null;
	static $aMimeContentType	= null;

	var $imap_order		= array(
		'date'		=> SORTDATE,
		'arrival'	=> SORTARRIVAL,
		'from'		=> SORTFROM,
		'subject'	=> SORTSUBJECT,
		'size'		=> SORTSIZE
	);

	static $icons = array(
		'^inbox$'		=>'mail_inbox',
		'^envoy'		=>'mail_open_send',
		'^sent$'		=>'mail_open_send',
		'^trash$'		=>'mail_trash',
		'^corbeille$'	=>'mail_trash',
	);

	/**
	 *
	 * @param String $account
	 * @param name of the subClass wrapper $subLib
	 * @return QDImap_HORDE
	 * @return QDImap_MOD_IMAP
	 * @return QDImap_MOD_NET
	 * @return QDImap_ZIMBRA
	 */
	static function getInstance($accounts,$subLib){
		$className='QDImap_'.$subLib;
		return new $className($accounts);
	}

	function __construct ($accounts){//NET_IMAP
		$this->accounts	= $accounts;
		$this->init();
	}

	function init(){
	}

	function setDBCacheObject($oCacheObject){
		$this->oDBCacheObject=$oCacheObject;
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

	function getConnectionMailbox(){
		return $this->accounts[$this->account]['cnx'];
	}

	function getCurrentFolder(){
		return $this->currentFolder;
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

	function getmailboxes ($filter){
	}

	function __destruct (){
	}

	function open ($subFolder=''){
	}

	function getacl ($mailbox){
	}

	function isConnected(){
	}

	function search ($query){
	}

	function renamemailbox($old,$new){
	}

	function createmailbox($folder){
	}

	function deletemailbox($folder){
	}

	function status ($mailbox,$options=SA_ALL){
	}

	function idle ($timeout){
	}

	/**
	 *
	 * @param unknown $aMMGCache
	 * @param unknown $msg
	 */
	function getMsgWithCacheSupport(&$aMMGCache,&$msg){
		if(!array_key_exists($msg->msgid,$aMMGCache)){
			$head = $this->getHeader($msg->uid);
			$this->parseRecipient($head, 'from'	);
			$this->parseRecipient($head, 'to'	);
			$this->parseRecipient($head, 'cc'	);
			$aMMGCache[$msg->msgid] = array(
				'mmg_uid'			=> $msg->msgid,
				'mmg_folder'		=> $msg->folder,
				'mmg_folder_uuid'	=> $msg->folder_uuid,
				'mmg_message_id'	=> $msg->message_id,
				'mmg_date'			=> $msg->date,
				'mmg_subject'		=> $this->decodeMimeStr($head['subject'][0]),
				'mmg_from'			=> json_encode(array_key_exists_assign_default('from',$head,'')),
				'mmg_to'			=> json_encode(array_key_exists_assign_default('to'	,$head,'')),
				'mmg_cc'			=> json_encode(array_key_exists_assign_default('cc'	,$head,'')),
				'mmg_references'	=> isset($msg->references	)?$msg->references	:'',
				'mmg_in_reply_to'	=> isset($msg->in_reply_to	)?$msg->in_reply_to	:'',
				'mmg_size'			=> $msg->size,
				'mmg_rawheader'		=> json_encode($head),
			);
			if($msg->msgid && $msg->folder_uuid){
				$this->putMMGCache($aMMGCache[$msg->msgid]);
			}
		}

		$rawHeader = json_decode($aMMGCache[$msg->msgid]['mmg_rawheader']);
		$msg->priority=3;
		if(isset($rawHeader->{'x-priority'})){
			$msg->priority=intval(array_pop($rawHeader->{'x-priority'}));
		}elseif (isset($rawHeader->{'importance'})){
			switch (strtolower($rawHeader->{'importance'})) {
				case 'high'		: $msg->priority = 1; break;
				case 'normal'	: $msg->priority = 3; break;
				case 'low'		: $msg->priority = 5; break;
			}
		}
		$msg->subject	= $aMMGCache[$msg->msgid]['mmg_subject'];
		$msg->from		= json_decode($aMMGCache[$msg->msgid]['mmg_from'	]);
		$msg->to		= json_decode($aMMGCache[$msg->msgid]['mmg_to'		]);
		$msg->cc		= json_decode($aMMGCache[$msg->msgid]['mmg_cc'		]);
	}

	/**
	 *
	 * @param unknown $mid
	 * @param unknown $fields
	 */
	function putMMGCache($fields){
		$this->oDBCacheObject->set($fields);
	}

	/**
	 *
	 * @param unknown $aMID
	 * @return Ambigous <boolean, multitype:Ambigous <boolean, multitype:, number> >
	 */
	function getMMGCache($folder,$folder_uuid,$aMID){
		return $this->oDBCacheObject->get(array(
			'where'		=> array(
				'MMG_UID'			=> array('IN',$aMID)	,
				'MMG_FOLDER'		=> $folder				,
				'MMG_FOLDER_UUID'	=> $folder_uuid
			)
		),array(
			'uniqKey'	=> 'MMG_UID'
		));
	}

	function getMMGMaxInFolder($folder,$folder_uuid){
		return $this->oDBCacheObject->get(array(
			'cols'	=>array(
				'max(MMG_UID	) as max_id',
				'max(MMG_DATE	) as max_date'
			),
			'where'	=> array(
				'MMG_FOLDER'		=> $folder				,
				'MMG_FOLDER_UUID'	=> $folder_uuid
			)
		));
	}

	/**
	 *
	 * @param unknown $message_no
	 * @return Ambigous <multitype:multitype: , string>
	 */
	public function getHeader($message_no,$withRawheader=false){
		$rawHeader	= $this->fetchheader($message_no);
		$idx		= -1;
		$tmpHeader	= array();
		foreach(explode("\n",$rawHeader) as $k=>$v){
			$v = str_replace("\t"," ",$v);
			if(trim($v)!=''){
				if(substr($v,0,1)!=' '){
					$idx++;
					$tmpHeader[$idx]=trim($v);
				}else{
					$tmpHeader[$idx].=trim($v);
				}
			}
		}
		if (is_array($tmpHeader) && count($tmpHeader)) {
			$head = array();
			foreach($tmpHeader as $line) {
				if (preg_match("!^([^:]*): (.*)!i", $line, $arg)) {
					$arg[1] = strtolower($arg[1]);
					if(!array_key_exists($arg[1],$head)){
						$head[$arg[1]]=array();
					}
					$head[$arg[1]][] = $arg[2];
				}
			}
		}
		if($withRawheader){
			$head['--rawheader']=$rawHeader;
		}
		return $head;
	}

	/**
	 *
	 * @param unknown $header
	 * @param unknown $type
	 */
	function parseRecipient(&$header,$type){
		if(is_array($header)){
			if(array_key_exists($type,$header)){
				$tmp = imap_rfc822_parse_adrlist($header[$type][0],'');
				if(is_array($tmp)){
					$header[$type]=array();
					foreach($tmp as $k=>$v){
						$header[$type][]=array(
								'email'		=> trim(imap_utf8($v->mailbox)).'@'.trim(imap_utf8($v->host)),
								'name'		=> trim(trim(trim(imap_utf8(isset($v->name)?$v->name:''), "'"), '"'))
						);
					}
				}
			}
		}else{
			$tmp = imap_rfc822_parse_adrlist($header->$type,'');
			if(is_array($tmp)){
				$header->$type=array();
				foreach($tmp as $k=>$v){
					array_push($header->$type,array(
						'email'		=> trim(imap_utf8($v->mailbox)).'@'.trim(imap_utf8($v->host)),
						'name'		=> trim(trim(trim(imap_utf8($v->name), "'"), '"'))
					));
				}
			}
		}
	}

	/**
	 *
	 * @param unknown $string
	 * @param string $charset
	 * @return string
	 */
	function decodeMimeStr($string, $charset="UTF-8" ){
		$newString = '';
		$elements=imap_mime_header_decode($string);
		for($i=0;$i<count($elements);$i++){
			if ($elements[$i]->charset == 'default'){
				$elements[$i]->charset = 'iso-8859-1';
			}
			$newString .= iconv($elements[$i]->charset, $charset, $elements[$i]->text);
		}
		return $newString;
	}

	function sortBy_arrival($a,$b){
		if ($a == $b) {
			return 0;
		}
		return ($a < $b) ? -1 : 1;
	}

	function sort ($sort,$dir){
	}

	function thread (){
	}

	function num_msg (){
	}

	function uid ($message_no){
	}

	function msgno ($message_no){
	}

	function fetch_overview ($p,$uid=true){
	}

	function fetchheader ($message_no){
	}

	function fetchbody ($message_no,$partno){
	}

	function body($message_no){
	}

	function fetchstructure ($message_no){
	}

	function setflag_full($message_no,$flag){
	}

	function clearflag_full($message_no,$flag){
	}

	function expunge(){
	}

	function mail_copy($sequence,$dest){
	}

	function mail_move($sequence,$dest){
	}

	function append($folder, $mail_string,$flag){
	}

	function fetch_overviewWithCache($aID,$o){
	}

	function fetch_overview_query($sQuery){
	}

	static function getMimeContentType($filename){
		//http://www.php.net/manual/en/function.mime-content-type.php#107798
		if(!is_array(self::$aMimeContentType)){
			$APACHE_MIME_TYPES_URL='http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types';
			$tmpMimeFileName=sys_get_temp_dir().'QDMimeContentType';
			if(!file_exists($tmpMimeFileName)){
				file_put_contents($tmpMimeFileName,file_get_contents($APACHE_MIME_TYPES_URL));
			}
			self::$aMimeContentType=array();
			foreach(@explode("\n",@file_get_contents($tmpMimeFileName)) as $x){
				if(isset($x[0])&&$x[0]!=='#'&&preg_match_all('#([^\s]+)#',$x,$out)&&isset($out[1])&&($c=count($out[1]))>1){
					for($i=1;$i<$c;$i++){
						self::$aMimeContentType[$out[1][$i]] =$out[1][0];
					}
				}
			}
			@ksort(self::$aMimeContentType);
		}
		if(preg_match("|\.([a-z0-9]{2,4})$|i", $filename, $m)){
			$ext = strtolower($m[1]);
			return akead($ext,self::$aMimeContentType,'');
		}
		return '';
	}

	/**
	 *
	 * @param unknown $mid
	 * @param unknown $withAttachmentsBody
	 * @return multitype:string multitype:
	 */
	function getMimeMsg($mid,$withAttachmentsBody) {
		// input $mbox = IMAP stream, $mid = message id
		// output all the following:
		$ret = array(
				'charset'		=>'',
				'htmlmsg'		=>'',
				'plainmsg'		=>'',
				'attachments'	=>array()
		);

		// BODY
		$s = $this->imapProxy->fetchstructure($mid);
		if (!$s->parts){  // simple
			$this->getMimePart($mid,$s,0,$ret,$withAttachmentsBody);  // pass 0 as part-number
		}else{  // multipart: cycle through each part
			foreach ($s->parts as $partno0=>$p){
				$this->getMimePart($mid,$p,$partno0+1,$ret,$withAttachmentsBody);
			}
		}
		return $ret;
	}

	/**
	 *
	 * @param unknown $mid
	 * @param unknown $p
	 * @param unknown $partno
	 * @param unknown $ret
	 * @param unknown $withAttachmentsBody
	 */
	function getMimePart($mid,$p,$partno,&$ret,$withAttachmentsBody) {
		// $partno = '1', '2', '2.1', '2.1.3', etc for multipart, 0 if simple

		// DECODE DATA
		$data = ($partno)?
		$this->imapProxy->fetchbody($mid,$partno):  // multipart
		$this->imapProxy->body($mid);  // simple
		// Any part may be encoded, even plain text messages, so check everything.
		if ($p->encoding==4){
			$data = quoted_printable_decode($data);
		}elseif ($p->encoding==3){
			$data = base64_decode($data);
		}

		// PARAMETERS
		// get all parameters, like charset, filenames of attachments, etc.
		$params = array();
		if ($p->parameters){
			foreach ($p->parameters as $x){
				$params[strtolower($x->attribute)] = $x->value;
			}
			if(isset($p->id)){
				if(preg_match('!^<(.*)>$!',$p->id,$m)){
					$params['id'] = $m[1];
				}else{
					$params['id'] = $p->id;
				}
			}
		}
		if ($p->dparameters){
			foreach ($p->dparameters as $x){
				$params[strtolower($x->attribute)] = $x->value;
			}
		}

		// ATTACHMENT
		// Any part with a filename is an attachment,
		// so an attached text file (type 0) is not mistaken as the message.
		if ($params['filename'] || $params['name']) {
			$filename = ($params['filename'])? $params['filename'] : $params['name'];
			if($withAttachmentsBody){
				// filename may be given as 'Filename' or 'Name' or both
				// filename may be encoded, so see imap_mime_header_decode()
				$ret['attachments'][$filename] = $data;  // this is a problem if two files have same name
			}else{
				if ($p->bytes){
					$size=$p->bytes;
				}else{
					$size=0;
				}
				$partData = array(
						'filename'	=> $filename,  // this is a problem if two files have same name
						'hfilename'	=> $this->imapProxy->decodeMimeStr($filename),  // this is a problem if two files have same name
						'size'		=> $size,
						'partno'	=> $partno,
						'type'		=> '',
						'id'		=> array_key_exists_assign_default('id',$params,'-')
				);
				$ret['attachments'][] =$partData;
			}
		}

		// TEXT
		if ($p->type==0 && $data) {
			// Messages may be split in different parts because of inline attachments,
			// so append parts together with blank row.
			if (strtolower($p->subtype)=='plain'){
				$ret['plainmsg'] .= trim($data) ."\n\n";
			}else{
				$ret['htmlmsg'] .= $data ."<br><br>";
			}
			$ret['charset'] = $params['charset'];  // assume all parts are same charset
		}
		// EMBEDDED MESSAGE
		// Many bounce notifications embed the original message as type 2,
		// but AOL uses type 1 (multipart), which is not handled here.
		// There are no PHP functions to parse embedded messages,
		// so this just appends the raw source to the main message.
		elseif ($p->type==2 && $data) {
			$ret['plainmsg'] .= $data."\n\n";
		}

		// SUBPART RECURSION
		if ($p->parts) {
			foreach ($p->parts as $partno0=>$p2){
				$this->getMimePart($mid,$p2,$partno.'.'.($partno0+1),$ret,$withAttachmentsBody);  // 1.2, 1.2.1, etc.
			}
		}
	}

	/**
	 *
	 * @param unknown $folder
	 * @param unknown $name
	 */
	public function personalizeFolderIcon(&$folder,$name){
		foreach(self::$icons as $preg=>$icon){
			if(preg_match('/'.$preg.'/i',$name)){
				$folder['cls'] .=' x-tree-'.$icon;
				$folder['rawCls'] =$icon;
			}
		}
	}

	public function getAttachementURLLink($o,$partno){
		return sprintf('proxy.php?exw_action=local.mailboxImap.getMessageAttachment&account=%s&folder=%s&message_no=%s&partno=%s',
			$o['account'],
			$o['folder'],
			$o['message_no'],
			$partno
		);
	}

	/**
	 *
	 */
	public function sortNaturalMailFolders($a, $b) {
		$aid =$a['text'];
		$bid =$b['text'];
		if ($aid == $bid) {
			return 0;
		}
		foreach(array('INBOX','SENT','TRASH','DRAFTS','CALENDAR','TASKS') as $prio){
			if(strtoupper($aid)==$prio){
				return -1;
			}
			if(strtoupper($bid)==$prio){
				return 1;
			}
		}
		return ($aid < $bid) ? -1 : 1;
	}
}