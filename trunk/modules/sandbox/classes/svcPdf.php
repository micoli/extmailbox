<?php
require_once(dirname(__FILE__).'/html2pdf/html2pdf.php');
class svcPdf{
	function pub_testHtml2Pdf($o){
		header('Content-Type: text/html');
		$txt = file_get_contents(dirname(__FILE__).'/../sepa.html');
		//die($txt);
		try{
			$html2pdf = new HTML2PDF('P', 'A4', 'fr',true);
			$html2pdf->pdf->SetDisplayMode('fullpage');
			$html2pdf->writeHTML($txt, isset($_GET['vuehtml']));
			$html2pdf->Output(dirname(__FILE__).'/../sepa.pdf');
		}catch(HTML2PDF_exception $e) {
			echo $e;
			exit;
		}

	}
}