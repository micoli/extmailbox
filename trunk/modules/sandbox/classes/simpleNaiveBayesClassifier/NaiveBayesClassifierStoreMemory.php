<?php
/**
 * Abstract implementation of NaiveBayesClassifierStore for Redis
 *
 * @package	Simple NaiveBayesClassifier for PHP
 * @subpackage	NaiveBayesClassifierStoreRedis
 * @author	Batista R. Harahap <batista@bango29.com>
 * @link	http://www.bango29.com
 * @license	MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */


class NaiveBayesClassifierStoreMemory extends NaiveBayesClassifierStore {

	private $conn;

	private $namespace	= 'nbc-ns';
	private $blacklist 	= 'nbc-blacklists';
	private $words 		= "nbc-words";
	private $sets 		= "nbc-sets";
	private $cache		= "nbc-cache";
	public $delimiter	= "_--%%--_";
	private $wordCount	= "--count--";

	function __construct($conf = array()) {
		if(!empty($conf['namespace']))
			$this->namespace = $conf['namespace'];

		// Namespacing
		$this->blacklist	= "{$this->namespace}-{$this->blacklist}";
		$this->words		= "{$this->namespace}-{$this->words}";
		$this->sets			= "{$this->namespace}-{$this->sets}";
		$this->cache		= "{$this->namespace}-{$this->cache}";
		$this->store=array();

	}

	public function close() {
	}

	public function addToBlacklist($word) {
		$this->store["{$this->blacklist}#{$word}"]=1;
		return true;
	}

	public function removeFromBlacklist($word) {
		$this->store["{$this->blacklist}#{$word}"]=0;;
		return true;
	}

	public function isBlacklisted($word) {
		$res = $this->store["{$this->blacklist}#{$word}"];
		return !empty($res) && $res > 0 ? TRUE : FALSE;
	}

	public function trainTo($word, $set) {
		// Words
		$this->store[$this->words][$word]++;
		$this->store[$this->words][$this->wordCount]++;

		// Sets
		$key = "{$word}{$this->delimiter}{$set}";
		$this->store[$this->words][$key]++;
		$this->store[$this->sets][$set]++;
	}

	public function deTrainFromSet($word, $set) {
		$key = "{$word}{$this->delimiter}{$set}";

		$check = array_key_exists($word,$this->store[$this->words]) &&
			array_key_exists( $this->wordCount,$this->store[$this->words]) &&
			array_key_exists($key,$this->store[$this->words]) &&
			array_key_exists($set,$this->store[$this->sets]);

		if($check) {
			// Words
			$this->store[$this->words][$word]--;
			$this->store[$this->words][$this->wordCount]++;

			// Sets
			$this->store[$this->words][$key]--;
			$this->store[$this->sets][$key]++;

			return TRUE;
		}
		else {
			return FALSE;
		}
	}

	public function getAllSets() {
		return array_keys($this->store[$this->sets]);
	}

	public function getSetCount() {
		return count($this->store[$this->sets]);
	}

	public function getWordCount($words) {
		return count($this->store[$this->words][$words]);
	}

	public function getAllWordsCount() {
		return array_keys($this->store[$this->wordCount][$this->wordCount]);
	}

	public function getSetWordCount($sets) {
		return array_keys($this->store[$this->sets][$sets]);
	}

	public function getWordCountFromSet($words, $sets) {
		$n=0;
		$keys = array();
		foreach($words as $word) {
			foreach($sets as $set) {
				$n+=$this->store[$word][$set];
			}
		}
		return $n;
	}

}