<?php
namespace qd\mail\mua\imapConnector;

class QDImap_HORDE extends QDImap{
	static $staticInit			= false;
	static $oFetchQueryHeader	= null;
	static $oFetchQueryOverview	= null;
	static $oFetchQueryBody		= null;
	static $oFetchQueryStructure= null;
	var $internalClass			= 'Horde_Imap_Client_Socket';
	var $imap_order				= array(
		'date'		=> Horde_Imap_Client::SORT_DATE,
		'arrival'	=> Horde_Imap_Client::SORT_ARRIVAL,
		'from'		=> Horde_Imap_Client::SORT_FROM,
		'subject'	=> Horde_Imap_Client::SORT_SUBJECT,
		'size'		=> Horde_Imap_Client::SORT_SIZE
	);

	/**
	 * @var Horde_Imap_Client_Socket imap_imp
	 */
	var $imap_imp				;
	var $cacheEnabled			= false;

	function init(){
		if (!self::$staticInit){
			self::$oFetchQueryHeader= new Horde_Imap_Client_Fetch_Query();
			self::$oFetchQueryHeader->headerText(array('peek'	=> true));

			self::$oFetchQueryOverview= new Horde_Imap_Client_Fetch_Query();
			self::$oFetchQueryOverview->envelope(array('peek'	=> true));
			self::$oFetchQueryOverview->size();
			self::$oFetchQueryOverview->flags();

			self::$oFetchQueryBody= new Horde_Imap_Client_Fetch_Query();
			self::$oFetchQueryBody->envelope();
			self::$oFetchQueryBody->size();
			self::$oFetchQueryBody->flags();
			self::$oFetchQueryBody->bodyText();
			self::$oFetchQueryBody->fullText();

			self::$oFetchQueryStructure= new Horde_Imap_Client_Fetch_Query();
			self::$oFetchQueryStructure->structure();

			self::$staticInit=true;
		}
	}

	function getmailboxes ($filter='*'){
		$aTmp=$this->imap_imp->listMailboxes($filter,Horde_Imap_Client::MBOX_ALL,array('delimiter'=>'.'));
		$aResult = array();
		foreach($aTmp as $k=>$v){
			$f = new stdClass();
			$f->delimiter='.';
			$f->name=$k;
			$aResult[]=$f;
		}
		return $aResult;
	}

	function __destruct (){
		if ($this->imap_imp){
			$this->imap_imp->close(array(
				'expunge'=>true
			));
		}
	}

	function open ($subFolder='INBOX'){
		$className					= $this->internalClass;
		$this->currentFolder		= $subFolder;
		$this->currentFolder64		= base64_encode($subFolder);
		//$this->imap_imp = new Horde_Imap_Client_Socket(array(
		$this->imap_imp = new $className(array(
			'username'	=> $this->accounts[$this->account]['user'],
			'password'	=> $this->accounts[$this->account]['pass'],
			'hostspec'	=> $this->accounts[$this->account]['host'],
			'port'		=> $this->accounts[$this->account]['port'],
			'secure'	=> $this->accounts[$this->account]['secure'],

			// OPTIONAL Debugging. Will output IMAP log to the /tmp/foo file
			'debug' => '/tmp/foo',
			'debug_literal' => true,
			// OPTIONAL Caching. Will use cache files in /tmp/hordecache.
			// Requires the Horde/Cache package, an optional dependency to
			// Horde/Imap_Client.
			'cache' => array(
				'backend' => new Horde_Imap_Client_Cache_Backend_Cache(array(
					'cacheob' => new Horde_Cache(new Horde_Cache_Storage_File(array(
						'dir' => '/tmp/hordecache'
					)))
				))
			)
		));
		$this->imap_imp->openMailbox($this->currentFolder);
		$this->currentFolderStatus	= $this->status($this->currentFolder);
	}

	function getacl ($mailbox){
		//return imap_getacl($this->imap_imp, $mailbox);
	}

	function isConnected(){
		return ($this->imap_imp)?true:false;;
	}

	function search ($query,$options=array()){
		return $this->imap_imp->search($this->currentFolder,$query,$options);
	}

