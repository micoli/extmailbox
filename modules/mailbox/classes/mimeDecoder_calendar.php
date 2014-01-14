<?php
class mimeDecoder_calendar{
	static function decode($data,$charset,&$o,&$attachments){
		//$body= iconv(strtoupper($charset),'UTF-8',$data);
		//return $body;
		$data = quoted_printable_decode($data);// utf8_decode(imap_utf8($data)));
		//print ($data);
		//$data = iconv(strtoupper($charset),'CP1250//IGNORE',$data);
		$ical = new iCalReader($data,'string');
		$arr = $ical->events();
		$body = array(
				'ATTENDEE'=>array(),
				'ORGANIZER'=>array()
		);
		if(is_array($arr) && array_key_exists(0,$arr) && is_array($arr[0])){
			foreach($arr[0] as $k=>$v){
				$sk = explode(';',$k);
				$p = array();
				for($i=1;$i<count($sk);$i++){
					$t = explode('=',$sk[$i],2);
					$p[$t[0]]=$t[1];
				}
				$p['VALUE']=stripslashes( $v );
				switch($sk[0]){
					case 'ORGANIZER':
					case 'ATTENDEE':
						$body[$sk[0]][]=$p;
						break;
					default:
						$body[$sk[0]]=$p;
						break;
				}
			}
		}
		//db($arr);
		//db($body);
		return $body;
	}
}