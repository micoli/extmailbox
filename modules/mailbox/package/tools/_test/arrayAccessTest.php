<?php
	use qd\tools\arrays\ArrayAccess;
	include "../arrays/ArrayAccess.php";

	$a=array(
		'a'=> array(
			'a'=>array('a'=>'val aaa','b'=>'val aab','c'=>'val aac'),
			'b'=>array('a'=>'val aba','b'=>'val abb','c'=>'val abc'),
			'c'=>array('a'=>'val aca','b'=>'val acb','c'=>'val acc')
		),
		'b'=> array(
			'a'=>array('a'=>'val baa','b'=>'val bab','c'=>'val bac'),
			'b'=>array('a'=>'val bba','b'=>'val bbb','c'=>'val bbc'),
			'c'=>array('a'=>'val bca','b'=>'val bcb','c'=>'val bcc')
		),
		'c'=> array(
			'a'=>array('a'=>'val caa','b'=>'val cab','c'=>'val cac'),
			'b'=>array('a'=>'val cba','b'=>'val cbb','c'=>'val cbc'),
			'c'=>array('a'=>'val cca','b'=>'val ccb','c'=>'val ccc')
		),
		'd'=>new \stdClass()
	);

	function testGet($a,$key,$default=null,$separator='.'){
		print "-----------------\n";
		print "$key => $default\n";
		var_dump(ArrayAccess::get($a,$key,$default,$separator));
		print "\n\n";
	}

	function testSet(&$a,$key,$value,$separator='.'){
		print "-----------------\n";
		print "$key => $value\n";
		var_dump(ArrayAccess::set($a,$key,$value,$separator));
		print "val =>";
		var_dump(ArrayAccess::get($a,$key,null,$separator));
		print_r($a['c']['a']);
		print "\n\n";
	}

	//testGet($a,'a.b',1);
	//testGet($a,'a.b.c',1);
	//testGet($a,'a.b.c.a',1);
	//testGet($a,'d.a',1);
	//testGet($a,'z.a',1);
	testSet($a,'c.b.d',"val abcd");
	testSet($a,'c.a.d.a.a.a.a',"val abcd");
	print_r($a);
	testGet($a,'c.a.d.a',"--");
