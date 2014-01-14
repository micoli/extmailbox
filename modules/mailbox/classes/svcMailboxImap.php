<?php
/*
 *imap_reopen  !!
 *msgno ft_uid
 */
class svcMailboxImap{
	var $imapProxy;

	var $icons = array(
		'^inbox$'		=>'mail_inbox',
		'^envoy'		=>'mail_open_send',
		'^sent$'		=>'mail_open_send',
		'^trash$'		=>'mail_trash',
		'^corbeille$'	=>'mail_trash',
	);

	public function __construct(){
		$this->imapProxy = new imapProxy($GLOBALS['conf']['imapMailBox']['accounts']);
		$this->imapProxy->setCache($GLOBALS['conf']['imapMailBox']['tmp']);
	}

	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getAccounts($o){
		$tmp = array();
		foreach($this->imapProxy->accounts as $k=>$v){
			$tmp[]=array(
				'account'	=> $k,
				'email'		=> $v['email']
			);
		}
		return array(
			'data'=>$tmp
		);
	}

	/**
	 *
	 * @param unknown $o
	 */
	function pub_getTemplates($o){
		$res=array('data'=>array());
		foreach(glob(dirname(__FILE__).'/mailTemplates/*.html') as $template){
			$res['data'][]=array(
					'name'	=> str_replace('.html','',basename($template)),
					'body'	=> file_get_contents($template)
			);
		}
		return $res;
	}

