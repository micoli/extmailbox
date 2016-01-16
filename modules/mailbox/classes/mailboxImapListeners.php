<?php
namespace qd\listeners;
use CEP\Event;
use CEP\EventContainer;
use qd\mail\mua\QDImap;

/**
 * @redmine #11597 [TECH] Mise en place des interceptors
 * @redmine #11640 Maquette V2 dans Cyrus
 */
class mailboxImapListeners extends EventContainer{
	public static function onInitGeneric(\CEP\Event $event){
		$cwcr = new \CW_Crypt();
		//unset($_SESSION['ztoken']);unset($_SESSION['__auth']['AUMT_EMAIl_PASSWORD']);
		//$encrypted = $cwcr->scramble(array('mode'=>'ENC','value'=>'pass'));
		//unset($_SESSION['__auth']['AUMT_EMAIL_PASSWORD']);
		//$_SESSION['__auth']['AUT_EMAIL']='o.michaud@servicemagic.eu';
		//$_SESSION['__auth']['AUMT_EMAIL_PASSWORD']=$cwcr->scramble(array('mode' => 'ENC','value' => 'xxxxx'));
		//$_SESSION['__auth']['AUT_EMAIL']='b.durand-bret@servicemagic.eu';
		//$_SESSION['__auth']['AUMT_EMAIL_PASSWORD']=$cwcr->scramble(array('mode' => 'ENC','value' => 'yyyy'));
		//unset($_SESSION['ztoken']);

		$auth = &$_SESSION['__auth'];
		if(!array_key_exists('AUMT_EMAIL_PASSWORD',$auth)){
			$oAumt = new \AUMT_AUTH_META();
			$aAumt = $oAumt->get(array (
				'cols'		=> array('AUMT_VALUE'),
				'AUT_ID'	=> $auth['AUT_ID'],
				'AUMT_KEY'	=> 'AUT_MUA_CRED'
			));
			if(is_array($aAumt)){
				$auth['AUMT_EMAIL_PASSWORD']=$aAumt[0]['aumt_value'];
			}else{
				$oAuth = new \T_AUTH();
				$aAuth = $oAuth->get(array (
					'cols'		=> array('AUT_PASSWORD'),
					'AUT_ID'	=> $auth['AUT_ID']
				));
				$auth['AUMT_EMAIL_PASSWORD']=$cwcr->scramble(array('mode' => 'ENC','value' => $aAuth[0]['aut_password']));
			}
		}

		$GLOBALS['conf']['imapMailBox']=array(
			'tmp'		=> '/tmp/mbox',
			'accounts'	=> array(
				'mail.servicemagic.eu'=> array(
					'email'			=> $auth['AUT_EMAIL'],
					'user'			=> $auth['AUT_EMAIL'],
					'pass'			=> $cwcr->scramble(array('mode' => 'DEC','value' => $auth['AUMT_EMAIL_PASSWORD'])),
					'host'			=> 'mailservicemagic.eu',
					'zmurl'			=> 'https://mail.servicemagic.eu/service/',
					'name'			=> sprintf('%s %s %s',$auth['AUT_PREFIXE'],$auth['AUT_NOM'],$auth['AUT_PRENOM']),
					'sendFolder'	=> 'INBOX.Sent',
					'draftFolder'	=> 'INBOX.Draft',
					'port'			=> 143,
					'secure'		=> false,
					/*'smtp'			=> array(
						'host'			=> 'mail.home.micoli.org',
						'port'			=> 25,
						'secure'		=> false,
						'user'			=> 'micoli@home.micoli.org',
						'pass'			=> 'micoli'
					)*/
				)
			)
		);
		$event->getContext()->imapProxy = new \CEP\Interceptor(QDImap::getInstance($GLOBALS['conf']['imapMailBox']['accounts'],$event->getContext()->proxyClass),isset($GLOBALS['conf']['app']['plugins'])?$GLOBALS['conf']['app']['plugins']:null);
	}

	/**
	 * @CEP_EventHandler(event="qd.services.mua.mailbox_imap.__construct",priority=10)
	 **/
	public static function onInit(\CEP\Event $event){
		$GLOBALS['conf']['imapMailBox']=array(
			'tmp'		=> '/tmp/mbox',
			'accounts'	=> array(
				'mail.servicemagic.eu'=> array(
					'email'			=> 'o.michaud@servicemagic.eu',
					'user'			=> 'o.michaud@servicemagic.eu',
					'pass'			=> 'lvrm1902',
					'host'			=> 'mailservicemagic.eu',
					'zmurl'			=> 'https://mail.servicemagic.eu/service/',
					'name'			=> 'Olivier MICHAUD',
					'sendFolder'	=> 'INBOX.Sent',
					'draftFolder'	=> 'INBOX.Draft',
					'port'			=> 143,
					'secure'		=> false
				)
			)
		);
		$event->getContext()->imapProxy = new \CEP\Interceptor(QDImap::getInstance($GLOBALS['conf']['imapMailBox']['accounts'],$event->getContext()->proxyClass),isset($GLOBALS['conf']['app']['plugins'])?$GLOBALS['conf']['app']['plugins']:null);
	}

	/**
	 * @CEP_EventHandler(event="qd.services.mua.mailbox_imap.getTemplates.pre")
	 **/
	public static function onPreGetTemplates(\CEP\Event $event){
		$args=$event->getData();
		$args[0]['templatePath']=dirname(__FILE__).'/mailTemplates';
		$event->setData($args);
	}

	/**
	 * @CEP_EventHandler(event="qd.services.mua.mailbox_imap.getAccounts.pre",priority=10)
	 **/
	public static function onPreGetAccounts(\CEP\Event $event){
		$o = $event->getData();
		$o['eeeee']=123;
		$event->setData($o);
		//$event->setCancelled();
	}

	/**
	 * @CEP_EventHandler(event="qd.services.mua.mailbox_imap.setAccount.pre")
	 **/
	public static function onPreSetAccounts(\CEP\Event $event){
		//db($event->getData());
	}

	/**
	 * @CEP_EventHandler(event="qd.services.mua.mailbox_imap.getAccounts.transform")
	 **/
	public static function onFormatGetAccounts(\CEP\Event $event){
		$result=$event->getData();
		$result[0]['toto']=1;
		$event->setData($result);
	}
}