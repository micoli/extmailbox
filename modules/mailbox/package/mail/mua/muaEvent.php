<?php
use Symfony\Component\EventDispatcher\Event;

class muaEvent extends Event{
	protected $data;

	public function __construct($data){
		$this->data = $data;
	}

	public function getData(){
		return $this->data;
	}
}