	/**
	 *
	 * @param unknown $o
	 */
	function pub_setMessageFlag($o){
		$o['folder'] = base64_decode($o['folder']);
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open($o['folder']);
		if(!$this->imapProxy->isConnected()){
			return $res;
		}
		if($o['value']==1){
			$this->imapProxy->setflag_full	($o['message_no'],"\\".$o['flag']);
		}else{
			$this->imapProxy->clearflag_full($o['message_no'],"\\".$o['flag']);
		}
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:number unknown
	 */
	function pub_searchContact($o){
		$QDDb = new QDDB();
		if(array_key_exists('query',$o)){
			$arr = $QDDb->query2Array(sprintf('select * from imail.PRS_PERSONAL where email like "%%%s%%" or personal like "%%%s%%"  ',$o['query'],$o['query']));
		}else{
			$sql = 'select * from imail.PRS_PERSONAL where true ';
			if(array_key_exists('personal',$o)){
				$sql.=sprintf(' and personal like "%%%s%%"',$o['personal']);
			}
			if(array_key_exists('email',$o)){
				$sql.=sprintf(' and email like "%%%s%%"',$o['email']);
			}
			$arr = $QDDb->query2Array($sql);
		}
		return array(
				'data'			=> $arr,
				'totalCount'	=> count($arr)
		);
	}

	public function pub_folderRename($o){
		header('content-type: text/html; charset=utf-8');
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open();
		if(!$this->imapProxy->isConnected()){
			return $res;
		}
		$this->imapProxy->renamemailbox(
			base64_decode($o['parentFolder']).'.'.base64_decode($o['oldName']),
			base64_decode($o['parentFolder']).'.'.base64_decode($o['newName'])
		);
		return array('ok'=>true);
	}

	public function pub_createSubFolder($o){
		header('content-type: text/html; charset=utf-8');
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open();
		if(!$this->imapProxy->isConnected()){
			return $res;
		}
		$this->imapProxy->createmailbox(base64_decode($o['parentFolder']).'.'.base64_decode($o['subFolder']));
		return array('ok'=>true);
	}

	public function pub_deleteFolder($o){
		header('content-type: text/html; charset=utf-8');
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open();
		if(!$this->imapProxy->isConnected()){
			return $res;
		}
		$this->imapProxy->deletemailbox(base64_decode($o['folder']));
		return array('ok'=>true);
		//name
	}
	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getAccountFolders($o){
		header('content-type: text/html; charset=utf-8');
		$res = array(
			'text'			=> $o['account'],
			'uiProvider'	=> 'col',
			'expanded'		=> true,
			'allowDrop'		=> true,
			'allowChildren'	=> true,
			'folderType'	=> 'account'
		);
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open();
		if(!$this->imapProxy->isConnected()){
			return $res;
		}
		$list	= $this->imapProxy->getmailboxes("*");
		if (is_array($list)){
			foreach ($list as $val) {
				$name	= utf8_encode(imap_utf7_decode(str_replace($this->imapProxy->getAccountVar('cnx'),'',$val->name)));
				if(trim($name)!=''){
					$tmpArr	= explode($val->delimiter,$name);
					$tmp	= &$res;
					foreach($tmpArr as $k=>$v){
						$id=implode($val->delimiter,array_slice($tmpArr,0,$k+1));
						if(!array_key_exists('children',$tmp)){
							$tmp['children']=array();
						}
						$subId=$id;
						if(!(array_key_exists($subId,$tmp['children']))){
							//db($subId);
							//db($this->imapProxy->getacl($subId));
							$tmp['children'][$subId]=array(
								'text'			=> $v,
								'id'			=> base64_encode($id),
								'fid'			=> $id,
								'uiProvider'	=> 'col',
								'cls'			=> ' x-tree-node-collapsed x-tree-node-icon ',
								'nb'			=> 0,//imap_num_msg ($currMbox)
								'allowDrop'		=> true,
								'stat'			=> $this->imapProxy->status($this->imapProxy->getAccountVar('cnx').$subId),
								'folderType'	=> 'folder'
								//'acl'			=> $this->imapProxy->getacl($subId)
								//'allowChildren'	=> true
							);
							if($v=='Trash----'){
								$tmp['children'][$subId]['text'].=$tmp['children'][$subId]['id'];
								db($tmp['children'][$subId]);
								db(json_encode($tmp['children'][$subId]));
							}
							$this->personalizeFolderIcon($tmp['children'][$subId],strtolower($v));
						}
						$tmp=&$tmp['children'][$subId];
					}
				}
			}
			uasort($res['children'],array($this,'sortNaturalMailFolders'));
		} else {
			echo "imap_getmailboxes failed : " . imap_last_error() . "\n";
		}
		$this->flatAssocChildren($res);
		//db($res);
		return array($res);
	}

	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getMailListInFolders($o){
		$t1 = microtime(true);
		$res = array();
		$folder=base64_decode($o['folder']);
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open($folder);
		if(!$this->imapProxy->isConnected()){
			return $res;
		}

		//db(imap_thread($this->imapProxy->imapStream));
		header('content-type: text/html; charset=utf-8');
		$query = array_key_exists_assign_default('query',$o,false);
		if($query){
			//$query	= sprintf('TEXT "%s"',addslashes($query));
			$aID	= $this->imapProxy->search($query);
			$num	= count($aID);
		}else{
			$aID	= $this->imapProxy->sort(array_key_exists_assign_default('sort', $o, 'date'),array_key_exists_assign_default('dir', $o, 'DESC'));
			$num	= $this->imapProxy->num_msg();
		}
		if($num==0 || !$aID){
			return array('data'=>array(),'totalCount'=>0);
		}
		$nStart	= array_key_exists_assign_default('start'	,$o, 0);
		$nCnt	= array_key_exists_assign_default('limit'	,$o,25);
		if (($nStart+$nCnt) > $num) {
			$nCnt = $num-$nStart;
		}
		//$aID	= array_slice($aID,$nStart,($nStart+$nCnt-1));
		$aID	= array_slice($aID,$nStart,$nCnt);
		$aMsgs	= $this->imapProxy->fetch_overview(implode(',',$aID));
		$aRet	= array();
		if ($aMsgs) {
			$aMID = array();
			foreach ($aMsgs as $msg) {
				if($msg->message_id){
					//$aMID[]					= $msg->message_id;
					$msg->msgid				= $folder.'/'.$msg->uid;
					$aMID[]					= $msg->msgid;
					$msg->date				= date('Y-m-d H:i:s',strtotime($msg->date));
					$msg->account			= $o['account'];
					$msg->folder			= $o['folder'];
					//$aRet[$msg->message_id]	= $msg;
					$aRet[]	= $msg;
				}
			}
			$aMMGCache = $this->getMMGCache($aMID);
			foreach($aRet as &$msg){
				$this->getMsgWithCacheSupport($aMMGCache,$msg);
			}
		}
		if(array_key_exists_assign_default('dir', $o, 'DESC')=='DESC'){
			$aRet = array_reverse($aRet);
		}
		//print (microtime(true)-$t1);
		$a= array('data'=>array_values($aRet),'totalCount'=>$num,'s'=>$nStart,'m'=>($nStart+$nCnt-1));
		return $a;
	}

	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_todo_getMailThreadsInFolders($o){
		$t1 = microtime(true);
		$res = array();
		$folder=base64_decode($o['folder']);
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open($folder);
		if(!$this->imapProxy->isConnected()){
			return $res;
		}

		//db(imap_thread($this->imapProxy->imapStream));
		header('content-type: text/html; charset=utf-8');
		//$aID	= $this->imapProxy->sort(array_key_exists_assign_default('sort', $o, 'date'),array_key_exists_assign_default('dir', $o, 'DESC'));
		//$num	= $this->imapProxy->num_msg();


		$threads = $rootValues = array();
		$thread = $this->imapProxy->thread();
		$root = 0;
		//first we find the root (or parent) value for each email in the thread
		//we ignore emails that have no root value except those that are infact
		//the root of a thread

		//we want to gather the message IDs in a way where we can get the details of
		//all emails on one call rather than individual calls ( for performance )

		//foreach thread
		foreach ($thread as $i => $messageId) {
			//get sequence and type
			list($sequence, $type) = explode('.', $i);

			//if type is not num or messageId is 0 or (start of a new thread and no next) or is already set
			if($type != 'num' || $messageId == 0
					|| ($root == 0 && $thread[$sequence.'.next'] == 0)
					|| isset($rootValues[$messageId])) {
				//ignore it
				continue;
			}

			//if this is the start of a new thread
			if($root == 0) {
				//set root
				$root = $messageId;
			}

			//at this point this will be part of a thread
			//let's remember the root for this email
			$rootValues[$messageId] = $root;

			//if there is no next
			if($thread[$sequence.'.next'] == 0) {
			//reset root
				$root = 0;
			}
		}

		//now get all the emails details in rootValues in one call
		//because one call for 1000 rows to a server is better
		//than calling the server 1000 times
		$emails = imap_fetch_overview($imap, implode(',', array_keys($rootValues)));



		if($num==0 || !$aID){
			return array('data'=>array(),'totalCount'=>0);
		}


		//there is no need to sort, the threads will automagically in chronological order
		echo '<pre>'.print_r($threads, true).'</pre>';

		foreach ($emails as $msg) {
			if($msg->message_id){
				$aMID = array();
				$msg->msgid				= $folder.'/'.$msg->uid;
				$aMID[]					= $msg->msgid;
				$msg->date				= date('Y-m-d H:i:s',strtotime($msg->date));
				$msg->account			= $o['account'];
				$msg->folder			= $o['folder'];
				$aMMGCache = $this->getMMGCache($aMID);
				$this->getMsgWithCacheSupport($aMMGCache,$msg);
			}
			$root = $rootValues[$msg->msgno];
			$threads[$root][] = $msg;
		}
		db($threads);
		//$aMsgs	= $this->imapProxy->fetch_overview(implode(',',array_keys($rootValues)));
		//print (microtime(true)-$t1);
		$a= array('data'=>array_values($threads),'totalCount'=>$num,'s'=>$nStart,'m'=>($nStart+$nCnt-1));
		return $a;
	}


	/**
	 *
	 * @param unknown $aMMGCache
	 * @param unknown $msg
	 */
	function getMsgWithCacheSupport(&$aMMGCache,&$msg){
		if(!array_key_exists($msg->msgid,$aMMGCache)){
			$head		= $this->getHeader($msg->uid);
			$this->parseRecipient($head, 'from');
			$this->parseRecipient($head, 'to');
			$this->parseRecipient($head, 'cc');
			$aMMGCache[$msg->msgid] = array(
				'MMG_MESSAGE_ID'	=>$msg->msgid,
				'MMG_SUBJECT'		=>$this->decodeMimeStr($head['subject'][0]),
				'MMG_FROM'			=>json_encode(array_key_exists_assign_default('from',$head,'')),
				'MMG_TO'			=>json_encode(array_key_exists_assign_default('to'	,$head,'')),
				'MMG_CC'			=>json_encode(array_key_exists_assign_default('cc'	,$head,'')),
				'MMG_REFERENCES'	=>isset($msg->references	)?$msg->references	:'',
				'MMG_IN_REPLY_TO'	=>isset($msg->in_reply_to	)?$msg->in_reply_to	:'',
				'MMG_SIZE'			=>$msg->size,
				'MMG_RAWHEADER'		=>json_encode($head),
			);
			$this->putMMGCache($aMMGCache[$msg->msgid]);
		}
		$rawHeader = json_decode($aMMGCache[$msg->msgid]['MMG_RAWHEADER']);
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
		$msg->subject	= $aMMGCache[$msg->msgid]['MMG_SUBJECT'];
		$msg->from		= json_decode($aMMGCache[$msg->msgid]['MMG_FROM'	]);
		$msg->to		= json_decode($aMMGCache[$msg->msgid]['MMG_TO'		]);
		$msg->cc		= json_decode($aMMGCache[$msg->msgid]['MMG_CC'		]);
	}

	/**
	 *
	 * @param unknown $mid
	 * @param unknown $fields
	 */
	function putMMGCache($fields){
		$QDDb = new QDDB();
		$QDDb->dbInsert("imail.MMG_MAIL_MESSAGE", array_keys($fields),array_values($fields));
	}

	/**
	 *
	 * @param unknown $aMID
	 * @return Ambigous <boolean, multitype:Ambigous <boolean, multitype:, number> >
	 */
	function getMMGCache($aMID){
		$QDDb = new QDDB();
		$arr = $QDDb->query2ArrayUnikKey(sprintf('
			select *
			from imail.MMG_MAIL_MESSAGE
			where MMG_MESSAGE_ID in ("%s")',
			implode('","',$aMID)
			),
			'MMG_MESSAGE_ID');
		return $arr;
	}
	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getMessageSource($o){
		header('content-type: text/html; charset=utf-8');

		$folder		= base64_decode($o['folder']);;
		$message_no	= $o['message_no'];

		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open($folder);

		if(!$this->imapProxy->isConnected()){
			return $res;
		}
		$data = $this->imapProxy->body($message_no);
		return array('source'=>$data);
	}

	public function pub_getMessageContent($o){
		header('content-type: text/html; charset=utf-8');

		$folder		= base64_decode($o['folder']);;
		$message_id	= $o['message_id'];
		$message_no	= $o['message_no'];

		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open($folder);

		if(!$this->imapProxy->isConnected()){
			return $res;
		}
		//$message_no	= $this->imapProxy->msgno($message_no);
		//$struct		= $this->getMimeMsg($mbox, $message_no,false);
		$head		= $this->getHeader($message_no,true);
		$this->parseRecipient($head, 'From');
		$this->parseRecipient($head, 'To');
		$this->parseRecipient($head, 'Cc');
		if(array_key_exists('Subject', $head)){
			$head['Subject'][0] = $this->decodeMimeStr($head['Subject'][0]);
		}

		$outStruct	= $this->getMimeFlatStruct($message_no);
		$attachments= array();
		$bodyPartNo	= false;
		$type		= 'unknown';
		$charset	= 'unknown';
//db($outStruct);
		foreach($outStruct as $partno=>$part){
			$part['subtype']=strtoupper($part['subtype']);
			if($part['type']==0){
				$data = $this->imapProxy->fetchbody($message_no,$partno);
				if ($part['encoding']==4){
					$data = quoted_printable_decode($data);
				}elseif ($part['encoding']==3){
					$data = base64_decode($data);
				}elseif ($part['encoding']==2){
					$data = imap_binary($data);
				}elseif ($part['encoding']==1){
					$data = imap_8bit($data);
				}
				//db('--');
				//db($part);
				//db($part['subtype']);
				//db($data);
				if($data){
					if($part['subtype']=='PLAIN' && !$bodyPartNo){
						$type		= 'plain';
						$bodyPartNo	= $partno;
						$charset	= array_key_exists_assign_default('charset',$part,'unknown');
					}elseif($part['subtype']=='HTML'){
						$type		= 'html';
						$bodyPartNo	= $partno;
						$charset	= array_key_exists_assign_default('charset',$part,'unknown');
					}elseif($part['subtype']=='CALENDAR'){
						$type		= 'calendar';
						$bodyPartNo	= $partno;
						$charset	= array_key_exists_assign_default('charset',$part,'unknown');
					}
				}
			}else{
				$filename = ($part['params']['filename'])? $part['params']['filename'] : $part['params']['name'];
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
							'filename'	=> $filename,  // this is a problem if two files have same name
							'hfilename'	=> $this->decodeMimeStr($filename),  // this is a problem if two files have same name
							'size'		=> $size,
							'partno'	=> $partno,
							'type'		=> $part['subtype'],
							'id'		=> $id
					);
				}
			}
		}
		foreach($attachments as &$f){
			$f['attachUrlLink']=$this->getAttachementURLLink($o,$f['partno']);
			if($f['filename']){
				$f['type']=strtolower(pathinfo($f['filename'],PATHINFO_EXTENSION));
			}
		}
		if(count($attachments)>=2){
			$attachments[]=array(
				'filename'		=> 'all',
				'hfilename'		=> 'all',
				'type'			=> 'zip',
				'size'			=> 1,
				'partno'		=> -1,
				'attachUrlLink'	=> $this->getAttachementURLLink($o,-1 )
			);

		}
		$rtn = array();
		$body = mimeDecoder::decode($type,$data,$charset,$rtn,$attachments,$head,$outStruct);

