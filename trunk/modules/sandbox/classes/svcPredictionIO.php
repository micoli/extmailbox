<?php
require_once __DIR__."/vendor/autoload.php";
use PredictionIO\PredictionIOClient;

class svcPredictionIO{
	function pub_import($o){
		$client = PredictionIOClient::factory(array(
			//'apiurl' => 'http://localhost:9002',
			"appkey" => "G7ZFqIqeKprw0rjr6fcE4HZWwmgZyLPr7P43XgeA05CLIMpDwhuxsTNP0z2xP0GT"
		));

		// generate 10 users, with user ids 1,2,....,10
		for ($i=1; $i<=10; $i++) {
			echo "Add user ". $i . "\n";
			$command = $client->getCommand('create_user', array('pio_uid' => $i));
			$response = $client->execute($command);
		}

		// generate 50 items, with item ids 1,2,....,50
		// assign type id 1 to all of them
		for ($i=1; $i<=50; $i++) {
			echo "Add item ". $i . "\n";
			$command = $client->getCommand('create_item', array('pio_iid' => $i, 'pio_itypes' => 1));
			$response = $client->execute($command);
		}

		// each user randomly views 10 items
		for ($u=1; $u<=10; $u++) {
			for ($count=0; $count<10; $count++) {
				$i = rand(1, 50); // randomly pick an item
				echo "User ". $u . " views item ". $i ."\n";
				$client->identify($u);
				$client->execute($client->getCommand('record_action_on_item', array('pio_action' => 'view', 'pio_iid' => $i)));
			}
		}

	}

	function pub_test($o){
		$client = PredictionIOClient::factory(array(
			'apiurl' => 'http://localhost:9002',
			"appkey" => "G7ZFqIqeKprw0rjr6fcE4HZWwmgZyLPr7P43XgeA05CLIMpDwhuxsTNP0z2xP0GT"
		));


		// Recommend 5 items to each user
		for ($u=1; $u<=10; $u++) {
			echo "Retrieve top 5 recommendations for user ". $u . "\n";
			try {
				$client->identify($u);
				$rec = $client->execute($client->getCommand('itemrec_get_top_n', array('pio_engine' => '<engine name>', 'pio_n' => 5)));
				print_r($rec);
			} catch (Exception $e) {
				echo 'Caught exception: ',  $e->getMessage(), "\n";
			}
		}
	}
}
$y = new svcPredictionIO();
$y->pub_test($o);
?>