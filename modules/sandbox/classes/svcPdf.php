<?php
//define('DOMPDF_ENABLE_AUTOLOAD',false);
require_once(QD_PATH_3RD_PHP.'html2pdf/html2pdf.php');
require_once(QD_PATH_3RD_PHP.'dompdf/dompdf_config.inc.php');
require_once(QD_PATH_3RD_PHP.'PHP-Parser/lib/bootstrap.php');

class svcPdf {

	public function pub_autoloadGenerator($o){
		header('Content-Type: text/html');
		$root = QD_PATH_3RD_PHP.'dompdf/';
		$aPhp = QDFS::rglob('*.php',$root);
		$aClasses=array();
		foreach($aPhp as $file){
			$phpSource = file_get_contents($file);
			$parser = new PHPParser_Parser(new PHPParser_Lexer);
			$nodeDumper = new PHPParser_NodeDumper;
			try {
				$stmts = $parser->parse($phpSource);
				$dump = $nodeDumper->dump($stmts);
				foreach($stmts as $item){
					if(is_object($item) && in_array(get_class($item),array('PHPParser_Node_Stmt_Class','PHPParser_Node_Stmt_Interface')) ){
						$aClasses[$item->name]=trim(str_replace($root,'',$file));
					}
				}
			} catch (PHPParser_Error $e) {
				//echo 'Parse Error: ', $e->getMessage();
			}
		}
		var_export($aClasses);
	}

	function pub_testHtml2Pdf($o){
		header('Content-Type: text/html');
		$tplName=$o['pdfhtml'];
		$txt = file_get_contents($tplName);
		//die($txt);
		try{
			$html2pdf = new HTML2PDF('P', 'A4', 'fr',true);
			$html2pdf->pdf->SetDisplayMode('fullpage');
			$html2pdf->writeHTML($txt, isset($_GET['vuehtml']));
			header('Content-Type: application/pdf');
			$html2pdf->Output(dirname(__FILE__).'/../sepa.pdf');
		}catch(HTML2PDF_exception $e) {
			echo $e;
			exit;
		}
	}

	function pub_testDomPdf($o){
		header('Content-Type: text/html');
		$tplName=$o['pdfhtml'];
		$txt = file_get_contents($tplName);
		//die($txt);
		try{
			$dompdf = new DOMPDF();
			$dompdf->load_html($txt);
			$dompdf->set_base_path(dirname($tplName));
			$dompdf->set_paper('A4', 'portrait');
			$dompdf->render();
			header('Content-Type: application/pdf');
			print $dompdf->output(array("compress" => 1));
			die();
		}catch(HTML2PDF_exception $e) {
			header('Content-Type: text/html');
			echo $e;
			exit;
		}

	}
}