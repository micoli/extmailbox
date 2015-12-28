<?php
namespace qd\mail\mua\imapConnector\zimbra;
use qd\tools\xml\xmlConvert;

class ZimbraSoapClient extends \SoapClient{
	var $soapHeader	= null;
	var $authToken 	= null;

	function __construct($url){
		$this->soapHeader = new \SoapHeader('urn:zimbra','context');
		parent::__construct(null, array(
			'location'		=> $url,
			'uri'			=> 'urn:zimbraAccount',
			'trace'			=> 1,
			'exceptions'	=> 1,
			'soap_version'	=> SOAP_1_1,
			'style'			=> SOAP_RPC,
			'use'			=> SOAP_LITERAL
		));
	}

	function setAuthToken($authToken){
		$this->authToken = $authToken;
	}

	function auth($authToken,$login=null,$password=null){
		if(is_null($authToken)){
			$soapHeader = new \SoapHeader('urn:zimbra','context');
			$params = array(ZimbraSoapClient::SoapVarArray(array(
				'account'	=> $login,
				'password'	=> $password,
			)));
			$result = $this->__soapCall("AuthRequest", $params, null,$soapHeader);
			if(array_key_exists('authToken',$result)){
				$this->authToken = $result['authToken'];
				return $this->authToken;
			}else{
				return false;
			}
		}else{
			$params = array(ZimbraSoapClient::SoapVarArray(array(
				'authToken'=>array(
					'@verifyAccount'	=> 1,
					'%'					=> $authToken
				)
			)));
			try{
				$result = $this->__soapCall("AuthRequest", $params, null,$soapHeader);
				$this->authToken = $result['authToken'];
				return $this->authToken;
			}catch(SoapFault $e){
				if($e->getMessage()=='no valid authtoken present'){
					return $this->auth(null,$login,$password);
				}
				throwException($e);
			}
		}
	}

	public static function _mapAttr(&$a1,$key,$kval=false){
		$a2 = $a1;
		$a1 = array();
		foreach($a2 as $v){
			if($kval){
				$vvv = $v[$kval];
				if($vvv==='FALSE'){
					$vvv=false;
				}
				if($vvv==='TRUE'){
					$vvv=true;
				}
			}else{
				$vvv = $v;
			}
			$a1[$v[$key]]=$vvv;
		}
	}

	/*public function extractAttr($arr,$mainK,$sKeyName){
		$aResult=array();
		if(is_array($arr) && array_key_exists($mainK,$arr)){
			foreach($arr[$mainK] as $kk=>$vv){
				if(substr($kk,-5)=='_attr'){
					$vvv = $arr[$mainK][str_replace('_attr','',$kk)];
					if($vvv==='FALSE'){
						$vvv=false;
					}
					if($vvv==='TRUE'){
						$vvv=true;
					}
					$aResult[$vv[$sKeyName]]=$vvv;
				}
			}
		}
		return $aResult;
	}*/

	function call($urn,$func,$params=array(),$returnXmlWithAttr=false,$withException=false){
		$soapHeader = new \SoapHeader('urn:zimbra','context',new \SoapVar("<ns2:context><authToken>".$this->authToken."</authToken></ns2:context>", XSD_ANYXML));
		//db($params);
		try{
			$this->__soapCall($func, $params, array('uri'=>'urn:'.$urn),$soapHeader);
			$tmp = str_replace('<soap:','<',str_replace('</soap:','</',$this->__getLastResponse()));
			return ($returnXmlWithAttr)?xmlConvert::xml2array($tmp):$this->xml2array($tmp);
		}catch(SoapFault $e){
			if($withException){
				throw $e;
			}else{
				$this->debug();
				db($e->getMessage()."#".$e->getCode()."#".$e->getTraceAsString());
			}
		}catch(Exception $e){
			db("##".$e->getMessage()."#".$e->getCode()."#".$e->getTraceAsString());
		}
	}

	public static function SoapVarArray($a){
		//db(\xmlConvert::array2xml($a));die();
		return new \SoapVar(xmlConvert::array2xml($a), XSD_ANYXML);
	}

	private function fmtXml($xmlStr){
		$dom = new \DOMDocument;
		$dom->preserveWhiteSpace = FALSE;
		$dom->loadXML($xmlStr);
		$dom->formatOutput = TRUE;
		return $dom->saveXml();
	}

	function debug(){
		db($this->fmtXml($this->__getLastRequest()));
		db($this->fmtXml($this->__getLastResponse()));
	}

	private function normalizeSimpleXML($obj, &$result) {
		$data = $obj;
		if (is_object($data)) {
			$data = get_object_vars($data);
		}
		if (is_array($data)) {
			foreach ($data as $key => $value) {
				$res = null;
				$this->normalizeSimpleXML($value, $res);
				if (($key == '@attributes') && ($key)) {
					$result = $res;
				} else {
					$result[$key] = $res;
				}
			}
		} else {
			$result = $data;
		}
	}

	function xml2array($xml) {
		$this->normalizeSimpleXML(simplexml_load_string($xml), $result);
		return $result;
	}
}