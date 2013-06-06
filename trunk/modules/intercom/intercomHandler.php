<html>
	<head>
		<title>Ext 2 intercomHandler</title>
		<script type="text/javascript" src="libs/intercom.js/intercom.js"></script>
		<script type="text/javascript">
		window.onload = function (){
			var intercom = new Intercom();
			intercom.emit('intercomHandler', {message: <?php print json_encode($_REQUEST)?>});
			debugger;
			self.close();
		}
		</script>
	</head>
	<body>
		<?php print json_encode($_REQUEST)?>
	</body>
</html>