	function renamemailbox($old,$new){
		$this->imap_imp->renameMailbox($old, $new);
	}

	function createmailbox($folder){
		$this->imap_imp->createMailbox($folder);
	}

	function deletemailbox($folder){
		$this->imap_imp->deleteMailbox($folder);
	}

	function status ($mailbox,$options=Horde_Imap_Client::STATUS_ALL){
		try{
			return $this->imap_imp->status($mailbox,$options);
		}catch(Horde_Imap_Client_Exception_ServerResponse $e){
			fb($e);
		}
	}

	function sort ($sort,$dir){
		/*if ($dir == 'DESC'){
			$sortParam[]= Horde_Imap_Client::SORT_REVERSE;
		}*/
		$sortParam[] = $this->imap_order[$sort];
		try{
			$aTmp = $this->imap_imp->search($this->currentFolder,new Horde_Imap_Client_Search_Query(array('peek'	=> true)),array('sort'=>$sortParam));
			if ($dir == 'DESC'){
				return array_reverse($aTmp['match']->ids);
			}else{
				return $aTmp['match']->ids;
			}
		}catch(Exception $e){
			fb($e);
		}
	}

	function thread (){
		return $this->imap_imp->thread($this->currentFolder);
	}

	function num_msg (){
		$a= $this->imap_imp->status($this->currentFolder,Horde_Imap_Client::STATUS_MESSAGES);
		return $a['messages'];
	}

	function uid ($message_no){
		return $message_no;
	}

	function msgno ($message_no){
		return $message_no;
	}

	function fetch_overview ($sequence,$uid=true){
		try{
			$a = $this->imap_imp->fetch($this->currentFolder,self::$oFetchQueryOverview,array(
				'ids'	=> new Horde_Imap_Client_Ids($sequence)
			));
			return $a;
		}catch(Exception $e){
			db($e);
		}
	}

	function fetchheader ($message_no){
		try{
			return $this->imap_imp->fetch($this->currentFolder,self::$oFetchQueryHeader,array(
				'ids'	=> new Horde_Imap_Client_Ids($message_no)
			))
			->get($message_no)
			->getHeaderText();
		}catch(Exception $e){
			db($e);
		}
	}

	function fetchbody ($message_no,$partno){
		$file = $this->getCacheFileName(__FUNCTION__,$message_no,$partno);
		if($this->cacheEnabled && file_exists($file)){
			return json_decode(file_get_contents($file));
		}else{
			$oQuery = new Horde_Imap_Client_Fetch_Query();
			$oQuery->structure();
			$oQuery->bodyPart($partno, array(
				'decode'	=> true,
				'peek'		=> true
			));
			$oQuery->fullText(array(
				'peek' => true
			));

			$message = $this->imap_imp->fetch($this->currentFolder, $oQuery, array(
				'ids' => new Horde_Imap_Client_Ids($message_no)
			));
			$message = $message[$message_no];
			$part = $message->getStructure();
			$body = $part->getPart($partno);
			$tmp = $message->getBodyPart($partno);
			if (!$message->getBodyPartDecode($partno)) {
				$body->setContents($tmp);
				$tmp = $body->getContents();
			}

			if($tmp){
				file_put_contents($file,json_encode($tmp));
			}
			return $tmp;
		}
	}

	/*function body($message_no){
		$file = $this->getCacheFileName(__FUNCTION__,$message_no);
		if($this->cacheEnabled && file_exists($file)){
			return json_decode(file_get_contents($file));
		}else{
			$tmp = imap_body($this->imap_imp,$message_no,FT_UID);

			if($tmp){
				file_put_contents($file,json_encode($tmp));
			}
			return $tmp;
		}
	}*/

	function fetchstructure ($message_no){
		$file = $this->getCacheFileName(__FUNCTION__,$message_no,'struct');
		if($this->cacheEnabled && file_exists($file)){
			return json_decode(file_get_contents($file));
		}else{
			$tmp = $this->imap_imp->fetch($this->currentFolder,self::$oFetchQueryStructure,array(
				'ids'	=> new Horde_Imap_Client_Ids($message_no)
			))->get($message_no)->getStructure();
			if($tmp){
				file_put_contents($file,json_encode($tmp));
			}
			return $tmp;
		}
	}

