<?php
class QDImap_ZIMBRA extends QDImap{
	static $staticInit	= false;
	static $cache		= array();

	var $cacheEnabled	= false;
	var $urlRoot		= '';
	/**
		imapMailBox.json => accounts
		"mail.titi.com"			: {
			"cnx"			: "{127.0.0.1:143/novalidate-cert}",
			"email"			: "toto@titi.com",
			"user"			: "toto@titi.com",
			"pass"			: "pass",
			"host"			: "mail.titi.com",
			"token"			: "0_a56FCDb",
			"zmurl"			: "https://mail.titi.com/service/",
			"port"			: 143,
			"secure"		: false,
			"name"			: "M. Mic Oli",
			"sendFolder"	: "INBOX.Sent",
			"draftFolder"	: "INBOX.Draft",
			"smtp"			: {
				"host"		: "mail.titi.com",
				"port"		: 25,
				"secure"	: false,
				"user"		: "toto@titi.com",
				"pass"		: "pass"
			}
		},
	*/

	var $imap_order		= array(
		'date'				=> 'date',
		'arrival'			=> 'arrival',
		'from'				=> 'from',
		'subject'			=> 'subject',
		'size'				=> 'size'
	);

	function setAccount ($account){
		$this->account = $account;
		$this->urlRoot = $this->accounts[$this->account]['zmurl'];
		$this->imapStream = new ZimbraSoapClient($this->urlRoot.'soap');
		$this->imapStream->auth($this->accounts[$this->account]['token']);
	}

	private function walkMailBoxes($a,&$res,$parent){
		//$aCopy=$a;
		//if(array_key_exists('folder',$a)){
		//	unset($aCopy['folder']);
		//}
		$res=array(
			'text'			=> $a['name'],
			'id'			=> base64_encode(($parent==''?'':$parent.'/').$a['name']),
			'fid'			=> ($parent==''?'':$parent.'/').$a['name'],//$a['id'],
			'iId'			=> $a['id'],
			'uiProvider'	=> 'col',
			'cls'			=> ' x-tree-node-collapsed x-tree-node-icon ',
			'nb'			=> 0,//imap_num_msg ($currMbox)
			'allowDrop'		=> true,
			'stat'			=> array(
				'messages'		=>	$a['n'],
				'unseen'		=>	$a['u']
			),
			'folderType'	=> 'folder',
			'leaf'			=> !array_key_exists('folder',$a)
		);
		self::personalizeFolderIcon($res,strtolower($a['name']));
		if(array_key_exists('folder',$a)){
			$res['children']=array();
			foreach($a['folder'] as $v){
				$children=array();
				$this->walkMailBoxes($v,$children,$res['fid']);
				$res['children'][]=$children;
			}
		}
	}

	function getmailboxes ($filter='*'){
		$res = array();
		$params = array(new SoapVar('<folder path="/"/>', XSD_ANYXML));
		$rawRes = $this->imapStream->call('zimbraMail','GetFolderRequest', $params);

		foreach($rawRes['Body']['GetFolderResponse']['folder']['folder'] as $inFolder){
			$folder=array();
			$this->walkMailBoxes($inFolder,$folder,'');
			$res[]=$folder;
		}
		usort($res,array('QDImap','sortNaturalMailFolders'));
		//$res=array_values($res);
		//db($res);
		return $res;
	}

	function __destruct (){
		if ($this->imapStream){
		}
	}

	function open ($subFolder='INBOX'){
		$className					= $this->internalClass;
		$this->currentFolder		= $subFolder;
		$this->currentFolder64		= base64_encode($subFolder);
	}

	function getacl ($mailbox){
		//return imap_getacl($this->imapStream, $mailbox);
	}

	function isConnected(){
		return ($this->imapStream)?true:false;;
	}

	private function extractRecipients($message){
		$em=array();
		if(array_key_exists('t',$message['e'])){
			$em[$message['e']['t']]=array('name'=>$message['e']['p'],'email'=>$message['e']['a']);
		}else{
			foreach($message['e'] as $m){
				$em[$m['t']]=array('name'=>$m['p'],'email'=>$m['a']);
			}
		}
		return $em;
	}

