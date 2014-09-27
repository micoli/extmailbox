<?php
die();
$a = glob('*/*.load.json');
//$a = glob('Ext.ux.grid.CellActions/*.load.json');
foreach($a as $file){
	$aFinal=array(
		'require'	=> array(),
		'js'		=> array(),
		'css'		=> array()
	);
	$aJs	= glob(dirname($file).'/*.js'	);
	$aCss	= glob(dirname($file).'/*.css'	);
	foreach($aJs as $f){
		$aFinal['js'][]=basename($f);
		$sJsContent = file_get_contents($f);
		print_r($f."\n");
		if(preg_match_all('!Ext\.extend\((.*?),(.*?),!',$sJsContent,$aMatches,PREG_SET_ORDER)){
			foreach($aMatches as $match){
				$aFinal['require'][]=trim($match[2]);
			}
		}else{
			if(preg_match_all('!((.*)=\s*)*Ext\.extend\((.*?),!',$sJsContent,$aMatches,PREG_SET_ORDER)){
				foreach($aMatches as $match){
					$aFinal['require'][]=trim($match[3]);
				}
			}
		}
		$aFinal['require']=array_unique($aFinal['require']);
	}
	foreach($aCss as $f){
		$aFinal['css'][]=basename($f);
	}
	file_put_contents($file,str_replace('    ',"\t",json_encode($aFinal,JSON_PRETTY_PRINT)));
}