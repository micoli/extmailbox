<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Ext JS Calendar Sample</title>

<!-- 	<script type="text/javascript" src="modules/redmine5/include-ext.js"></script> -->
	<script type="text/javascript" src="/qdlib/3rd_js/extjs5/ext-all.js"></script>

	<script type="text/javascript">
		Ext.Loader.setConfig({
			enabled: true,
			paths: {
				'Ext.modules': 'modules'
			}
		});
		Ext.require([
			'Ext.modules.redmine5.index'
		]);
		Ext.onReady(function(){
			document.getElementById('logo-body').innerHTML = new Date().getDate();
		});
	</script>
</head>
<body>
	<div style="display:none;">
	<div id="app-header-content">
		<div id="app-logo">
			<div class="logo-top">&nbsp;</div>
			<div id="logo-body">&nbsp;</div>
			<div class="logo-bottom">&nbsp;</div>
		</div>
		<h1>Ext JS Calendar</h1>
		<span id="app-msg" class="x-hidden"></span>
	</div>
	</div>
</body>
</html>