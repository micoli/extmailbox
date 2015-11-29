<?php
namespace qd\mail\mua\senderConnector;

class smMailMessage {
	static private $struct=null;

	public $_from			='';
	public $_fromName		='';

	public $_sender			='';
	public $_replyTo		='';

	public $_to				= array();
	public $_cc				= array();
	public $_bcc			= array();

	public $_attachments	= array();

	public $_subject		='';
	public $_HTMLBody		='';

	public static function init(){
		self::$struct=array();
		foreach(get_class_vars(__CLASS__) as $var=>$prop){
			if(preg_match('!^_(.*)$!',$var,$m)){
				self::$struct[strtolower($m[1])]=$m[1];
			}
		}
	}

	/**
	 *
	 * @return smMailMessage
	 */
	public static function create(){
		return new smMailMessage();
	}

	public function __construct(){
		return $this;
	}

	public function __get($k){
		$k=strtolower(trim($k));
		if(array_key_exists($k,self::$struct)){
			$var = '_'.self::$struct[$k];
			return $this->$var;
		}
	}

	public function __set($k,$v){
		$k=strtolower(trim($k));
		return $this->set(array($k=>$v));
	}

	public function serialize(){
		$t = array();
		foreach(self::$struct as $var){
			$vvar = '_'.$var;
			$t[$var]=$this->$vvar;
		}
		return json_encode($t);
	}

	/**
	 *
	$a = array(
		'account'		=> '',
		'from'			=> '',
		'fromName'		=> '',
		'sender'		=> '',
		'replyTo'		=> '',
		'subject'		=> '',
		'HTMLBody'		=> '',
		'attachmentBase'=> '',
		'attachments'	=> array('','',''),
		'attachments'	=> '',
		'to','cc','bcc'	=> array('toto@titi.com','titi@toto.com',array('email'=>'toto@titi.com','name'=>'toto')),
		)
	 */

	public function set(array $o){
		foreach($o as $k=>$v){
			switch($k){
				case 'account'	:
				case 'from'		:
				case 'fromName'	:
				case 'sender'	:
				case 'replyTo'	:
				case 'subject'	:
				case 'HTMLBody'	:
					$var = '_'.$k;
					$this->$var=$v;
				break;
				case 'attachment':
					$this->addAttachment($v,akead('attachmentBase',$o,null));
				break;
				case 'to':
				case 'cc':
				case 'bcc':
					$this->addAddress($k,$v);
				break;
			}
		}
		return $this;
	}

	public function addAddress($type,$email,$name=null){
		if(is_object($email)){
			$email=(array)$email;
		}elseif(is_string($email)){
			if (strpos($email, ';') !== false){
				$email = str_replace(';',',',$email);
			}

			if(strpos($email,',')!==false){
				$email = explode(';',$email);
			}
		}
		if(is_array($email)){
			if(array_key_exists('email',$email)){
				$this->addAddress($type,$email['email'], akead('name',$email,null));
			}else{
				foreach($email as $k=>$v){
					if(is_object($v)){
						$v=(array)$v;
					}
					$this->addAddress($type,$v['email'], akead('name',$v,null));
				}
			}
			return $this;
		}else{
			$aAddress=array('email'=>$email);
			if(!is_null($name)){
				$aAddress['name']=$name;
			}
		}
		$var = '_'.strtolower($type);
		array_unshift($this->$var,$aAddress);
		return $this;
	}

	public function addAttachment($fileName,$base=null){
		if(is_array($fileName)){
			foreach($fileName as $vv){
				$this->addAttachment($vv,$base);
			}
		}else{
			$attachments[]= (isnull($base)?$base.'/':'').$filename;
		}
		return $this;
	}

	public function HtmlToTextBody($body=null){
		if(is_null($body)){
			$body = $this->_HTMLBody;
		}
		$lastligne='';
		$tmpBody = utf8_decode($body); // on decode les caracteres encodés en utf-8 vers ISO-8859-1
		$tmpBody = preg_replace('!<title>(.*?)</title>!','',$tmpBody);

		$tmpBody = preg_replace('!<a href(.*?)alt="(.*?)"(.*?)>(.*?)</a>!',"\\2",$tmpBody);

		$tmpBody = strip_tags($tmpBody);
		$tmpBody = str_replace("\r","",$tmpBody);
		$tmpBodyArr=array();
		foreach(explode("\n",$tmpBody) as $ligne){
			$ligne = trim($ligne);
			if (!($ligne=='' && $lastligne=='')){
				$ligne = str_replace('&#149;','-',$ligne);
				$tmpBodyArr[]=html_entity_decode($ligne);
			}
			$lastligne = $ligne;
		}
		return join("\n",$tmpBodyArr);
	}

}
smMailMessage::init();