	function search ($query){
		$sort=akead('sort',$query,'date').ucfirst(strtolower(akead('dir',$query,'desc')));
		$query['query']=str_replace('TEXT "','"',$query['query']);
		$params = array(
			new SoapParam(akead('start',$query,0), 'offset'),
			new SoapParam(akead('limit',$query,25), 'limit'),
			new SoapParam($query['query']	, 'query'),
			new SoapParam($sort				, 'sortBy'),
			new SoapParam(0					, 'fetch'),
			new SoapParam(1					, 'html'),
			new SoapParam('message'			, 'types')
		);

		$res = $this->imapStream->call('zimbraMail','SearchRequest', $params);
		//db($query);
		//db($res);
		$aResult=array();
		foreach($res['Body']['SearchResponse']['m'] as $message){
			$em = $this->extractRecipients($message);
			$aResult[]=array(
				//'message_id'		=> $message['mid']?$message['mid']:$message['id'],
				'message_id'		=> $message['id'],
				'account'			=> $this->account,
				'folder'			=> $o['folder'],
				'subject'			=> $message['su'],
				'from'				=> akead('f',$em,array()),
				'to'				=> akead('t',$em,array()),
				'cc'				=> akead('c',$em,array()),
				'bcc'				=> akead('b',$em,array()),
				'date'				=> date('Y-m-d H:i:s',$message['d']/1000),
				'references'		=> $message[''],
				'in_reply_to'		=> $message['irt'],
				'size'				=> $message['s'],
				'uid'				=> $message['id'],
				'msgno'				=> $message[''],
				'recent'			=> $message[''],
				'flagged'			=> $message['f']!='',
				'flags'				=> array($message['f']),
				'answered'			=> $message[''],
				'deleted'			=> $message[''],
				'seen'				=> strpos('u',$message['f'])===false,
				'draft'				=> $message[''],
				'udate'				=> date('Y-m-d H:i:s',$message['d']/1000),
				'priority'			=> $message[''],
			);
			//urgent (!), low-priority (?), priority (+)
			//db($aResult[count($aResult)-1]);
			//db($message);
		}
		return $aResult;
	}

	private function fetchMessage($msgId){
		if(!array_key_exists($msgId,self::$cache)){
			$params		= array(new SoapVar(array(
				'id'		=> $msgId,
				'max'		=> 250000,
				'html'		=> 1,
				'read'		=> 1,
				'needExp'	=> 1
			),SOAP_ENC_OBJECT,null,null,'m'));

			$res = $this->imapStream->call('zimbraMail','GetMsgRequest', $params);
			$message = $res['Body']['GetMsgResponse']['m'];
			self::$cache[$msgId]['type_'	] = 'unknown';
			self::$cache[$msgId]['charset'	] = 'UTF-8';

			$this->parseMessage($msgId,$message['mp']);

			self::$cache[$msgId]['subject'	] = $message['su'];
			self::$cache[$msgId]['recipient'] = $this->extractRecipients($message);
		}
	}

	function getMessageContent($msgId){
		//header('content-type: text/html; charset=utf-8');
		$this->fetchMessage($msgId);
		$rtn				= array();
		$head				= array();
		$head['Subject'		]= array(self::$cache[$msgId]['subject']);
		$rtn['header'		]= $head;
		$rtn['rawheader'	]= $head['--rawheader'];
		$rtn['type'			]= $type;
		$rtn['attachments'	]= self::$cache[$msgId]['attachments'];
		$rtn['body'			]= mimeDecoder::decode(
			self::$cache[$msgId]['type'],
			self::$cache[$msgId]['body'],
			self::$cache[$msgId]['charset'],
			$rtn,
			self::$cache[$msgId]['attachments'],
			$head,
			self::$cache[$msgId]['flat']
		);
		return $rtn;
	}

