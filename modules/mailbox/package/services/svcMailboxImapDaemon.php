<?php
namespace qd\services;

/**
 *
 * http://www.pixelinx.com/2013/09/creating-a-mail-server-on-ubuntu-postfix-courier-ssltls-spamassassin-clamav-amavis/
 * http://www.flatmtn.com/article/setting-courier-imap
 * https://help.ubuntu.com/community/Courier
 */
class svcMailboxImapDaemon extends svcMailboxImap{
	var $proxyClass = 'HORDE_IDLE';
	var $stomp = null;

	public function pub_run($o){
		$this->stomp = new Stomp('tcp://network.home.micoli.org:61613');
		$this->stomp->connect('guest','guest');
		try {
			$this->imapProxy->setAccount($o['account']);
			$this->imapProxy->open('INBOX');
			if(!$this->imapProxy->isConnected()){
				return $res;
			}
			$this->getLatestMails($o);

			$running = true;
			do {
				db(date('H:i:s ')."IN IDLE ");
				$response = $this->imapProxy->idle(5*60);
				if($response){
					db(date('H:i:s -------------').$response);
					$this->getLatestMails($o);
				}else{
					db(date('H:i:s ').'TIMEOUT OCCURED');
				}
			} while($running);
			db(__CLASS__." ".__LINE__);
		} catch (Horde_Imap_Client_Exception $e) {
			db($e);
		} catch (InvalidArgumentException $e) {
			db($e);
		}
	}

	/**
	 *
	 * @param array $o
	 * @return array
	 */
	public function pub_refreshFolder($o){
		$this->imapProxy->setAccount($o['account']);
		$this->imapProxy->open('INBOX');

		if(!$this->imapProxy->isConnected()){
			return $res;
		}

		return $this->getLatestMails($o);
	}

	public function getLatestMails($o){
		$aResults	= array();
		$aRes		= $this->imapProxy->getMMGMaxInFolder($this->imapProxy->currentFolder64,$this->imapProxy->currentFolderStatus['uidvalidity']);
		$sMinDate	= $aRes[0]['max_date']==''?'1980-01-01':$aRes[0]['max_date'];
		//$iMinId	= max(1,O + $aRes[0]['max_id']);

		$oUnseenQuery = new Horde_Imap_Client_Search_Query(array(
			'peek'	=> true
		));
		$oUnseenQuery->flag('SEEN',false);
		$oUnseenQuery->dateSearch($sMinDate,Horde_Imap_Client_Search_Query::DATE_SINCE);

		$results = $this->imapProxy->search($oUnseenQuery);
		$aAllIDs = $results['match']->ids;

		if(count($aAllIDs)){
			$aChunksID = array_chunk($aAllIDs,30);
			foreach($aChunksID as $aMsg){
				$oMMG = new MMG_MAIL_MESSAGE();
				$aMMG = $oMMG->get(array(
					'cols'		=> array(
						'group_concat(MMG_UID order by MMG_UID) as UIDS'
					),
					'where'		=> array(
						'MMG_FOLDER'		=> $this->imapProxy->currentFolder64,
						'MMG_FOLDER_UUID'	=> $this->imapProxy->currentFolderStatus['uidvalidity'],
						'MMG_UID'			=> array('IN', $aMsg),
					)
				));
				$aMMGId	= explode(',',$aMMG[0]['uids']);
				$aMsgToDo = array_diff($aMsg,$aMMGId);
				$aTmp	= $this->imapProxy->fetch_overviewWithCache($aMsgToDo,array(
					'account'	=> $o['account'],
					'folder'	=> $this->imapProxy->currentFolder64
				));
				foreach($aTmp as $aHeader){
					$from=$aHeader->from[0]->name?$aHeader->from[0]->name:$aHeader->from[0]->email;
					if(!array_key_exists($from,$aResults)){
						$aResults[$from]=array();
					}
					$aResults[$from][]=$aHeader->subject;
				}
			}
			if (count($aResults)>0){
				$this->stomp->send("/topic/imapNotifierOnMessage/".$o['account'], json_encode(array('newEmails'=>$aResults)));
			}
		}
	}

}
