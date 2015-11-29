<?php
namespace qd\tools\arrays;

class ArrayAccess{
	public static function get($a,$key,$default=null,$separator='.'){
		foreach(explode($separator,$key) as $key){
			if(is_array($a) && array_key_exists($key,$a)){
				$a=$a[$key];
			}else{
				return $default;
			}
		}
		return $a;
	}

	public static function set(&$a,$key,$value,$separator){
		$f = false;
		foreach(explode($separator,$key) as $key){
			if(is_array($a)){
				$f=true;
				if(!array_key_exists($key,$a)){
					$a[$key]=array();
				}
				$a=&$a[$key];
			}else{
				return -1;
			}
		}
		if($f){
			$a=$value;
			return 1;
		}
		return -2;
	}
}
