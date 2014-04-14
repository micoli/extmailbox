<?php
class svcMailboxSmtp extends svcMailboxImap{
	/**
	 *
	 */
	private function init(){
		$this->tmpAttachmentsPath = $GLOBALS['conf']['imapMailBox']['tmp'].'/attachments';
	}
	/**
	 *
	 * @param unknown $o
	 * @return multitype:Ambigous <multitype:NULL, number>
	 * http://127.0.0.1/extmailbox_local/proxy.php?attachments=[]&bcc=[]&body=%26nbsp%3Btest1&cc=[]&exw_action=local.MailboxSmtpExt.sendMail&from=micoli%40mail.local&message_id=40ac2d70-e52c-4e5f-96e0-584478c5dcaf&priority=medium&ref=&subject=test1&to=[{%22email%22%3A%22micoli%40mail.local%22%2C%22name%22%3A%22%22}]&account=micoli@ms
	 * http://localhost/extmailbox_local/proxy.php?exw_action=local.MailboxSmtpExt.sendMail&account=micoli%40ms&attachments=[%220cfd65d5-1f80-4b0c-8e29-28e7877ab41b-9-Des%20portails%20ferms%20%20l%27uniformit%22%2C%220cfd65d5-1f80-4b0c-8e29-28e7877ab41b-4-La%20cuisine%20contemporaine%20privilgie%20la%20transparence%22]&bcc=[]&body=%26nbsp%3B%20test%20de%20text%20ht%3Cspan%20style%3D%22background-color%3A%20rgb%28255%2C%20255%2C%20153%29%3B%22%3Eml%3Cb%3Edsdsd%3C%2Fb%3Edsds%3C%2Fspan%3Eds%20%3Ci%3Edsdsds%20%3C%2Fi%3E%3Cbr%3E%26nbsp%3Btest%20de%20text%20ht%3Cspan%20style%3D%22background-color%3A%20rgb%28255%2C%20255%2C%20153%29%3B%22%3Eml%3Cb%3Edsdsd%3C%2Fb%3Edsds%3C%2Fspan%3Eds%20%3Ci%3Edsdsds%26nbsp%3B%20%3C%2Fi%3Etest%20de%20text%20ht%3Cspan%20style%3D%22background-color%3A%20rgb%28255%2C%20255%2C%20153%29%3B%22%3Eml%3Cb%3Edsdsd%3C%2Fb%3Edsds%3C%2Fspan%3Eds%20%3Ci%3Edsdsds%3C%2Fi%3E&cc=[]&from=micoli%40mail.local&message_id=0cfd65d5-1f80-4b0c-8e29-28e7877ab41b&priority=medium&ref=&subject=test%20123&to=[{%22email%22%3A%22micoli%40mail.local%22%2C%22name%22%3A%22%22}]
	 */
	function pub_sendMail($o){
		$this->init();
		/*
		*'from','fromName'
		*'to','cc','bcc'
		*'sender','replyTo'
		'subject'
		'lng'
		'charset'
		'plaintext
		'HTMLBody'
		'newTextBody'
		'attachment'
		*/
		header('content-type:text/html');
		error_reporting(E_ALL ^ E_NOTICE);
		ini_set('display_errors',1);
		ini_set('html_errors',1);

		$p=array();
		$p['subject'		] = $o['subject'];
		$p['HTMLBody'		] = $o['body'];
		$p['from'			] = $GLOBALS['conf']['imapMailBox']['accounts'][$o['account']]['email'];
		$p['sender'			] = $GLOBALS['conf']['imapMailBox']['accounts'][$o['account']]['email'];
		$p['replyTo'		] = $GLOBALS['conf']['imapMailBox']['accounts'][$o['account']]['email'];
		$p['fromName'		] = $GLOBALS['conf']['imapMailBox']['accounts'][$o['account']]['name' ];
		$p['to'				] = json_decode(akead('to'	,$o,[]));
		$p['cc'				] = json_decode(akead('cc'	,$o,[]));
		$p['bcc'			] = json_decode(akead('bcc'	,$o,[]));
		$p['attachmentBase'	] = $this->tmpAttachmentsPath;
		$p['attachments'	] = json_decode(stripslashes(akead('attachments',$o,array())));

		$sender = new mailSenderSwiftMailer();
		$res = $sender->sendBasic(smMailMessage::create()->set($p),array('account'=> $GLOBALS['conf']['imapMailBox']['accounts'][$o['account']]['smtp']));

		if($res['success']){
			$this->imapProxy->setAccount($o['account']);
			$this->imapProxy->open();
			$sentFolder = $GLOBALS['conf']['imapMailBox']['accounts'][$o['account']]['sendFolder'];
			$r = $this->imapProxy->append($sentFolder, $res['mailStream'], "\\Seen");
		}
		return array('success'=>$res['success']);
	}

	/**
	 *
	 * @param unknown $o
	 * @return multitype:boolean multitype:string  |multitype:boolean
	 */
	function pub_uploadAttachment($o){
		$this->init();
		header('Content-Type: text/html, charset=utf-8');
		$renameDuplicates=false;
		$success=true;
		$arrErrors=array();
		foreach($_FILES as $k=>$file){
			$this->tmpAttachmentsPath = $GLOBALS['conf']['imapMailBox']['tmp'].'/attachments';

			if(!file_exists($this->tmpAttachmentsPath)){
				mkdir($this->tmpAttachmentsPath);
			}
			$dest		= $this->tmpAttachmentsPath.'/'.$o['path'].'-';
			$tmp_name	= $file['tmp_name'];
			$origin		= strtolower(basename($file['name']));
			$fulldest	= $dest.$origin;
			$filename	= $origin;

			if($renameDuplicates){
				for ($i=1; file_exists($fulldest); $i++){
					$fileext	= (strpos($origin,'.')===false ? '' : '.'.substr(strrchr($origin, "."), 1));
					$filename	= substr($origin, 0, strlen($origin)-strlen($fileext)).'['.$i.']'.$fileext;
					$fulldest	= $dest . $filename;
				}
			}else{
				if(file_exists($fulldest)){
					unlink($fulldest);
				}
			}
			if (!move_uploaded_file($tmp_name, $fulldest)){
				$arrErrors[$k] = 'can not move upload file';
			}
		}

		if(count($arrErrors)){
			return array('success'	=>$success,'errors'	=>$arrErrors);
		}else{
			return array('success'	=>$success);
		}
	}
}