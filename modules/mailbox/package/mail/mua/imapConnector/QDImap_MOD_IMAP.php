<?php
namespace qd\mail\mua\imapConnector;

class QDImap_MOD_IMAP extends QDImap{
	var $imapStream		;

	var $imap_order		= array(
		'date'		=> SORTDATE,
		'arrival'	=> SORTARRIVAL,
		'from'		=> SORTFROM,
		'subject'	=> SORTSUBJECT,
		'size'		=> SORTSIZE
	);

	function getmailboxes ($filter){
		return imap_getmailboxes($this->imapStream, $this->accounts[$this->account]['cnx'], $filter);
	}

	function __destruct (){
		if ($this->imapStream){
			imap_close($this->imapStream);
		}
	}

	function open ($subFolder=''){
		$this->currentFolder		= $subFolder;
		$this->currentFolder64		= base64_encode($subFolder);
		$this->imapStream			= imap_open($this->getConnectionMailbox().$this->currentFolder, $this->accounts[$this->account]['user'],$this->accounts[$this->account]['pass']);
		$this->currentFolderStatus	= $this->status($this->currentFolder);
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
		return imap_status($this->imapStream,$this->getConnectionMailbox().$mailbox,$options);
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

	function fetch_overview ($p,$uid=true){
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

	function fetch_overviewWithCache($aID,$o){
		$aMsgs	= $this->fetch_overview(is_array($aID)?implode(',',$aID):$aID);
		$aRet	= array();
		$aMID	= array();
		if ($aMsgs) {
			foreach ($aMsgs as $msg) {
				if($msg->message_id){
					$msg->folder			= $this->currentFolder;
					$msg->folder_uuid		= $this->currentFolderStatus->uidvalidity;
					$msg->msgid				= $msg->uid;
					$msg->date				= date('Y-m-d H:i:s',strtotime($msg->date));
					$msg->account			= $o['account'];
					$msg->folder			= $o['folder'];
					$aMID[]					= $msg->msgid;
					$aRet[]					= $msg;
				}
			}
			$aMMGCache = $this->getMMGCache(base64_encode($this->currentFolder),$this->currentFolderStatus->uidvalidity,$aMID);
			foreach($aRet as &$msg){
				$this->getMsgWithCacheSupport($aMMGCache,$msg);
			}
		}
		return $aRet;
	}
	/**
	 *
	 * @param unknown $message_no
	 * @return multitype:
	 */
	function getMimeFlatStruct($message_no){
		$struct = $this->fetchstructure($message_no);
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

	public function getMessageContent($o){
			header('content-type: text/html; charset=utf-8');

			$folder		= base64_decode($o['folder']);;
			//$message_id	= $o['message_id'];
			$message_no	= $o['message_no'];

			$this->imapProxy->setAccount($o['account']);
			$this->imapProxy->open($folder);

			if(!$this->imapProxy->isConnected()){
				return $res;
			}
			//$message_no	= $this->imapProxy->msgno($message_no);
			//$struct		= $this->getMimeMsg($mbox, $message_no,false);
			$head		= $this->imapProxy->getHeader($message_no,true);
			$this->imapProxy->parseRecipient($head, 'From');
			$this->imapProxy->parseRecipient($head, 'To');
			$this->imapProxy->parseRecipient($head, 'Cc');
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
			return $rtn;
	}

	public function getMessageAttachment($o){
		$folder		= base64_decode($o['folder']);;
		$message_no	= $o['message_no'];

		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open($folder);
		if(!$this->imapProxy->isConnected()){
			return array('error'=>true);
		}


		$o['filename']	= base64_decode($o['filename']);
		$outStruct		= $this->imapProxy->getMimeFlatStruct($message_no)['flat'];
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
				db(urlencode($this->imapProxy->decodeMimeStr($filename)));
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

}