<?php
class svcRest{
	/*
	method
	url
	authentificationType
	authentificationBasic.login
	authentificationBasic.password
	headers.key/value
	parameters.key/value
	*/
	public function pub_rest($o){
		$reqBody = file_get_contents('php://input');
		if(empty($reqBody)){
			$reqBody = urldecode($_SERVER['QUERY_STRING']);
			$reqBody = substr($reqBody,strpos($reqBody,'{'));
			$reqBody = substr($reqBody,0,strrpos($reqBody,'}')+1);
		}
		$prm = json_decode($reqBody,true);
		header('Content-type:text/html');
		//db($prm);
		$client = new GuzzleHttp\Client();
		try{
			$request = $client->createRequest($prm['method'],$prm['url'],array(
				'config' => array(
					'curl' => array(
						CURLOPT_SSL_VERIFYHOST=> false,
						CURLOPT_SSL_VERIFYPEER=> false
					)
				)
			));

			if($prm['authentificationType']=='basic' && $prm['authentificationBasic']['login']!=''){
				$client->setDefaultOption('auth', array(
					$prm['authentificationBasic']['login'],
					$prm['authentificationBasic']['password'],
					'Basic'
				));
			}

			if(is_array($prm['headers'])){
				foreach($prm['headers'] as $header){
					$request->addHeader(['key'],$header['value']);
				}
			}

			/*Query*/
			$query = new GuzzleHttp\Query();
			if(is_array($prm['parameters'])){
				foreach($prm['parameters'] as $parameter){
					$query->set($parameter['key'],$parameter['value']);
				}
			}
			if($query->count()>0){
				$request->setQuery($query);
			}

			try{
				$response	= $client->send($request);
				$responseHeaders=$response->getHeaders();
				//$responseHeaders['Content-Type'] = array('application/htsml; charset=utf-8');
				$aResult	= array(
					'request_headers'	 => $request->getHeaders(),
					'status_code'		 => $response->getStatusCode(),
					'response_headers'	 => $responseHeaders,
					'body'				 => base64_encode($response->getBody())
				);
				return $aResult;
			}catch(GuzzleHttp\Exception\ServerException $e){
				print '<b>'.$e->getCode().'</b>';
				print $e->getMessage();
				print "<pre>";
				print_r($response);
				print_r($prm);
				print_r($query);
				print_r($request);
				print "<pre>";
			}catch(Exception $e){
				print '<b>'.$e->getCode().'</b>';
				print $e->getMessage();
				print "<pre>";
				print_r($response);
				print_r($prm);
				print_r($query);
				print_r($request);
				print "<pre>";
			}
		}catch(\InvalidArgumentException $e){
			return array (
				'success' => false,
				'error' => $e->getMessage ()
			);
		}
	}
}