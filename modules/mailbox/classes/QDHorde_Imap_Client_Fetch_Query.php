<?php
class QDHorde_Imap_Client_Fetch_Query extends Horde_Imap_Client_Fetch_Query{
	var $_searchCplt = array();
	function fromId($id){
		if (!empty($id)) {
			$this->_searchCplt['fromid'] = $id;
		}
	}

	function build($exts){
		$build = parent::build($exts);

		if (isset($this->_searchCplt['fromid'])) {
			if ($this->_searchCplt['fromid']) {
				//$build['query']->add($this->_searchCplt['fromid'].':*');
			}
		}

		return $build;
	}

}