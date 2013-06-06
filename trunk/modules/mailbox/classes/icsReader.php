<?php

class icsReader{

	function read($type,$str) {
		db($str);
		if($type=='file'){
			$tmp = file($str, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
		}
		if($type=='string'){
			$tmp = explode("\n",$str);
		}
		if (stristr($lines[0],'BEGIN:VCALENDAR') === false){
			return false;
		}else{

			foreach ($lines as $line) {
				$line = $line;

			}
		}
	}
}
?>