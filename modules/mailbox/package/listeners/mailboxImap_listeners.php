<?php
namespace qd\listeners;

class mailboxImap_listeners extends \CEP_EventContainer{
	/**
	 * @CEP_EventHandler(event="qd.services.mua.mailbox_imap.getAccounts.pre",priority=10)
	 **/
	public static function onPreGetAccounts(\CEP_Event $event){
		//db($event->getData());
	}

	/**
	 * @CEP_EventHandler(event="qd.services.mua.mailbox_imap.setAccount.pre")
	 **/
	public static function onPreSetAccounts(\CEP_Event $event){
		//db($event->getData());
	}
	/**
	 * @CEP_EventHandler(event="qd.services.mua.mailbox_imap.getAccounts.format")
	 **/
	public static function onFormatGetAccounts(\CEP_Event $event){
		$a=$event->getData();
		$a['toto']=1;
		$event->setData($a);
	}
}