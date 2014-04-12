<?php
class svcNaivesBayesClassifier{
	function pub_test($o){
		header('Content-Type: text/html');
		$nbc = new NaiveBayesClassifier(array(
				'store' => array(
						'mode'	=> 'redis',
						'db'	=> array(
								'db_host'	=> '127.0.0.1',
								'db_port'	=> '6379',
								'namespace'	=> 'reviews'	// Added to differentiate multiple trainsets
						)
				),
				'debug' => FALSE
		));

		/*echo "Training started.".PHP_EOL;
		$_s = microtime(TRUE);

		$urb = mysql_connect('127.0.0.1', 'root', '');
		mysql_select_db('bayes');

		$sql = "SELECT * FROM reviews";
		$q = mysql_query($sql);
		while($row = mysql_fetch_object($q)) {
		$nbc->train($row->review_text, $row->review_by);
		}

		mysql_close($urb);

		$_e = microtime(TRUE);
		$_t = $_e - $_s;
		echo "Training finished. Took {$_t} seconds.".PHP_EOL;*/

		$_start = 0;
		if(!empty($argv) && count($argv) > 1) {
			$words = "";
			for($i=1, $max=count($argv); $i<$max; $i++) {
				$words .= $argv[$i] . " ";
			}
			echo "Classifier started.".PHP_EOL;
			$_start = microtime(TRUE);

			$offset = 0;
			$row = 10;
			$result = $nbc->classify($words, $row, $offset);

			var_dump($result);
			echo PHP_EOL;
		}
		else {
			die('No arguments passed.'.PHP_EOL);
		}

		$_end = microtime(TRUE);
		echo 	"Memory Usage: ", memory_get_usage(TRUE)/1024, " KB", PHP_EOL,
		"TIME Spent: ", ($_end - $_start), " seconds", PHP_EOL, PHP_EOL;
	}
}