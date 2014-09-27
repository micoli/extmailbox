<?php
class svcTest{
	function pub_testimap($o){
		//http://localhost/extmailbox_local/proxy.php?exw_action=local.test.testimap&account=micoli@ms
		class_exists('QDServiceLocatorRoundcube');
		putenv('RCUBE_CONFIG_PATH=/Users/o.michaud/Documents/workspace/roundcubemail/config/');
		define('RCUBE_CONFIG_DIR', '/Users/o.michaud/Documents/workspace/roundcubemail/config/');

		$rcube = qdrcube::get_instance(rcube::INIT_WITH_DB);
		$rcube->set_user(new rcube_user(1));//$_SESSION['user_id']
		$rcCubeimap = $rcube->get_storage();
		$rcCubeimap->connect('localhost',$GLOBALS['conf']['imapMailBox']['accounts'][$o['account']]['user'],$GLOBALS['conf']['imapMailBox']['accounts'][$o['account']]['pass']);
		$a = $rcCubeimap->list_messages('INBOX');
		db($a);
	}

	function pub_test($o){
		// http://localhost:8983/solr/semanticForm/update?stream.body=%3Cdelete%3E%3Cquery%3E*:*%3C/query%3E%3C/delete%3E&commit=true
		// curl -X POST  --data-urlencode "html@docbaiesvitree.html" "http://localhost:8080/?mode=html"
		// curl -s http://www.123devis.com/blog/installer-des-baies-vitrees-en-pvc/ | curl -X POST  --data-urlencode html@- "http://localhost:8080/?mode=html"


		$solr = new Apache_Solr_Service('localhost', 8983, '/solr/semanticForm/'); //or explicitly new Apache_Solr_Service('localhost', 8180, '/solr')
		$document = new Apache_Solr_Document();
		$document->id = uniqid(); //or something else suitably unique
		$document->title = 'Some Title22s';
		$document->content = 'Some content for this wonderful document. Blah blah blah.';
		db(__LINE__);
		$solr->addDocument($document);
		db(__LINE__);
		$solr->commit(); //commit to see the deletes and the document
		db(__LINE__);
		$solr->optimize(); //merges multiple segments into one
		db(__LINE__);

		//and the one we all care about, search!
		//any other common or custom parameters to the request handler can go in the
		//optional 4th array argument.
		db(1);
		db($solr->search('content:blah', 0, 10));
	}

	function pub_compare($o){
		// http://localhost:8983/solr/semanticForm/update?stream.body=%3Cdelete%3E%3Cquery%3Etitle:text-2-compare%3C/query%3E%3C/delete%3E&commit=true
		// curl -s -X POST  --data-urlencode "html@docbaiesvitree.html" "http://localhost:8984/?mode=html"
		// curl -s -X POST  --data-urlencode "html@docbaiesvitree.html" "http://localhost:8984/?mode=html" | iconv -f ISO-8859-1 -t UTF-8
		// curl -s http://www.123devis.com/blog/installer-des-baies-vitrees-en-pvc/ | curl -X POST  --data-urlencode html@- "http://localhost:8984/?mode=html"

		$id='';
		$solr = new Apache_Solr_Service('localhost', 8983, '/solr/semanticForm/');
		if($id==''){
			$id = uniqid();
			$document = new Apache_Solr_Document();
			$document->id = $id; //or something else suitably unique
			$document->title = 'text-2-compare'.$document->id;
			//$document->content = file_get_contents(__DIR__.'/test/docbaiesvitree.html');
			$document->content = file_get_contents(__DIR__.'/test/docbaiesvitree.txt');
			$solr->addDocument($document);
			$solr->commit(); //commit to see the deletes and the document
			$solr->optimize(); //merges multiple segments into one
		}
		db($id);

		$results = $solr->search('id:'.$id, 0, 10,array(
			'mlt'=>'true',
			'mlt.fl'=>'content',
			'mlt.mindf'=>'1',
			'mlt.mintf'=>'1',
			'fl'=>'cat,id,title,score,content'
		));
		//db($results->moreLikeThis->$id->docs);
		print $results->moreLikeThis->$id->numFound ."found\n";
		foreach ($results->moreLikeThis->$id->docs as $doc){
			print $doc->id.' '.$doc->title[0]."\n";
		}

		$solr->deleteById($id, 0, 10);
		$solr->commit(); //commit to see the deletes and the document
	}

