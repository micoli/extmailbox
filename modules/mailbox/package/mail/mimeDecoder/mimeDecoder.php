<?php
namespace qd\mail\mimedecoder;

class mimeDecoder{
	static function decode($type,$data,$charset,&$o,&$attachments,&$head,&$outStruct){
		$className='qd\mail\mimedecoder\mimeDecoder_'.strtolower($type);
		if(class_exists($className)){
			return $className::decode($data,$charset,$o,$attachments);
		}else{
			return	'<b>type</b>	:<br><pre>'.print_r($type,true)."</pre>".
					'<b>head</b>	:<br><pre>'.print_r($head,true)."</pre>".
					'<b>struct</b>	:<br><pre>'.print_r($outStruct,true)."</pre>";
		}
	}
}
?>