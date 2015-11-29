<?php
namespace qd\mail\mua\senderConnector;

class_exists('QDServiceLocatorSwift');

class mailSenderSwiftMailer extends iMailSender{
	private $transport;
	private $mailer;
	private $logger;

	protected function setSMTPData($mail,$account){
		$this->transport = Swift_SmtpTransport::newInstance()
			->setHost($account['host'])
			->setPort($account['port']);
		$this->mailer = Swift_Mailer::newInstance(
			$this->transport
		);

		$this->logger = new Swift_Plugins_Loggers_ArrayLogger();
		$this->mailer->registerPlugin(new Swift_Plugins_LoggerPlugin($this->logger));

		if(akead('auth'	,$account,false)){
			$this->transport
				->setUsername($account['user'])
				->setPassword($account['pass']);
		}

		if($secure = akead('secure',$account,'')){
			$this->transport
				->setEncryption($secure);
		}
	}

	protected function feedAddress($mail,$mailType,$addresses) {
		foreach(is_array($addresses)?$addresses:array('email'=>$addresses) as $k=>$v){
			if(is_string($v)){
				$v = array('email'=>$v,'name'=>$v);
			}
			if($v['email']){
				$address = (!is_null($v['name'])||($v['name']!=''))?array($v['email'] => $v['name']):array($v['email']);
				switch ($mailType){
					case 'to' :
						$mail->setTo		($address);
					break;
					case 'cc' :
						$mail->addCC		($address);
					break;
					case 'bcc' :
						$mail->addBCC		($address);
					break;
					case 'replyTo' :
						$mail->addReplyTo	($v['email']);
					break;
				}
			}
		}
	}

	/**
	 *
	 * @param 	array $o
	 * @throws InvalidArgumentException
	 * @return multitype:NULL string |multitype:NULL |number
	 *
	 */
	public function sendBasic(smMailMessage $smMailMessage,array $options) {
		$this->smMailMessage=$smMailMessage;
		$message = Swift_Message::newInstance();

		$this->setSMTPData($message,$options['account']);

		$this->feedAddress($message, 'to'		, $this->smMailMessage->to);
		$this->feedAddress($message, 'cc'		, $this->smMailMessage->cc);
		$this->feedAddress($message, 'bcc'		, $this->smMailMessage->bcc);

		$message->setFrom		(array($smMailMessage->from => $smMailMessage->fromName?$smMailMessage->fromName:$this->from));
		$message->setSender 	($smMailMessage->sender);
		$message->addReplyTo($this->smMailMessage->replyTo);

		$message->setSubject	($smMailMessage->subject);

		$headers = $message->getHeaders();
		if (count($this->customheaders) > 0) {
			foreach ($this->customheaders as $kc => $vc) {
				$headers->addTextHeader(array($kc,$vc));
			}
		}

		foreach($smMailMessage->attachments as $k=>$v){
			$message->attach(Swift_Attachment::fromPath($v));
		}

		$type = $message->getHeaders()->get('Content-Type');
		$type->setValue		('text/html');
		$type->setParameter	('charset', $this->charset);

		$message->setBody($smMailMessage->HTMLBody)->addPart($smMailMessage->HtmlToTextBody());

		$success	= ($this->mailer->send($message,$error)>0);

		return array(
			'success'	=> $success,
			'mailStream'=> $success?$message->toString():null,
			'error'		=> $error
		);
	}
}
