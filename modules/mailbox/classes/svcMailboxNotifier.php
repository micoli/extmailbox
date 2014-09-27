<?php
class svcMailboxNotifier{
	function pub_notifier($o){
		$account=$GLOBALS['conf']['imapMailBox']['accounts'][$o['account']];
		$imap = new IMAP(
				$account['user'],
				$account['pass'],
				'localhost',
				"143"
		);

		$imap->noop();
		$response = $imap->listMailboxes();
		db($response);

		$response = $imap->select('INBOX',true);
		db($response);
		$response = $imap->subscribe('INBOX');
		db($response);
		$response = $imap->_responce(false);
		db($response);

		db('------');
		$r = $imap->idle();
		$response = $imap->_responce(false);
		db($response);
		$response = $imap->_responce(false);
		db($response);
		$response = $imap->_responce(false);
		db($response);

	}

}