	private function parseMessage($msgId,$mp){
		self::$cache[$msgId]['flat'			] = array();
		self::$cache[$msgId]['attachments'	] = array();
		$iterator	= new RecursiveIteratorIterator(new RecursiveArrayIterator(array($mp)), RecursiveIteratorIterator::SELF_FIRST);
		foreach ($iterator as $k => $part) {
			if(is_array($part) && array_key_exists('part',$part)){
				$partno = $part['part'];
				//$p = $part;unset($p['mp']);db($p);
				self::$cache[$msgId]['flat'][$partno] = array();
				self::$cache[$msgId]['flat'][$partno]['type'		]=$part['ct'];
				self::$cache[$msgId]['flat'][$partno]['subtype'		]=array_pop(split('/',$part['ct']));
				if($v=akead('content',$part,false)){
					self::$cache[$msgId]['flat'][$partno]['content'	]=$v;
				}
				if($v=akead('s',$part,false)){
					self::$cache[$msgId]['flat'][$partno]['bytes'	]=$v;
				}
				if($v=akead('filename',$part,false)){
					self::$cache[$msgId]['flat'][$partno]['name'	]=$v;
				}

				if(array_key_exists('filename',$part) || array_key_exists('ci',$part)){
					$id			= $partno;
					$filename	= akead('hfilename',$part,$part['filename']);
					$hfilename	= $this->decodeMimeStr($part['filename']);
					if(array_key_exists('ci',$part) && preg_match('!^<(.*)>$!',$part['ci'],$m)){
						$id			= $m[1];
						$filename	= $m[1];
						$hfilename	= $m[1];
					}
					self::$cache[$msgId]['attachments'][] = array(
						//'type'		=> $part['ct'	],
						'type'			=> strtolower(pathinfo($filename,PATHINFO_EXTENSION)),
						'filename'		=> $filename,
						'hfilename'		=> $hfilename,
						'size'			=> $part['s'	],
						'partno'		=> $part['part'	],
						'id'			=> $id,
						'attachUrlLink'	=> self::getAttachementURLLink(array(
							'account'		=> $this->account,
							'folder'		=> '',
							'message_no'	=> $msgId
						),$partno)
					);
				}else{
					if(array_key_exists('body',$part)){
						self::$cache[$msgId]['body']=$part['content'];
						self::$cache[$msgId]['type']=array_pop(split('/',$part['ct']));
					}
				}
			}
		}
	}

	public function getMimeFlatStruct($msgId){
		$this->fetchMessage($msgId);
		return array('flat'=>self::$cache[$msgId]['flat']);
	}

	public function body($msgId){
		$url =sprintf($this->urlRoot.'home/~/?auth=qp&zauthtoken=%s&id=%s',
			$this->accounts[$this->account]['token'],
			$msgId
		);
		return $this->directUrl($url);
	}

	public function fetchbody($msgId,$partno){
		$url=sprintf($this->urlRoot.'home/~/?auth=qp&zauthtoken=%s&id=%s&part=%s&loc=fr&disp=a',
			$this->accounts[$this->account]['token'],
			$msgId,
			$partno
		);
		return $this->directUrl($url);
	}

	private function mapImapFlag($flag){
		$flag = str_replace("\\","",$flag);
		return akead($flag,array(
			'seen'	=> 'read'
		),$flag);
	}

	function setflag_full($message_no,$flag){
		$params		= array(new SoapVar(array(
			'id'	=> $message_no,
			'op'	=> $this->mapImapFlag($flag)
		),SOAP_ENC_OBJECT,null,null,'action'));
		$res = $this->imapStream->call('zimbraMail','MsgActionRequest', $params);
		//db($res);
		//$this->imapStream->debug();
		return $res['Body']['MsgActionResponse'];
	}

	function clearflag_full($message_no,$flag){
		$params		= array(new SoapVar(array(
			'id'	=> $message_no,
			'op'	=> "!".$this->mapImapFlag($flag)
		),SOAP_ENC_OBJECT,null,null,'action'));
		$res = $this->imapStream->call('zimbraMail','MsgActionRequest', $params);
		//db($res);
		//$this->imapStream->debug();
		return $res['Body']['MsgActionResponse'];
	}

	function expunge(){
		return true;
	}

	private function mail_copy_move($action,$sequence,$dest,$destId){
		$params		= array(new SoapVar(array(
			'id'	=> $sequence,
			'op'	=> $action,
			'l'		=> $destId
		),SOAP_ENC_OBJECT,null,null,'action'));
		$res = $this->imapStream->call('zimbraMail','MsgActionRequest', $params);
		return $res['Body']['MsgActionResponse'];
	}
	function mail_copy($sequence,$dest,$destId){
		return $this->mail_copy_move('copy',$sequence,$dest,$destId);
	}

	function mail_move($sequence,$dest,$destId){
		return $this->mail_copy_move('move',$sequence,$dest,$destId);
	}

