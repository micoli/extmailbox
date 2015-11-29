<?php
namespace qd\tools\xml;
use qd\tools\xml\Array2XML;
use qd\tools\xml\XML2Array;

class xmlConvert{
	public static function array2xml($a){
		return Array2XML::convert($a);
	}

	public static function xml2array($xml){
		return XML2Array::createArray($xml);
	}
}