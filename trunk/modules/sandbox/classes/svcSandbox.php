<?php
class svcSandbox{
	public function cpImapMailboxes(){
		$sourceHost = "192.168.1.72:143/novalidate-cert";    // Change these as appropriate
		$destHost = "127.0.0.1:143/novalidate-cert";
		$mailbox = "INBOX";

		$sourcestream	= imap_open("{".$sourceHost."}", "userfrom","passfrom");
		$deststream		= imap_open("{".$destHost."}", "userto","passto");
		if ($sourcestream && $deststream) {

			$list = imap_list($sourcestream, "{".$sourceHost."}", "*");
			$destlist = imap_list($deststream, "{".$destHost."}", "*");
			print_r($destlist);
			//   if (0) {
			if (is_array($list)) {
				foreach($list as $mailbox) {
					$pos = strpos($mailbox,"}");
					$mailbox = substr($mailbox,$pos+1);
					if (! stristr($mailbox,"Shared")) {
						// if ($mailbox == "INBOX") {
						echo $mailbox."\n";
						$sourcembox = imap_open("{".$sourceHost."}".$mailbox, "userfrom","passfrom");
						// $sourcembox = false; // debug
						if ($sourcembox) {

							if (! array_search("{".$destHost."}".$mailbox,$destlist)) {
								echo "Creating mailbox $mailbox on $destHost ";
								if (imap_createmailbox($deststream, imap_utf7_encode("{".$destHost."}".$mailbox))) {
									echo "done\n";
								} else {
									echo "NOT done\n";
								}
							}

							$destmbox = imap_open("{".$destHost."}".$mailbox, "userto","passto");

							if ($destmbox)  {
								$headers = imap_headers($sourcembox);
								$total = count($headers);
								$n = 1;
								echo "$total items in $mailbox\n";
								if ($headers) {
									foreach ($headers as $key => $thisHeader) {
										echo "copying $n of $total... ";
										$header = imap_headerinfo($sourcembox, $key+1);
										$is_unseen = $header->Unseen;
										echo "is_unseen = $is_unseen";
										// $is_recent = $header->Recent;
										// echo "is_recent = $is_recent";
										$messageHeader = imap_fetchheader($sourcembox, $key+1);
										$body = imap_body($sourcembox, $key+1);
										if (imap_append($destmbox,"{".$destHost."}".$mailbox,$messageHeader."\r\n".$body)) {
											if ($is_unseen != "U") {
												if (! imap_setflag_full($destmbox,$key+1,'\\SEEN')) {
													echo "couldn't set \\SEEN flag";
												}
											}
											echo "done\n";
										} else {
											echo "NOT done\n";
										}
										$n++;
									}
								}
								imap_close($destmbox);
							}
							imap_close($sourcembox);
						}
					}
				}
			}
			imap_close($sourcestream);
			imap_close($deststream);
		}
	}

	function pub_getPivotData($o){
		return array('data'=>
				array(
						array('key'=>10	,'col1'=>'azerty'		,'subkey'=>'b'	,'value'=>2),
						array('key'=>10	,'col1'=>'azerty'		,'subkey'=>'a'	,'value'=>1),

						array('key'=>11	,'col1'=>'azerty'		,'subkey'=>'a'	,'value'=>3),
						array('key'=>11	,'col1'=>'azerty'		,'subkey'=>'b'	,'value'=>4),
						array('key'=>11	,'col1'=>'azerty'		,'subkey'=>'c'	,'value'=>5),

						array('key'=>12	,'col1'=>'cxwsfe'		,'subkey'=>'a'	,'value'=>3),
						array('key'=>12	,'col1'=>'cxwsfe'		,'subkey'=>'c'	,'value'=>5),

						array('key'=>13	,'col1'=>'aqzser'		,'subkey'=>'a'	,'value'=>3),
						array('key'=>13	,'col1'=>'aqzser'		,'subkey'=>'b'	,'value'=>5),
						array('key'=>13	,'col1'=>'aqzser'		,'subkey'=>'c'	,'value'=>3),
						array('key'=>13	,'col1'=>'aqzser'		,'subkey'=>'d'	,'value'=>5)
				)
		);
	}
}