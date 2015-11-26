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

	public function extractAttr($arr,$mainK,$sKeyName){
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

	function call($urn,$func,$params=array(),$returnXmlWithAttr=false){
		$soapHeader = new SoapHeader('urn:zimbra','context',new SoapVar("<ns2:context><authToken>".$this->authToken."</authToken></ns2:context>", XSD_ANYXML));
		//db($params);
		try{
			$this->soap->__soapCall($func, $params, array('uri'=>'urn:'.$urn),$soapHeader);
			$tmp = str_replace('<soap:','<',str_replace('</soap:','</',$this->soap->__getLastResponse()));
			return ($returnXmlWithAttr)?$this->xml2arrayFull($tmp):$this->xml2array($tmp);
		}catch(SoapFault $e){
			$this->debug();
			db($e->getMessage()."#".$e->getCode()."#".$e->getTraceAsString());
		}
	}
	public static function SoapVarArray($a){
		db(ArrayToXML::convert($a));die();
		return new SoapVar(ArrayToXML::convert($a), XSD_ANYXML);
	}

	public static function array_to_objecttree($array) {
		if (is_numeric(key($array))) { // Because Filters->Filter should be an array
			foreach ($array as $key => $value) {
				$array[$key] = self::array_to_objecttree($value);
			}
			return $array;
		}
		$Object = new stdClass;
		foreach ($array as $key => $value) {
			if (is_array($value)) {
				$Object->$key = self::array_to_objecttree($value);
			}  else {
				$Object->$key = $value;
			}
		}
		return $Object;
	}
	private function fmtXml($xmlStr){
		$dom = new DOMDocument;
		$dom->preserveWhiteSpace = FALSE;
		$dom->loadXML($xmlStr);
		$dom->formatOutput = TRUE;
		return $dom->saveXml();
	}
	function debug(){
		db($this->fmtXml($this->soap->__getLastRequest()));
		db($this->fmtXml($this->soap->__getLastResponse()));
	}

	function xml2arrayFull($contents, $get_attributes=1, $priority = 'tag') {
		if(!$contents) return array();

		if(!function_exists('xml_parser_create')) {
			//print "'xml_parser_create()' function not found!";
			return array();
		}

		//Get the XML parser of PHP - PHP must have this module for the parser to work
		$parser = xml_parser_create('');
		xml_parser_set_option($parser, XML_OPTION_TARGET_ENCODING, "UTF-8"); # http://minutillo.com/steve/weblog/2004/6/17/php-xml-and-character-encodings-a-tale-of-sadness-rage-and-data-loss
		xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
		xml_parser_set_option($parser, XML_OPTION_SKIP_WHITE, 1);
		xml_parse_into_struct($parser, trim($contents), $xml_values);
		xml_parser_free($parser);

		if(!$xml_values) return;//Hmm...

		//Initializations
		$xml_array = array();
		$parents = array();
		$opened_tags = array();
		$arr = array();

		$current = &$xml_array; //Refference

		//Go through the tags.
		$repeated_tag_index = array();//Multiple tags with same name will be turned into an array
		foreach($xml_values as $data) {
			unset($attributes,$value);//Remove existing values, or there will be trouble

			//This command will extract these variables into the foreach scope
			// tag(string), type(string), level(int), attributes(array).
			extract($data);//We could use the array by itself, but this cooler.

			$result = array();
			$attributes_data = array();

			if(isset($value)) {
				if($priority == 'tag') $result = $value;
				else $result['value'] = $value; //Put the value in a assoc array if we are in the 'Attribute' mode
			}

			//Set the attributes too.
			if(isset($attributes) and $get_attributes) {
				foreach($attributes as $attr => $val) {
					if($priority == 'tag') $attributes_data[$attr] = $val;
					else $result['attr'][$attr] = $val; //Set all the attributes in a array called 'attr'
				}
			}

			//See tag status and do the needed.
			if($type == "open") {//The starting of the tag '<tag>'
				$parent[$level-1] = &$current;
				if(!is_array($current) or (!in_array($tag, array_keys($current)))) { //Insert New tag
					$current[$tag] = $result;
					if($attributes_data) $current[$tag. '_attr'] = $attributes_data;
					$repeated_tag_index[$tag.'_'.$level] = 1;

					$current = &$current[$tag];

				} else { //There was another element with the same tag name

					if(isset($current[$tag][0])) {//If there is a 0th element it is already an array
						$current[$tag][$repeated_tag_index[$tag.'_'.$level]] = $result;
						$repeated_tag_index[$tag.'_'.$level]++;
					} else {//This section will make the value an array if multiple tags with the same name appear together
						$current[$tag] = array($current[$tag],$result);//This will combine the existing item and the new item together to make an array
						$repeated_tag_index[$tag.'_'.$level] = 2;

						if(isset($current[$tag.'_attr'])) { //The attribute of the last(0th) tag must be moved as well
							$current[$tag]['0_attr'] = $current[$tag.'_attr'];
							unset($current[$tag.'_attr']);
						}

					}
					$last_item_index = $repeated_tag_index[$tag.'_'.$level]-1;
					$current = &$current[$tag][$last_item_index];
				}

			} elseif($type == "complete") { //Tags that ends in 1 line '<tag />'
				//See if the key is already taken.
				if(!isset($current[$tag])) { //New Key
					$current[$tag] = $result;
					$repeated_tag_index[$tag.'_'.$level] = 1;
					if($priority == 'tag' and $attributes_data) $current[$tag. '_attr'] = $attributes_data;

				} else { //If taken, put all things inside a list(array)
					if(isset($current[$tag][0]) and is_array($current[$tag])) {//If it is already an array...

						// ...push the new element into that array.
						$current[$tag][$repeated_tag_index[$tag.'_'.$level]] = $result;

						if($priority == 'tag' and $get_attributes and $attributes_data) {
							$current[$tag][$repeated_tag_index[$tag.'_'.$level] . '_attr'] = $attributes_data;
						}
						$repeated_tag_index[$tag.'_'.$level]++;

					} else { //If it is not an array...
						$current[$tag] = array($current[$tag],$result); //...Make it an array using using the existing value and the new value
						$repeated_tag_index[$tag.'_'.$level] = 1;
						if($priority == 'tag' and $get_attributes) {
							if(isset($current[$tag.'_attr'])) { //The attribute of the last(0th) tag must be moved as well

								$current[$tag]['0_attr'] = $current[$tag.'_attr'];
								unset($current[$tag.'_attr']);
							}

							if($attributes_data) {
								$current[$tag][$repeated_tag_index[$tag.'_'.$level] . '_attr'] = $attributes_data;
							}
						}
						$repeated_tag_index[$tag.'_'.$level]++; //0 and 1 index is already taken
					}
				}

			} elseif($type == 'close') { //End of tag '</tag>'
				$current = &$parent[$level-1];
			}
		}

		return($xml_array);
	}
}