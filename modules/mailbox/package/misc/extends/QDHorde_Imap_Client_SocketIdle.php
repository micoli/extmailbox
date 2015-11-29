<?php
class QDHorde_Imap_Client_SocketIdle extends Horde_Imap_Client_Socket{

	/**
	 * Uses the IMAP IDLE command (RFC 2177).
	 *
	 * @see http://tools.ietf.org/html/rfc2177
	 *
	 */
	public function idle($maxIdleTime = null){
		$this->_connection->setStreamTimeout($maxIdleTime);
		$this->_connection->writeIdle($this->_command("IDLE"));
		return $this->_connection->readIdle();
	}

	/**
	 * Connects to the IMAP server.
	 *
	 * @throws Horde_Imap_Client_Exception
	 */
	protected function _connect(){
		if (!is_null($this->_connection)) {
			return;
		}

		try {
			$this->_connection = new QDHorde_Imap_Client_Socket_Connection_SocketIdle(
				$this->getParam('hostspec'),
				$this->getParam('port'),
				$this->getParam('timeout'),
				$this->getParam('secure'),
				array(
					'debug' => $this->_debug,
					'debugliteral' => $this->getParam('debug_literal')
				)
			);
		} catch (Horde\Socket\Client\Exception $e) {
			$e2 = new Horde_Imap_Client_Exception(
					Horde_Imap_Client_Translation::r("Error connecting to mail server."),
					Horde_Imap_Client_Exception::SERVER_CONNECT
			);
			$e2->details = $e->details;
			throw $e2;
		}

		// If we already have capability information, don't re-set with
		// (possibly) limited information sent in the initial banner.
		if (isset($this->_init['capability'])) {
			$this->_temp['no_cap'] = true;
		}

		/* Get greeting information (untagged response). */
		try {
			$this->_getLine($this->_pipeline());
		} catch (Horde_Imap_Client_Exception_ServerResponse $e) {
			if ($e->status === Horde_Imap_Client_Interaction_Server::BYE) {
				/* Server is explicitly rejecting our connection (RFC 3501
				 * [7.1.5]). */
				$e->setMessage(Horde_Imap_Client_Translation::r("Server rejected connection."));
				$e->setCode(Horde_Imap_Client_Exception::SERVER_CONNECT);
			}
			throw $e;
		}

		// Check for IMAP4rev1 support
		if (!$this->queryCapability('IMAP4REV1')) {
			throw new Horde_Imap_Client_Exception(
					Horde_Imap_Client_Translation::r("The mail server does not support IMAP4rev1 (RFC 3501)."),
					Horde_Imap_Client_Exception::SERVER_CONNECT
			);
		}

		// Set language if NOT using imapproxy
		if (empty($this->_init['imapproxy'])) {
			if ($this->queryCapability('XIMAPPROXY')) {
				$this->_setInit('imapproxy', true);
			} else {
				$this->setLanguage();
			}
		}

		// If pre-authenticated, we need to do all login tasks now.
		if (!empty($this->_temp['preauth'])) {
			$this->login();
		}
	}
}