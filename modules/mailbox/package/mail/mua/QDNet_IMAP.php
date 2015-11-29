<?php
namespace qd\mail\mua\imapConnector;

class QDNet_IMAP extends Net_IMAP{
	/**
	 * Message summary
	 *
	 * @param mixed   $msg_id   Message number
	 * @param boolean $uidFetch msg_id contains UID's instead of Message
	 *                          Sequence Number if set to true
	 *
	 * @return mixed Either array of headers or PEAR::Error on error
	 *
	 * @access public
	 */
	function getFieldForSort($msg_id=null, $uidFetch = false,$field='DATE')
	{
		$fieldName=$field=='DATE'?'INTERNALDATE':$field;
		if ($msg_id != null) {
			if (is_array($msg_id)) {
				$message_set = $this->_getSearchListFromArray($msg_id);
			} else {
				$message_set = $msg_id;
			}
		} else {
			$message_set = '1:*';
		}

		if ($uidFetch) {
			$ret = $this->cmdUidFetch($message_set,'(UID '.$fieldName.')');
					//'(RFC822.SIZE UID FLAGS ENVELOPE INTERNALDATE BODY.PEEK[HEADER.FIELDS (CONTENT-TYPE X-PRIORITY)])');
		} else {
			$ret = $this->cmdFetch($message_set,'(UID '.$fieldName.')');
					//'(RFC822.SIZE UID FLAGS ENVELOPE INTERNALDATE BODY.PEEK[HEADER.FIELDS (CONTENT-TYPE X-PRIORITY)])');
		}
		//db($ret);
		// $ret=$this->cmdFetch($message_set,"(RFC822.SIZE UID FLAGS ENVELOPE INTERNALDATE BODY[1.MIME])");
		if ($ret instanceOf PEAR_Error) {
			return $ret;
		}
		if (strtoupper($ret['RESPONSE']['CODE']) != 'OK') {
			return new PEAR_Error($ret['RESPONSE']['CODE']
					. ', '
					. $ret['RESPONSE']['STR_CODE']);
		}

		if (isset($ret['PARSED'])) {
			$env = array();
			for ($i=0; $i<count($ret['PARSED']); $i++) {
				if($field=='INTERNALDATE'){
					$ret["PARSED"][$i]['EXT'][$fieldName]=strtotime($ret["PARSED"][$i]['EXT'][$fieldName]);
				}
				$env[$uidFetch?$ret["PARSED"][$i]['EXT']['UID']:$ret["PARSED"][$i]['EXT']['NRO']]=$ret["PARSED"][$i]['EXT'][$fieldName];
			}
			return $env;
		}

		//return $ret;
	}

}