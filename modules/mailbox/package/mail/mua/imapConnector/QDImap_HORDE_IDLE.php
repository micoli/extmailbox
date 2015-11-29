<?php
namespace qd\mail\mua\imapConnector;

class QDImap_HORDE_IDLE extends QDImap_HORDE{
	var $internalClass='QDHorde_Imap_Client_SocketIdle';

	function idle($time){
		return $this->imap_imp->idle($time);
	}
}