	function logout(){
	}

	function renamemailbox($old,$new){
		$this->imapStream->renameMailbox($old, $new);
	}

	function createmailbox($folder){
		$this->imapStream->createMailbox($folder);
	}

	function deletemailbox($folder){
		$this->imapStream->deleteMailbox($folder);
	}

	function thread (){
		return $this->imapStream->thread($this->currentFolder);
	}

	private function directUrl($url){
		return file_get_contents($url);
		/*
		$arrContextOptions=array(
			"http" => array(
				"method"		=> "GET",
				"ignore_errors"	=> true,
				"timeout"		=> (float)30.0,
			),
			"ssl"=>array(
				"allow_self_signed"	=>true,
				"verify_peer"		=>false,
			),
		);
		return file_get_contents($url, false, stream_context_create($arrContextOptions));

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_USERAGENT, "ZimbraPHPClient");
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		$contents = curl_exec($ch);
		db(array($url,curl_error($ch)));
		curl_close($ch);
		return $contents;
		*/
	}

	public function getSignatures($o){
		$res = array();
		$rawRes = $this->imapStream->call('zimbraAccount','GetSignaturesRequest');
		return $rawRes['Body']['GetSignaturesResponse'];
	}

	/**
	 *
	 * [{
		"name"				: "",
		"default"			: true,
		"fromName"			: "",
		"fromEmail"			: "",
		"saveToSent"		: true,
		"sentFolder"		: "",
		"signature"			: "",
		"replySignature"	:""
	 * }]
	 * @param unknown $o
	 * @return multitype:multitype:NULL string
	 */
	public function getFullIdentities($o){
		$aSignatures=array();
		$params = array();
		$rawRes = $this->imapStream->call('zimbraAccount','GetInfoRequest', $params,true);
		$rawRes = $rawRes['Envelope']['Body']['GetInfoResponse'];

		$rawRes['prefs'] = $this->imapStream->extractAttr($rawRes['prefs'],'pref','name');
		$rawRes['attrs'] = $this->imapStream->extractAttr($rawRes['attrs'],'attr','name');
		$rawRes['props'] = $this->imapStream->extractAttr($rawRes['props'],'prop','name');

		foreach($rawRes['identities']['identity'] as $k=>$v){
			if(is_int($k)){
				$rawRes['identities'][$k] = $this->imapStream->extractAttr($v,'a','name');
			}
		}
		unset($rawRes['identities']['identity']);
		return $rawRes;
	}

	public function getIdentities($o){
		$aSignatures=array();
		$params = array(new SoapVar('<account by="name">'.$this->accounts[$this->account]['email'].'</account>', XSD_ANYXML));
		$rawRes = $this->imapStream->call('zimbraAccount','GetAccountInfoRequest', $params,true);
		$aAccountInfo=$rawRes['Envelope']['Body']['GetAccountInfoResponse'];
		$aAccountInfo['attr']=$this->imapStream->extractAttr($aAccountInfo,'attr','name');

		$rawRes = $this->imapStream->call('zimbraAccount','GetSignaturesRequest');
		foreach($rawRes['Body']['GetSignaturesResponse']['signature'] as $aSignature){
			$aSignatures[$aSignature['id']]=$aSignature;
		}

		$rawRes = $this->imapStream->call('zimbraAccount','GetIdentitiesRequest', array(),true);
		$aIdentities=array();
		foreach($rawRes['Envelope']['Body']['GetIdentitiesResponse']['identity'] as $k=>$v){
			if(is_int($k)){
				$aIdentities[$k] = $this->imapStream->extractAttr($v,'a','name');
			}
		}

		$aResult=array();
		foreach($aIdentities as $k=>$v){
			$aIdentities[$k]['isDefault'] = ($v['zimbraPrefIdentityId']==$aAccountInfo['attr']['zimbraId']);
			if(array_key_exists('zimbraPrefDefaultSignatureId',$v) && array_key_exists($v['zimbraPrefDefaultSignatureId'],$aSignatures)){
				$aIdentities[$k]['zimbraPrefDefaultSignature']=$aSignatures[$v['zimbraPrefDefaultSignatureId']]['content'];
			}
			if(array_key_exists('zimbraPrefForwardReplySignatureId',$v) && array_key_exists($v['zimbraPrefForwardReplySignatureId'],$aSignatures)){
				$aIdentities[$k]['zimbraPrefForwardReplySignature']=$aSignatures[$v['zimbraPrefForwardReplySignatureId']]['content'];
			}
			$aResult[]=array(
				'default'		=> $aIdentities[$k]['isDefault'],
				'account'		=> htmlentities($aIdentities[$k]['zimbraPrefIdentityName']),
				'email'			=> akead('zimbraPrefFromAddress'			,$aIdentities[$k], 'from'	),
				'fromName'		=> akead('zimbraPrefFromDisplay'			,$aIdentities[$k], 'from'	),
				'fromEmail'		=> akead('zimbraPrefFromAddress'			,$aIdentities[$k], 'from'	),
				'saveToSent'	=> akead('zimbraPrefSaveToSent'				,$aIdentities[$k], true		),
				'sentFolder'	=> akead('zimbraPrefSentMailFolder'			,$aIdentities[$k], 'sent'	),
				'signature'		=> akead('zimbraPrefDefaultSignature'		,$aIdentities[$k], ''		),
				'replySignature'=> akead('zimbraPrefForwardReplySignature'	,$aIdentities[$k], ''		),
			);
		}
		return $aResult;
	}

