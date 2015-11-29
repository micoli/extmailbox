<?php
namespace qd\mail\mua\senderConnector;

//require_once dirname(__FILE__).DIRECTORY_SEPARATOR.'PHPMailer'.DIRECTORY_SEPARATOR.'class.phpmailer.php';
class_exists('PHPMailer');

class mailSenderPHPMailer extends iMailSender{
	protected function setSMTPData($oPHPMailMessage,$account){

		$oPHPMailMessage->IsSMTP();
		$oPHPMailMessage->SMTPSecure	= akead('secure',$account,'');
		$oPHPMailMessage->SMTPAuth		= akead('auth'	,$account,false);
		$oPHPMailMessage->Host			= $account['host'];
		$oPHPMailMessage->Port			= $account['port'];
		$oPHPMailMessage->Username		= $account['user'];
		$oPHPMailMessage->Password		= $account['pass'];
	}

	protected function feedAddress($smMailMessage, $mailType, $addresses) {
		if(is_array($addresses)){
			foreach($addresses as $k=>$v){
				switch ($mailType){
					case 'to' :
						$smMailMessage->AddAddress	($v['email'], $v['name']);
					break;
					case 'cc' :
						$smMailMessage->AddCC		($v['email'], $v['name']);
					break;
					case 'bcc' :
						$smMailMessage->AddBCC		($v['email'], $v['name']);
					break;
					case 'replyTo' :
						$smMailMessage->AddReplyTo	($v['email'], $v['name']);
					break;
				}
			}
		}
	}

	protected function mail_mime_content_type($filename) {
		return PHPMailer::_mime_types(array_pop(explode('.',$filename)));
	}

	/**
	 *
	 * @param 	array $o
	 * @throws InvalidArgumentException
	 * @return multitype:NULL string |multitype:NULL |number
	 *
	 */
	public function sendBasic(smMailMessage $smMailMessage,array $options) {
		$this->smMailMessage = $smMailMessage; //smMailMessage

		//$oPHPMailMessage->WordWrap = 50;
		$oPHPMailMessage = new PHPMailer(true);
		$oPHPMailMessage->SingleTo = akead('MailerSingleTo', $options, false);

		$oPHPMailMessage->CharSet = $this->charset;
		$oPHPMailMessage->CharSet_alternative = $this->charset_alternative;

		$this->setSMTPData($oPHPMailMessage,$options['account']);

		$oPHPMailMessage->ClearAllRecipients();
		$this->feedAddress($oPHPMailMessage, 'to'		, $this->smMailMessage->to);
		$this->feedAddress($oPHPMailMessage, 'cc'		, $this->smMailMessage->cc);
		$this->feedAddress($oPHPMailMessage, 'bcc'		, $this->smMailMessage->bcc);
		$this->feedAddress($oPHPMailMessage, 'replyTo'	, $this->smMailMessage->replyTo);

		$oPHPMailMessage->From			= $this->smMailMessage->from;
		$oPHPMailMessage->FromName		= $this->smMailMessage->fromName;
		$oPHPMailMessage->Sender 		= $this->smMailMessage->sender;
		$oPHPMailMessage->Subject		= $this->smMailMessage->subject;

		$this->setCustomHeader($oPHPMailMessage,$this->smMailMessage);

		if (count($this->smMailMessage->customheaders) > 0) {
			foreach ($this->smMailMessage->customheaders as $kc => $vc) {
				$oPHPMailMessage->AddCustomHeader($kc . ':' . $vc);
			}
		}

		$embededAttachments=array();
		$oPHPMailMessage->ClearAttachments() ;
		if (array_key_exists('attachments',$smMailMessage)){
			foreach($o['attachments'] as $k=>$v){
				$oPHPMailMessage->AddAttachment($v,basename($v));
			}
		}

		$oPHPMailMessage->IsHTML(true);

		if(isset($this->smMailMessage->newTextBody)) {
			$oPHPMailMessage->Body = $oPHPMailMessage->AltBody = nl2br(htmlentities(utf8_decode($this->smMailMessage->newTextBody)));
		}else {
			$oPHPMailMessage->Body = $this->smMailMessage->HTMLBody;
			if (($oPHPMailMessage->Body == $oPHPMailMessage->AltBody) or trim(($oPHPMailMessage->AltBody) =='')) {
				$oPHPMailMessage->AltBody = $this->smMailMessage->HtmlToTextBody();
			}else{
				$oPHPMailMessage->AltBody = strip_tags($oPHPMailMessage->AltBody);
			}
		}

		if (isset($this->smMailMessage->plaintext)) {
			$oPHPMailMessage->IsHTML(false);
			$oPHPMailMessage->AltBody = '';
		} else {
			$oPHPMailMessage->IsHTML(true);
		}

		$success = $oPHPMailMessage->send();

		return array(
			'success'	=> !!$success,
			'mailStream'=> !!$success?preg_replace('~(*BSR_ANYCRLF)\R~', "\r\n",$oPHPMailMessage->getSentMIMEMessage()):null,
			'error'		=> $oPHPMailMessage->ErrorInfo,
		);
	}
}