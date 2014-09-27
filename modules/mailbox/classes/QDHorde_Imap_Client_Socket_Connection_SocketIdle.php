<?php
class QDHorde_Imap_Client_Socket_Connection_SocketIdle extends Horde_Imap_Client_Socket_Connection_Socket{
	var $idleResponse='---';
	public function setStreamTimeout($timeout){
		if(!is_null($this->_stream)){
			stream_set_timeout($this->_stream, $timeout);
			return true;
		}
		return false;
	}

	public function writeIdle($data){
		if (fwrite($this->_stream, $buffer . $data . "\r\n") === false ) {
			throw new Horde_Imap_Client_Exception(
					Horde_Imap_Client_Translation::r("Server write error."),
					Horde_Imap_Client_Exception::SERVER_WRITEERROR
			);
		}
	}

	public function readIdle(){
		$this->idleResponse=false;
		do {
			if (feof($this->_stream)) {
				$this->close();
				$this->_params['debug']->info(
					'ERROR: Server closed the connection.'
				);
				throw new Horde_Imap_Client_Exception(
					Horde_Imap_Client_Translation::r("Mail server closed the connection unexpectedly."),
					Horde_Imap_Client_Exception::DISCONNECT
				);
			}
			$in='';
			while (($buffer = fread($this->_stream,4096)) !== false) {
				$in .= rtrim($buffer);
				if (substr($buffer, -1) === "\n" || $buffer=='') {
					$in=trim($in);
					break;
				}
			}
			if($in){
				//db($in);
				foreach(explode("\n",$in) as $str){
					$str=trim($str);
					//db($str);
					$token = new Horde_Imap_Client_Tokenize();
					$token->add($str);
					$server = Horde_Imap_Client_Interaction_Server::create($token);
					//db(strtolower($server->token->current())."->".get_class($server));
					//db($str."->".get_class($server));
					switch (get_class($server)){
						case 'Horde_Imap_Client_Interaction_Server_Continuation':
						break;
						case 'Horde_Imap_Client_Interaction_Server_Untagged':
							if(preg_match('!(EXISTS|EXPUNGE)!',$in) && !$this->idleResponse){
								if(trim($str)!=''){
									$this->idleResponse=$str;
								}
								//db('DONE!!!');
								$this->write('DONE',true);
							}
						break;
						case 'Horde_Imap_Client_Interaction_Server_Tagged':
							return $this->idleResponse;
						break;
					}
					if($this->idleResponse){
						break;
					}
				}
			}else{
				$this->idleResponse=false;
				//db('DONE timeout!!!');
				$this->write('DONE',true);
			}
		} while (true);
	}
	public function ___readIdle(){
		$this->idleResponse=false;
		do {
			if (feof($this->_stream)) {
				$this->close();
				$this->_params['debug']->info(
					'ERROR: Server closed the connection.'
				);
				throw new Horde_Imap_Client_Exception(
					Horde_Imap_Client_Translation::r("Mail server closed the connection unexpectedly."),
					Horde_Imap_Client_Exception::DISCONNECT
				);
			}
			$in='';
			while (($buffer = fgets($this->_stream)) !== false) {
				if (substr($buffer, -1) === "\n") {
					$in .= rtrim($buffer);
					db('--'.$in);
					$this->_params['debug']->server($in);
					$token = new Horde_Imap_Client_Tokenize();
					$token->add($in);
					$server = Horde_Imap_Client_Interaction_Server::create($token);
					//db(strtolower($server->token->current())."->".get_class($server));
					db($in."->".get_class($server));
					switch (get_class($server)){
						case 'Horde_Imap_Client_Interaction_Server_Continuation':
						break;
						case 'Horde_Imap_Client_Interaction_Server_Untagged':
							if(preg_match('!(RECENT|EXPUNGE)!',$in) && !$this->idleResponse){
								if(trim($in)!=''){
									$this->idleResponse=$in;
								}
								/*while($buffer = fread($this->_stream,4096)){
									db("flush[$buffer]");
									if (strlen($buffer)<10){
										break;
									}
								}*/
								db(123);
								db('DONE!!!');
								$this->write('DONE',true);
							}
						break;
						case 'Horde_Imap_Client_Interaction_Server_Tagged':
							return $this->idleResponse;
						break;
					}
					$in='';
				}else{
					$in .= rtrim($buffer);
				}
			}
			$this->idleResponse=false;
			$this->write('DONE',true);
		} while (true);
	}
}