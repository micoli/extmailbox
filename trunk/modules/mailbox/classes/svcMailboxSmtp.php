<?php
class svcMailboxSmtp {

	function pub_sendMail($o){
		$tmpAttachmentsPath = $GLOBALS['conf']['imapMailBox']['tmp'].'/attachments';
		foreach(array('to','cc','bcc','attachments') as $key){
			if(array_key_exists($key,$o)){
				$o[$key]=json_decode(stripslashes($o[$key]));
			}
		}
		if(is_array($o['attachments'])){
			foreach($o['attachments'] as $k=>$v){
				$fullfilename = $tmpAttachmentsPath.'/'.$o['message_id'].'-'.$v;
				$o['attachments'][$k]=array(
					'name'			=> $v,
					'fullfilename'	=> $fullfilename,
					'filesize'		=> @filesize($fullfilename)
				);
			}
		}

		return array_merge(array('ok'=>true),$o);
	}

	function pub_uploadAttachment($o){
		header('Content-Type: text/html, charset=utf-8');
		//db($_FILES);//die();
		//db($o);//die();
		$renameDuplicates=false;
		$success=true;
		$arrErrors=array();
		foreach($_FILES as $k=>$file){
			$tmpAttachmentsPath = $GLOBALS['conf']['imapMailBox']['tmp'].'/attachments';

			if(!file_exists($tmpAttachmentsPath)){
				mkdir($tmpAttachmentsPath);
			}
			$dest		= $tmpAttachmentsPath.'/'.$o['path'].'-';
			$tmp_name	= $file['tmp_name'];
			$origin		= strtolower(basename($file['name']));
			$fulldest	= $dest.$origin;
			$filename	= $origin;

			if($renameDuplicates){
				for ($i=1; file_exists($fulldest); $i++){
					$fileext	= (strpos($origin,'.')===false ? '' : '.'.substr(strrchr($origin, "."), 1));
					$filename	= substr($origin, 0, strlen($origin)-strlen($fileext)).'['.$i.']'.$fileext;
					$fulldest	= $dest . $filename;
				}
			}else{
				if(file_exists($fulldest)){
					unlink($fulldest);
				}
			}
			if (!move_uploaded_file($tmp_name, $fulldest)){
				$arrErrors[$k] = 'can not move upload file';
			}
		}

		if(count($arrErrors)){
			return array('success'	=>$success,'errors'	=>$arrErrors);
		}else{
			return array('success'	=>$success);
		}
	}
}