	function getMessageContent($message_no){
		//header('content-type: text/html; charset=utf-8');
		$rtn = array();

		$head	= $this->getHeader($message_no,true);

		$this->parseRecipient($head, 'From');
		$this->parseRecipient($head, 'To');
		$this->parseRecipient($head, 'Cc');

		if(array_key_exists('Subject', $head)){
			$head['Subject'][0] = $this->decodeMimeStr($head['Subject'][0]);
		}

		$outStruct	= $this->getMimeFlatStruct($message_no);

		$attachments= array();

		$type		= 'unknown';
		$charset	= 'unknown';

		$body_id = $outStruct['object']->findBody('html');
		if (is_null($body_id)) {
			$body_id = $outStruct['object']->findBody();
		}
		$data	= $this->fetchbody($message_no,$body_id);
		$type	= $outStruct['flat'][$body_id]['subtype'];
		$charset= $outStruct['flat'][$body_id]['charset'];

		foreach($outStruct['flat'] as $partno=>$part){
			if($part['type']!='text'){
				$filename = $part['name'];
				if($filename){
					if ($part['bytes']){
						$size=$part['bytes'];
					}else{
						$size=0;
					}
					$id='-';
					if(array_key_exists('id',$part)){
						if(preg_match('!^<(.*)>$!',$part['id'],$m)){
							$id = $m[1];
						}else{
							$id = $part['id'];
						}
					}
					$attachments[] = array(
						'filename'		=> $filename									,	// this is a problem if two files have same name
						'hfilename'		=> $this->decodeMimeStr($filename)	,	// this is a problem if two files have same name
						'size'			=> $size										,
						'partno'		=> $partno										,
						'type'			=> $part['subtype']								,
						'id'			=> $id											,
					);
				}
			}
		}
		foreach($attachments as &$f){
			if($f['filename']){
				$f['type']=strtolower(pathinfo($f['filename'],PATHINFO_EXTENSION));
			}
		}
		$data = mimeDecoder::decode($type,$data,$charset,$rtn,$attachments,$head,$outStruct['flat']);

		$rtn ['header'		]= $head;
		$rtn ['rawheader'	]= $head['--rawheader'];
		$rtn ['type'		]= $type;
		$rtn ['body'		]= $data;
		$rtn ['attachments'	]= $attachments;
		return $rtn;
	}

	function setflag_full($message_no,$flag){
		//$this->imap_imp->
		//return imap_setflag_full($this->imap_imp,$message_no,$flag,ST_UID);
	}

	function clearflag_full($message_no,$flag){
		//return imap_clearflag_full($this->imap_imp,$message_no,$flag,ST_UID);
	}

	function expunge(){
		return $this->imap_imp->expunge($this->currentFolder,array(
			'delete'	=> true
		));
	}

	function mail_copy($sequence,$dest){
		return $this->imap_imp->copy($this->currentFolder,$dest, array(
			'ids'	=> new Horde_Imap_Client_Ids($sequence)
		));
	}

	function mail_move($sequence,$dest){
		//db($this->currentFolder.$dest.$sequence);die();
		return $this->imap_imp->copy($this->currentFolder,$dest, array(
			'ids'	=> new Horde_Imap_Client_Ids($sequence),
			'move'	=> true
		));
	}

	function append($folder, $mail_string,$flag){
		$text = Horde_Mime_Part::parseMessage($mail_string);
		return $this->imap_imp->append($folder,array(
			array(
				'data'	=> $mail_string,
				'flags'	=>  array(
					Horde_Imap_Client::FLAG_SEEN,
					/* RFC 3503 [3.4] - MUST set MDNSent flag on draft message. */
					//Horde_Imap_Client::FLAG_MDNSENT
				)
			)),array('create' => false)
		);
	}

