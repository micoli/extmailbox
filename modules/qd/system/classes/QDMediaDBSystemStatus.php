<?php
class QDMediaDBSystemStatus {
	var $QDNet;

	function __construct() {
	}

	function svc_status() {
		$data = self::cpu();
		return array(
			'processes'	=> array_values($data['processes']),
			'cpu'		=> $data['core'],
			'disks'		=> $this->get_disks()
		);
	}

	function svc_diskStatus() {
		return $this->get_disks();
	}

	function svc_processes() {
		$data = self::cpu();
		return array(
			'processes'	=> array_values($data['processes']),
			'cpu'		=> $data['core'],
		);
	}

	/**
	 * Finds a list of disk drives on the server.
	 * @return array The array velues are the existing disks.
	 * http://php.net/manual/en/function.disk-total-space.php#cotact[at]covac-software[dot]com
	 */
	function get_disks(){
		$aDisks = array();
		if(php_uname('s')=='Windows NT'){
			// windows
			$disks=`fsutil fsinfo drives`;
			$disks=str_word_count($disks,1);
			if($disks[0]!='Drives') return '';
			unset($disks[0]);
			foreach($disks as $key=>$disk){
				$aDisks[$key]=array(
					'mountPoint'	=>$disk.':\\'
				);
			}
		}else{
			//*nix
			$data=`mount`;
			$data=explode("\n",str_replace("\r",'',$data));
			$disks=array();
			foreach($data as $token){
				if(preg_match('!\/dev\/(.*) on (.*) type (.*) (.*)!',$token,$m)){
					$aDisks[]=array(
						'device'		=> $m[1],
						'mountPoint'	=> $m[2],
						'type'			=> $m[3],
						'options'		=> $m[4]
					);
				}
			}
		}
		foreach($aDisks as $k=>$v){
			$aDisks[$k]['totalSize'	]	= disk_total_space($v['mountPoint']);
			$aDisks[$k]['totalSizeH']	= CW_Tools::getSymbolByQuantity($aDisks[$k]['totalSize'	]);
			$aDisks[$k]['freeSpace'	]	= disk_free_space($v['mountPoint']);
			$aDisks[$k]['freeSpaceH']	= CW_Tools::getSymbolByQuantity($aDisks[$k]['freeSpace']);
			$aDisks[$k]['percent'	]	= sprintf("%0.2f",($aDisks[$k]['freeSpace']/1024)/($aDisks[$k]['totalSize']/1024)*100);
		}
		return $aDisks;
	}

	/*https://gist.github.com/1780212$/
	/* Gets individual core information */
	function GetCoreInformation() {
		$data = file('/proc/stat');
		$cores = array();
		foreach( $data as $line ) {
			if( preg_match('/^cpu[0-9]/', $line)){
				$info = explode(' ', $line );
				$cores[] = array(
					'user'	=> $info[1],
					'nice'	=> $info[2],
					'sys'	=> $info[3],
					'idle'	=> $info[4]
				);
			}
		}
		return $cores;
	}

	/* compares two information snapshots and returns the cpu percentage */
	function GetCpuPercentages($stat1, $stat2) {
		if( count($stat1) !== count($stat2) ) {
			return;
		}
		$cpus = array();
		for( $i = 0, $l = count($stat1); $i < $l; $i++) {
			$dif = array();
			$dif['user'	] = $stat2[$i]['user'] - $stat1[$i]['user'];
			$dif['nice'	] = $stat2[$i]['nice'] - $stat1[$i]['nice'];
			$dif['sys'	] = $stat2[$i]['sys'] - $stat1[$i]['sys'];
			$dif['idle'	] = $stat2[$i]['idle'] - $stat1[$i]['idle'];
			$total = array_sum($dif);
			$cpu = array();
			foreach($dif as $x=>$y) {
				$cpu[$x] = round($y / $total * 100, 1);
			}
			$cpu['ts'	] = time();
			$cpus['cpu' . $i] = $cpu;
		}
		return $cpus;
	}

