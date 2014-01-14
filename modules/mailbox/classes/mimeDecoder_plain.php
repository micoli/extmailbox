<?php
class mimeDecoder_plain{
	static function decode($data,$charset,&$o,&$attachments){
		if($charset=='unknown'){
			$charset=mb_detect_encoding($data);
		}
		return "<pre>".iconv(strtoupper($charset),'UTF-8',$data)."</pre>";
	}
}