	function fetch_overviewWithCache($aID,$o){
		//fb($aID);
		$aMsgs	= $this->fetch_overview($aID);
		$aRet	= array();
		$aMID	= array();
		if ($aMsgs) {
			foreach ($aMsgs as $msg) {
				$oEnvelope=$msg->getEnvelope();
				$oMsg = new stdClass();
				$oFlags=$msg->getFlags();
				$oMsg->message_id = $oEnvelope->message_id;
				if($oMsg->message_id){
					$oMsg->folder			= $this->currentFolder;
					$oMsg->folder_uuid		= $this->currentFolderStatus['uidvalidity'];
					$oMsg->msgid			= $msg->getUid();
					$oMsg->date				= $oEnvelope->date->format('Y-m-d H:i:s');
					$oMsg->account			= $this->account;
					$oMsg->folder			= $o['folder'];

					$oMsg->subject			= $oEnvelope->subject;
					$oMsg->from				= $oEnvelope->from->writeAddress();
					$oMsg->to				= $oEnvelope->to->writeAddress();
					$oMsg->size				= $msg->getSize();
					$oMsg->uid				= $msg->getUid();
					$oMsg->msgno			= 0;
					$oMsg->recent			= in_array('recent'		,$msg->getFlags())?1:0;
					$oMsg->flagged			= in_array('flagged'	,$msg->getFlags())?1:0;
					$oMsg->answered			= in_array('answered'	,$msg->getFlags())?1:0;
					$oMsg->deleted			= in_array('deleted'	,$msg->getFlags())?1:0;
					$oMsg->seen				= in_array('\seen'		,$msg->getFlags())?1:0;
					$oMsg->draft			= in_array('draft'		,$msg->getFlags())?1:0;
					$oMsg->udate			= strtotime($msg->getImapDate());

					$aMID[]					= $oMsg->msgid;
					$aRet[]					= $oMsg;
				}
			}
			if(count($aMID)>0){
				$aMMGCache = $this->getMMGCache(base64_encode($this->currentFolder),$this->currentFolderStatus->uidvalidity,$aMID);
				foreach($aRet as &$msg){
					$this->getMsgWithCacheSupport($aMMGCache,$msg);
				}
			}
		}
		return $aRet;
	}

	function getFromId(){
		$query = new Horde_Imap_Client_Search_Query();
		// 604800 = 60 seconds * 60 minutes * 24 hours * 7 days (1 week)
		$query->intervalSearch(
				604800,
				Horde_Imap_Client_Search_Query::INTERVAL_YOUNGER
		);

		$results = $this->imap_imp->search('INBOX', $query, array());
	}
	/**
	 *
	 * @param unknown $message_no
	 * @return multitype:
	 */
	function getMimeFlatStruct($message_no){
		$struct = $this->fetchstructure($message_no);

		$outStruct = array();
		$foundPart=false;
		foreach ($struct->getParts() as $partno=>$partStruct){
			$foundPart=true;
			$this->subMimeStructToFlatStruct($partStruct,$outStruct);
		}
		if(!$foundPart){
			$this->subMimeStructToFlatStruct($struct,$outStruct);
		}
		return array(
			'flat'	=> $outStruct,
			'object'=> $struct
		);
	}

	/**
	 *
	 * @param unknown $struct
	 * @param unknown $partno
	 * @param unknown $outStruct
	 */
	function subMimeStructToFlatStruct(Horde_Mime_Part $struct,&$outStruct){
		$partno = $struct->getMimeId();
		$outStruct[$partno] = array();
		$outStruct[$partno]['type'		]=$struct->getType(false);
		$outStruct[$partno]['subtype'	]=$struct->getSubType();
		$outStruct[$partno]['content'	]=$struct->getContents(array('stream'=>false));
		if($v=$struct->getCharset()){
			$outStruct[$partno]['charset'	]=$v;
		}
		if($v=$struct->getName(false)){
			$outStruct[$partno]['name'		]=$v;
		}
		if($v=$struct->getSize(false)){
			$outStruct[$partno]['bytes'		]=$v;
		}
		if($v=$struct->getContentId()){
			$outStruct[$partno]['id'		]=$v;
		}

		foreach ($struct->getParts() as $sStruct){
			$this->subMimeStructToFlatStruct($sStruct,$outStruct);
		}
	}
	function logout(){
		$this->imap_imp->logout();
	}
}