	function listProcesses(){
		$arr = glob('/proc/*',GLOB_ONLYDIR);
		$aProcesses=array();
		foreach($arr as $path){
			if(preg_match('!\/proc\/([0-9]*)$!',$path,$m)){
				try{
					$aStat = @explode(' ',@join('',(@file('/proc/'.$m[1].'/stat'))));
					if(is_array($aStat) && count($aStat)>30){
						$aProcesses[$m[1]]=array(
							'pid'			=>$aStat[00],
							'tcomm'			=>str_replace('(','',str_replace(')','',$aStat[01])),
							'cmd_line'		=>file('/proc/'.$m[1].'/cmdline'),
							'state'			=>$aStat[02],
							'ppid'			=>$aStat[03],
							'pgid'			=>$aStat[04],
							'sid'			=>$aStat[05],
							'tty_nr'		=>$aStat[06],
							'tty_pgrp'		=>$aStat[07],
							'flags'			=>$aStat[08],
							'min_flt'		=>$aStat[09],
							'cmin_flt'		=>$aStat[10],
							'maj_flt'		=>$aStat[11],
							'cmaj_flt'		=>$aStat[12],
							'utime'			=>$aStat[13],
							'stime'			=>$aStat[14],
							'cutime'		=>$aStat[15],
							'cstime'		=>$aStat[16],
							'priority'		=>$aStat[17],
							'nice'			=>$aStat[18],
							'num_threads'	=>$aStat[19],
							'it_real_value'	=>$aStat[20],
							'start_time'	=>$aStat[21],
							'vsize'			=>$aStat[22],
							'rss'			=>$aStat[23],
							'rsslim'		=>$aStat[24],
							'start_code'	=>$aStat[25],
							'end_code'		=>$aStat[26],
							'start_stack'	=>$aStat[27],
							'esp'			=>$aStat[28],
							'eip'			=>$aStat[29],
							'pending'		=>$aStat[30],
							'blocked'		=>$aStat[31],
							'sigign'		=>$aStat[32],
							'sigcatch'		=>$aStat[33],
							'wchan'			=>$aStat[34],
							'zero1'			=>$aStat[35],
							'zero2'			=>$aStat[36],
							'exit_signal'	=>$aStat[37],
							'cpu'			=>$aStat[38],
							'rt_priority'	=>$aStat[39],
							'policy'		=>$aStat[40]
						);
					}
				}catch(Exception $e){
				}
			}
		}
		return $aProcesses;
	}

	function cpu(){
		$stat1		= self::GetCoreInformation();
		$processes1	= self::listProcesses();
		sleep(1);
		$stat2		= self::GetCoreInformation();
		$processes2	= self::listProcesses();
		$processes = array_intersect_key($processes1, $processes2);
		$time_total1 = 0;
		$time_total2 = 0;
		foreach($processes as $pid=>$p){
			$time_total1 += $processes1[$pid]['utime']+$processes1[$pid]['stime'];
			$time_total2 += $processes2[$pid]['utime']+$processes2[$pid]['stime'];
		}
		$time_total3 = $time_total1+$time_total2;
		foreach($processes as $pid=>$p){
			$processes[$pid]=$processes2[$pid];
			$processes[$pid]['user_util'	]=1000000*($processes2[$pid]['utime']-$processes1[$pid]['utime'])/($time_total3);
			$processes[$pid]['system_util'	]=1000000*($processes2[$pid]['stime']-$processes1[$pid]['stime'])/($time_total3);
			$processes[$pid]['total_util'	]=$processes[$pid]['user_util']+$processes[$pid]['system_util'];
		}

		$core = self::GetCpuPercentages($stat1, $stat2);
		return array('processes'=>$processes,'core'=>$core);
		//consumption=(`awk '$1=="cpu" { cputot = $2+$3+$4+$5; } $1=='$PID' { cpupid = $14+$15+$16+$17; } END {printf "%d %d %.2f\n", cpupid, cputot, (cpupid-'${consumption[0]}')/(cputot-'${consumption[1]}')*100; }' /proc/stat /proc/$PID/stat`);
	}
}
?>