<?php
class mimeDecoder_html{
	static function decode($body,$charset,&$o,&$attachments){
		if($charset=='unknown'){
			$body = utf8_encode($body);//$charset='ISO-8859-1';
		}else{ //if ( (strtoupper($charset)!='UTF-8')){
			$body= iconv(strtoupper($charset),'UTF-8',$data); // //TRANSLIT
		}
		$o['hasInlineComponents'] = false;

		foreach($attachments as &$f){
			if(array_key_exists('id',$f) && $f['id']!='-'){
				$body = preg_replace('!src=(?:"|\')cid:'.preg_quote($f['id'],'!').'(?:"|\')!','src="'.$f['attachUrlLink'].'"',$body);
				$o['hasInlineComponents'] = true;
			}
		}

		if(preg_match('!src=(?:"|\')([^\'"]*)(?:"|\')!',$body)){
			$body = preg_replace('!src=(?:"|\')([^\'"]*)(?:"|\')!', 'src="" data-imgsafesrc="\\1"',$body );
			$o['hasInlineComponents'] = true;
		}

		return $body;
	}
}