<?php
class CW_ToolsCSV{

	public static function readCSVToArray($o){
		$filename		= akead('filename'			,$o	, '');
		$mandatoryFormat= akead('mandatoryFormat'	,$o	, null);
		$delimiter		= akead('delimiter'			,$o	, ';');
		$aHeader		= null;

		$fpCsv	= fopen($filename, 'r');
		$aCsv	= array();
		$aErrors= array();
		if ($fpCsv) {
			$line = 0;
			while($aRow  = fgetcsv($fpCsv, 0, $delimiter)){
				if(is_null($aHeader) && $line==0){
					$aHeader	= $aRow;
					$nbCols		= count($aHeader);
					$aHeader	= array_map('trim',$aHeader);
					if(is_array($mandatoryFormat) && $aHeader!=$mandatoryFormat){
						$aErrors[] = sprintf('Wrong columns format, must be [%s] but found [%s] instead',implode(',',$mandatoryFormat),implode(',',$aRow));
						break;
					}
				}elseif($line>0){
					if(count($aRow)!=$nbCols){
						$aErrors[] = 'Wrong number of columns format as line '.($line+1);
					}else{
						$aCsv[] = array_combine($aHeader,$aRow);
					}
				}
				$line++;
			}
		}else{
			$aErrors[] = 'Error opening file '.$filename;
		}
		return array(
				'success'	=> (count($aErrors)==0)	,
				'data'		=> $aCsv				,
				'error'		=> $aErrors
		);
	}
}