	function pub_import($o){
		//$solr = new Apache_Solr_Service('localhost', 8983, '/solr/semanticForm/'); //or explicitly new Apache_Solr_Service('localhost', 8180, '/solr')
		$QDDb = new QDDB();
		setlocale(LC_ALL, 'fr_FR.UTF-8');
		$arr = $QDDb->query2Array(sprintf('select * from test.article a
inner join test.cat c on SUBSTRING_INDEX(a.idActs, ",", 1)=c.id
where content !=""'));
		foreach($arr as $record){
			//db(utf8_encode($record['content']));
			preg_match_all('!activity="([0-9]*)"!',$record['content'],$m);
			$record['content'] = preg_replace('!\[(.*?)\]!','',$record['content']);
			$record['content'] = preg_replace('!<a(.*?)\/a>!','',$record['content']);
			$record['content'] = str_replace("\n"," ",$record['content']);
			$record['content'] = str_replace("\r"," ",$record['content']);
			$record['content'] = strip_tags(str_replace("\r"," ",$record['content']));
			$record['content'] = str_replace("\t"," ",$record['content']);
			$record['title'] = str_replace("\n"," ",$record['title']);
			$record['title'] = str_replace("\r"," ",$record['title']);
			$record['title'] = str_replace("|"," ",$record['title']);
			while(strpos($record['content'],'  ')!=false){
				$record['content'] = str_replace("  "," ",$record['content']);
			}
			$record['idActs'];
			$record['allIds']=implode(',',array_unique($m[1]));
			$record['idActs']=$record['allIds'];
			//print implode('|',$record)."\n";
			$record['content'] = iconv('ISO-8859-1', 'UTF-8',$record['content']);
			$record['title']=str_replace(array(':','?','/','\\'),array('','','',''),iconv('ISO-8859-1','ASCII//IGNORE',$record['title']));		$document->id = uniqid(); //or something else suitably unique
			/*$document = new Apache_Solr_Document();
			$document->id = uniqid();
			$document->title = $record['title'];
			$document->content = $record['content'];
			$document->cat = explode(',',$record['allIds']);
			$solr->addDocument($document);
			$solr->commit(); //commit to see the deletes and the document
			*/
			@mkdir(__DIR__.'/mahout/arts/'.$record['cat']);
			file_put_contents(__DIR__.'/mahout/arts/'.$record['cat'].'/'.$record['title'], $record['content']);
			/*foreach(array_unique($m[1]) as $id){
				@mkdir(__DIR__.'/mahout/arts/'.$id);
				file_put_contents(__DIR__.'/mahout/arts/'.$id.'/'.$record['id'].'-'.$record['title'], $record['content']);
			}*/
			//die();
			db($record);
			unset($record['allIds']);
			//$QDDb->dbUpdate("test.article", array_keys($record),array_values($record),'id='.$record['id']);
		}
		//$solr->optimize(); //merges multiple segments into one
	}
	function pub_importscq($o){
		$QDDb = new QDDB();
		setlocale(LC_ALL, 'fr_FR.UTF-8');
		$arr = $QDDb->query2Array(sprintf('select * from test.scq'));
		$n=0;
		foreach($arr as $record){
			$record['content'] = iconv('UTF-8', 'ISO-8859-1',$record['content']);
			$record['content'] = preg_replace('!\[(.*?)\]!','',$record['content']);
			$record['content'] = preg_replace('!<a(.*?)\/a>!','',$record['content']);
			$record['content'] = str_replace("\n"," ",$record['content']);
			$record['content'] = str_replace("\r"," ",$record['content']);
			$record['content'] = strip_tags(str_replace("\r"," ",$record['content']));
			$record['content'] = str_replace("\t"," ",$record['content']);
			$record['title'] = str_replace("\n"," ",$record['title']);
			$record['title'] = str_replace("\r"," ",$record['title']);
			$record['title'] = str_replace("|"," ",$record['title']);
			while(strpos($record['content'],'  ')!=false){
				$record['content'] = str_replace("  "," ",$record['content']);
			}
			$record['content'] = iconv('ISO-8859-1', 'UTF-8',$record['content']);
			$record['title']=str_replace(array(':','?','/','\\'),array('','','',''),iconv('ISO-8859-1','ASCII//IGNORE',$record['title']));		$document->id = uniqid(); //or something else suitably unique
			@mkdir('/tmp/mahout/arts/'.$record['cat']);
			file_put_contents('/tmp/mahout/arts/'.$record['cat'].'/'.($n++), $record['content']);
		}
	}
	function pub_importwsm($o){
		$QDDb = new QDDB();
		setlocale(LC_ALL, 'fr_FR.UTF-8');
		$arr = $QDDb->query2Array(sprintf('select * from test.wsm_posts where post_type not in ("page","post")'));
		/*foreach($arr as $record){
			$a = array('post_acts'=>'');
			if(preg_match_all('!activity="([0-9]*)"!',utf8_decode($record['post_content']),$m)){
				$a['post_acts']=implode(',',array_unique($m[1]));
				db($a['post_acts']);
				$QDDb->dbUpdate("test.wsm_posts", array_keys($a),array_values($a),'id='.$record['id']);
			}
		}
		die();*/
		$n=0;
		foreach($arr as $record){
			//$record['post_content'] = iconv('UTF-8', 'ISO-8859-1',$record['post_content']);
			$record['post_content'] = preg_replace('!\[(.*?)\]!','',$record['post_content']);
			$record['post_content'] = preg_replace('!<a(.*?)\/a>!','',$record['post_content']);
			$record['post_content'] = str_replace("\n"," ",$record['post_content']);
			$record['post_content'] = str_replace("\r"," ",$record['post_content']);
			$record['post_content'] = strip_tags(str_replace("\r"," ",$record['post_content']));
			$record['post_content'] = str_replace("\t"," ",$record['post_content']);
			$record['post_title'] = str_replace("\n"," ",$record['post_title']);
			$record['post_title'] = str_replace("\r"," ",$record['post_title']);
			$record['post_title'] = str_replace("|"," ",$record['post_title']);

			$record['post_content'] = str_replace("\n"," ",str_replace("\r"," ",$record['post_content']));

			while(strpos($record['post_content'],'  ')!=false){
				$record['post_content'] = str_replace("  "," ",$record['post_content']);
			}
			$record['post_content'] = iconv('ISO-8859-1', 'UTF-8',$record['post_content']);
			$record['post_title']=str_replace(array(':','?','/','\\'),array('','','',''),$record['post_title']);
			@mkdir('/tmp/mahout/arts/'.$record['post_type']);
			db($record);
			file_put_contents('/tmp/mahout/arts/'.$record['post_type'].'/'.($n++), $record['post_title']." ".$record['post_content']." ".utf8_encode(str_replace("|",",",$record['post_terms'])));
		}
	}

	public function pub_test($o){
		$sleep=0+$o['sleep'];
		sleep($sleep);
		return array('sleep'=>$sleep);
	}
}