		//print $body;
		$rtn ['header'		]= $head;
		$rtn ['rawheader'	]= $head['--rawheader'];
		$rtn ['type'		]= $type;
		$rtn ['body'		]= $body;
		$rtn ['attachments'	]= $attachments;
		//print_r($rtn);
		return $rtn;
	}

	function pub_expunge($o){
		header('content-type: text/html; charset=utf-8');
		$folder	= base64_decode($o['folder']);

		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open($fromFolder);
		$this->imapProxy->expunge();
		return array('ok'=> true);
	}

	function pub_mailCopyMove($o){
		header('content-type: text/html; charset=utf-8');
		$fromFolder	= base64_decode($o['fromFolder']);
		$toFolder	= base64_decode($o['toFolder'  ]);

		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open($fromFolder);

		if(!$this->imapProxy->isConnected()){
			return $res;
		}
		$ids = explode(',',$o['messages_no']);
		asort($ids);
		imap_errors();
		switch (strtolower($o['mode'])){
			case 'copy':
				$ok = $this->imapProxy->mail_copy(implode(',',$ids),$toFolder);
			break;
			case 'move':
				$ok = $this->imapProxy->mail_move(implode(',',$ids),$toFolder);
			break;
		}

		if(!$ok){
			return array('ok'=>0,'errors'=>join("\n",imap_errors()));
		}else{
			$this->imapProxy->expunge();
			return array('ok'=>count($ids));
		}
	}

	/**
	 *
	 * @param unknown $message_no
	 * @return Ambigous <multitype:multitype: , string>
	 */
	private function getHeader($message_no,$withRawheader=false){
		$rawHeader	= $this->imapProxy->fetchheader($message_no);
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

	private function getAttachementURLLink($o,$partno){
		return sprintf('proxy.php?exw_action=local.mailboxImap.getMessageAttachment&account=%s&folder=%s&message_no=%s&partno=%s',
			$o['account'],
			$o['folder'],
			$o['message_no'],
			$partno
		);
	}

	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_getMessageAttachment($o){
		$folder		= base64_decode($o['folder']);;
		$message_no	= $o['message_no'];

		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open($folder);
		if(!$this->imapProxy->isConnected()){
			return array('error'=>true);
		}

		$o['filename']	= base64_decode($o['filename']);
		//$message_no		= $this->imapProxy->msgno($message_no);
		$outStruct		= $this->getMimeFlatStruct($message_no);
		if($o['partno']==-1){
			$tmpName = tempnam(sys_get_temp_dir(),'zip')."_folder.zip";
			$archive = new PclZip($tmpName);
			$archDatas = array();
			foreach($outStruct as $partno=>$part){
				if($filename=$this->getPartFilename($part)){
					$data = $this->imapProxy->fetchbody($message_no,$partno);
					if ($part['encoding']==4){
						$data = quoted_printable_decode($data);
					}elseif ($part['encoding']==3){
						$data = base64_decode($data);
					}elseif ($part['encoding']==2){
						$data = imap_binary($data);
					}elseif ($part['encoding']==1){
						$data = imap_8bit($data);
					}

					$archDatas[]=array(
						PCLZIP_ATT_FILE_NAME	=> $filename,
						PCLZIP_ATT_FILE_CONTENT	=> $data
					);
				}
			}
			$list = $archive->create($archDatas);
			if ($list == 0) {
				die("ERROR : '".$archive->errorInfo(true)."'");
			}
			header('Content-type: application/zip');
			$this->headerForDownload("folder.zip",filesize($tmpName));
			print file_get_contents($tmpName);
			unlink($tmpName);
			die();
		} else {
			$part			= $outStruct[$o['partno']];
			$filename		= $this->getPartFilename($part);

			$data = $this->imapProxy->fetchbody($message_no,$o['partno']);
			if ($part['encoding']==4){
				$data = quoted_printable_decode($data);
			}elseif ($part['encoding']==3){
				$data = base64_decode($data);
			}elseif ($part['encoding']==2){
				$data = imap_binary($data);
			}elseif ($part['encoding']==1){
				$data = imap_8bit($data);
			}


			if(false){
				header('content-type: text/html; charset=utf-8');
				db($filename);
				db($part);
				db($outStruct);
				db(urlencode($this->decodeMimeStr($filename)));
				db($data);
				die();
			}
			if(array_key_exists_assign_default('onlyView',$o,false)){
				$this->headerForView($filename,$part['bytes']);
			}else{
				$this->headerForDownload($filename,$part['bytes']);
			}
			print $data;
			die();
		}
	}

	function getPartFilename($part){
		if(	is_array($part) &&
			array_key_exists('params',$part) &&
			is_array($part['params']) &&
			(array_key_exists('name',$part['params']) || array_key_exists('filename',$part['params']) )
		){
			return ($part['params']['filename'])? $part['params']['filename'] : $part['params']['name'];
		}else{
			return false;
		}
	}

	private function headerForDownload($filename,$size){
		header("Content-Disposition: attachment; filename=" . urlencode($this->decodeMimeStr($filename)));
		header("Cache-Control: no-cache, must-revalidate");
		header("Content-Type: application/force-download");
		header("Content-Type: application/octet-stream");
		header("Content-Type: application/download");
		header("Content-Description: File Transfer");
		header("Content-Length: " . $size);
	}

	private function headerForView($filename,$size){
		//header("Content-Disposition: attachment; filename=" . urlencode($this->decodeMimeStr($filename)));
		header("Content-Type: application/pdf");
		header("Content-Length: " . $size);
	}

	/**
	 *
	 * @param unknown $message_no
	 * @return multitype:
	 */
	function getMimeFlatStruct($message_no){
		$struct = $this->imapProxy->fetchstructure($message_no);
		$outStruct = array();
		if($struct->parts){
			foreach ($struct->parts as $partno=>$partStruct){
				$this->subMimeStructToFlatStruct($partStruct,$partno+1,$outStruct);
			}
		}else{
			$this->subMimeStructToFlatStruct($struct,1,$outStruct);
		}
		return $outStruct;
	}

	/**
	 *
	 * @param unknown $struct
	 * @param unknown $partno
	 * @param unknown $outStruct
	 */
	function subMimeStructToFlatStruct($struct,$partno,&$outStruct){
		$outStruct[$partno]=$struct;
		if ($struct->parts) {
			foreach ($struct->parts as $partno0=>$p2){
				$this->subMimeStructToFlatStruct($p2,$partno.'.'.($partno0+1),$outStruct);  // 1.2, 1.2.1, etc.
			}
		}
		$outStruct[$partno]->params = array();

		if ($outStruct[$partno]->parameters){
			foreach ($outStruct[$partno]->parameters as $x){
				$outStruct[$partno]->params[strtolower($x->attribute)] = $x->value;
			}
			unset($outStruct[$partno]->parameters);
		}

		if ($outStruct[$partno]->dparameters){
			foreach ($outStruct[$partno]->dparameters as $x){
				$outStruct[$partno]->params[strtolower($x->attribute)] = $x->value;
			}
			unset($outStruct[$partno]->dparameters);
		}
		unset($outStruct[$partno]->parts);
		$outStruct[$partno] = (array)$outStruct[$partno];
	}

	/**
	 *
	 * @param unknown $folder
	 * @param unknown $name
	 */
	private function personalizeFolderIcon(&$folder,$name){
		foreach($this->icons as $preg=>$icon){
			if(preg_match('/'.$preg.'/i',$name)){
				$folder['cls'] .=' x-tree-'.$icon;
				$folder['rawCls'] =$icon;
			}
		}
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
							'personal'	=> trim(trim(trim(imap_utf8(isset($v->personal)?$v->personal:''), "'"), '"'))
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
						'personal'	=> trim(trim(trim(imap_utf8($v->personal), "'"), '"'))
					));
				}
			}
		}
	}

	/**
	 *
	 * @param unknown $v
	 */
	private function flatAssocChildren(&$v){
		if(is_array($v) && array_key_exists('children',$v)){
			$v['leaf']=false;
			$v['children']=array_values($v['children']);
			foreach($v['children'] as &$vv){
				$this->flatAssocChildren($vv);
			}
		}else{
			$v['leaf']=true;
		}
	}

	/**
	 *
	 */
	function sortNaturalMailFolders($a, $b) {
		$aid =$a['text'];
		$bid =$b['text'];
		if ($aid == $bid) {
			return 0;
		}
		if($bid=='INBOX'){
			return 1;
		}
		return ($aid < $bid) ? -1 : 1;
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
					'hfilename'	=> $this->decodeMimeStr($filename),  // this is a problem if two files have same name
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
}
