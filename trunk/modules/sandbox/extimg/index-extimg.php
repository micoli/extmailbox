<?php
preg_match_all('!<img src="(.*?)".*?class="pc_img"!',file_get_contents('http://www.flickr.com/explore/interesting/7days/'),$m1);
preg_match_all('!<img src="(.*?)".*?class="pc_img"!',file_get_contents('http://www.flickr.com/explore/interesting/7days/'),$m2);
?>
<!DOCTYPE html>
<html>
	<head>
		<title>extended imgs</title>
		<script type="text/javascript"	src="https://code.jquery.com/jquery-2.1.0.min.js"></script>
		<link   rel ="stylesheet"		href="extimg.css">
		<script type="text/javascript"	src="extimg.js"></script>
		<script type="text/javascript"	src="smSlider.js"></script>
		<script type="text/javascript">
			$(document).ready(function() {
				$('.next2').click(function(){
					$('#slider1').smSlider('next',{})
				});
				$('#slider1').smSlider('init',{
					prevSelector:'.prev',
					nextSelector:'.next',
					onSlide		: function(window,n,max,first,last){
						$('.extimg',window).extimg();
						$('.num',this).html(''+n+'/'+max);
					}
				});

				$('#slider2 img.extimg').extimg();
				$('#slider2').smSlider('init',{});
			});
		</script>
	</head>
	<body style="background:#D4F1F6">
		<a href="#" class="next2">&gt;&gt;</a>
		<div class="slider" id="slider1">
			<a href="#" class="prev">&lt;&lt;</a>
			<span class="num"></span>
			<a href="#" class="next">&gt;&gt;</a>
			<div class="subslider">
			<?php foreach($m1[1] as $v){?>
				<div class="slider-window">
					<img src="modules/extimg/extimg-1x1.gif" style="width:40px;height:40px;" class="extimg extimg-loading" data-url="<?php print $v;?>">
				</div>
			<?php }?>
			</div>
		</div>
		<div class="slider" id="slider2">
			<a href="#" class="prev">&lt;&lt;</a>
			<a href="#" class="next">&gt;&gt;</a>
			<div class="subslider">
			<?php foreach($m2[1] as $v){?>
				<div class="slider-window">
					<img src="modules/extimg/extimg-1x1.gif" style="width:40px;height:40px;" class="extimg extimg-loading" data-url="<?php print $v;?>">
				</div>
			<?php }?>
			</div>
		</div>
	</body>
</html>