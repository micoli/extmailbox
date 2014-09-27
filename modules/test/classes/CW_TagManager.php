<?php
class_exists('Addendum');
class CW_TagManager_TagConfig extends Annotation{
}

class CW_TagManager{
	static $tagConfigs = array();

	static function getAllTagConfig(){
		$reflection = new ReflectionAnnotatedClass(__CLASS__);
		foreach($reflection->getMethods() as $method){
			if($method->hasAnnotation('CW_TagManager_TagConfig')){
				$anot = $method->getAnnotation('CW_TagManager_TagConfig');
				self::$tagConfigs[$method->name]=json_decode($anot->value,true);
			}
		}
		return self::$tagConfigs;
	}

	/**
	 * @CW_TagManager_TagConfig('
		[{
			"type"		: "text",
			"label"		: "-f1",
			"name"		: "f1"
		},{
			"type"		: "text",
			"label"		: "-f2",
			"name"		: "f2"
		},{
			"type"		: "select",
			"label"		: "-f3",
			"name"		: "f3",
			"values"	: ["aa","bb","cc","dd"]
		},{
			"name"		: "f4"
		},{
			"type"		: "grid",
			"label"		: "-f5",
			"name"		: "f5",
			"fields"	: [{
				"label"		: "c1",
				"name"		: "c1"
			},{
				"label"		: "c2",
				"name"		: "c2"
			},{
				"label"		: "c3",
				"name"		: "c3",
				"type"		: "select",
				"values"	: ["aaa","bbb","ccc","ddd"]
			}]
		},{
			"type"		: "select",
			"label"		: "-f6",
			"name"		: "f6",
			"values"	: ["aa","bb","cc","dd"]
		}]')
	 */
	function tag1(){

	}

	/**
	 * @CW_TagManager_TagConfig('
		[{
			"type"		: "text",
			"label"		: "-f1",
			"name"		: "f11"
		},{
			"type"		: "text",
			"name"		: "f22",
			"label"		: "-f2",
			"multiple"	: 1,
			"values"	: ["aa","bb","cc","dd"]
		}]')
	 */
	function tag2(){

	}
}