	public function uploadAttachment($msgId,$path,$filename){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL			, $this->urlRoot.'upload?fmt=raw');
		curl_setopt($ch, CURLOPT_COOKIE			, 'ZM_AUTH_TOKEN='.$this->accounts[$this->account]['token']);
		curl_setopt($ch, CURLOPT_USERAGENT		, 'ZimbraPHPClient');
		curl_setopt($ch, CURLOPT_HEADER			, array('Content-Type: multipart/form-data'));
		curl_setopt($ch, CURLOPT_POST			, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER	, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER	, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST	, false);
		curl_setopt($ch, CURLOPT_POSTFIELDS		, array (
			'requestId'		=> $filename,
			'file_contents'	=> '@' . $path.'/'.$filename
		));
		$response = curl_exec($ch);
		if (curl_errno($ch)) {
			$code	= curl_errno($ch);
			$error	= curl_error($ch);
		} else {
			$code	= curl_getinfo($ch, CURLINFO_HTTP_CODE);
			if($code==200){
				$header_size = curl_getinfo($ch,CURLINFO_HEADER_SIZE);
				$header	= substr($response, 0, $header_size);
				$body	= substr($response, $header_size);
				$aTmp=(str_getcsv ($body,',' , "'"));
				return array(
					'success'		=> true,
					'code'			=> $aTmp [0],
					'client_token'	=> $aTmp [1],
					'server_token'	=> $aTmp [2]
				)
				;
			}else{
				$error = curl_error($ch).' code http:'.$code;
			}
		}
		curl_close ($ch);
		return array(
			'success'		=> false,
			'error'			=> $error,
			'code'			=> $code
		);
	}

	public function saveDraft($o){
		$mailParams = QDImap::makeMailEditorStruct($o);
		return $mailParams;
		$params = array();
		$rawRes = $this->imapStream->call('zimbraMail','SaveDraftRequest', $params,true);
		$rawRes = $rawRes['Envelope']['Body']['GetInfoResponse'];

		/*
		"Body": {
			"SaveDraftRequest": {
				"_jsns": "urn:zimbraMail",
				"m": {
					"idnt": "85ff6e13-090b-46d9-97b6-c966c63b7d26",
					"e": [{
						"t": "f",
						"a": "o.michaud@tutu.com.eu",
						"p": "Olivier M"
					}],
					"su": {
						"_content": ""
					},
					"mp": [{
						"ct": "multipart/alternative",
						"mp": [{
							"ct": "text/plain",
							"content": {
								"_content": "\ndsq dqsdqd \n\nO. MICHAUD 1 \n\n"
							}
						},{
							"ct": "text/html",
							"content": {
								"_content": "<html><body><br>dsq dqsdqd<br><div id=\"fa287e97-5422-4fe4-a0c3-aa85434881fb\"><span name=\"x\"></span><font face=\"arial black,avant garde\">O.<font color=\"#f66666\"><b>MICHAUD</b></font> 1<br></font><span name=\"x\"></span><br></div></body></html>"
							}
						}]
					}]
				}
			}
		}
		*/
	}
}