<?php
namespace qd\mail\mua\senderConnector;

class IMailSender {
	//public  $arrExt = array('png','jpg','pdf','gif','css');
	var $smMailMessage; //smMailMessage
	public  $from			= '';
	public  $fromName		= '';
	public	$to				= '';
	public	$cc				= '';
	public	$bcc			= '';
	public  $replyTo		= '';
	public	$sender			= '';
	public	$subject		= '';
	public	$body			= '';
	public	$AltBody		= '';
	public  $charset		= 'utf-8';
	public  $charset_alternative = 'iso-8859-1';
	public	$customheaders = array();
	/**
	'from'
	'fromName'
	'to'
	'cc'
	'bcc'
	'sender'
	'replyTo'
	'subject'
	'charset'
	'plaintext
	'HTMLBody'
	'newTextBody'
	'attachment'
	 */

	public function __construct() {
	}

	protected function setSMTPData($mail,$account){
	}

	protected function feedAddress($smMailMessage,$mailType,$addresses) {
	}

	protected function getMime($fileName){
		$finfo = new finfo(FILEINFO_MIME, ini_get('mime_magic.magicfile'));
		if (!$finfo) return false;
		return $finfo->file($fileName);
	}

	protected function setCustomHeader($mail,$o) {
	}
}