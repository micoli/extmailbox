<?php

class ZimbraSoapClient{
	var $soap=null;
	var $soapHeader=null;
	var $authToken = null;
	function __construct($url){
		$this->soapHeader = new SoapHeader('urn:zimbra','context');
		$this->soap = new SoapClient(null, array(
			'location'		=> $url,
			'uri'			=> 'urn:zimbraAccount',
			'trace'			=> 1,
			'exceptions'	=> 1,
			'soap_version'	=> SOAP_1_1,
			'style'			=> SOAP_RPC,
			'use'			=> SOAP_LITERAL
		));
	}

	function auth($authToken,$login=null,$password=null){
		if(is_null($authToken)){
			$soapHeader = new SoapHeader('urn:zimbra','context');
			$params = array(new SoapParam($login,"account"), new SoapParam($password,"password") );
			$result = $this->soap->__soapCall("AuthRequest", $params, null,$soapHeader);
			$this->authToken = $result['authToken'];
		}else{
			$this->authToken = $authToken;
		}
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

	function call($urn,$func,$params){
		$soapHeader = new SoapHeader('urn:zimbra','context',new SoapVar("<ns2:context><authToken>".$this->authToken."</authToken></ns2:context>", XSD_ANYXML));
		//db($params);
		try{
			$this->soap->__soapCall($func, $params, array('uri'=>'urn:'.$urn),$soapHeader);
			$tmp = str_replace('<soap:','<',str_replace('</soap:','</',$this->soap->__getLastResponse()));
			return $this->xml2array($tmp);
		}catch(SoapFault $e){
			$this->debug();
			db($e->getMessage()."#".$e->getCode()."#".$e->getTraceAsString());
		}
	}

	function debug(){
		db($this->soap->__getLastRequest());
		db($this->soap->__getLastResponse());
	}
}