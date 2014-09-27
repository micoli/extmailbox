<!DOCTYPE html>
<html>
	<head>
		<title>Ext 2 Desktop sandbox</title>
		<link rel="stylesheet" type="text/css"	href="/ext-2.2.1/release/resources/css/ext-all.css" />
		<script type="text/javascript"			src ="/ext-2.2.1/release/adapter/ext/ext-base.js"></script>
		<script type="text/javascript"			src ="/ext-2.2.1/release/ext-all-debug.js"></script>
		<script>Ext.BLANK_IMAGE_URL				= '/ext-2.2.1/release/resources/images/default/s.gif';</script>
		<!--
		<script type="text/javascript"			src="modules/mailbox/Ext.eu.sm.Mailbox.i18n.js"></script>
		<script type="text/javascript"			src="modules/mailbox/Ext.eu.sm.Mailbox.MailSelect.js"></script>
		<script type="text/javascript"			src="modules/mailbox/Ext.eu.sm.Mailbox.MailSelect.ContactWindow.js"></script>
		<script type="text/javascript"			src="modules/test/Ext.eu.sm.repartitionExportLM.js"></script>
		<script type="text/javascript"			src="modules/test/Ext.eu.sm.tagManagerConfig.js"></script>
		-->
		<!-- script type="text/javascript"		src="http://open.mapquestapi.com/sdk/js/v7.0.s/mqa.toolkit.js?key=Fmjtd%7Cluur216and%2C8g%3Do5-90za94"></script-->
		<!-- script type="text/javascript"		src="modules/mailbox/Ext.eu.MailSelect.js"></script-->
		<!-- script type="text/javascript"		src="sandbox.js"></script-->
		<?php
		include 'bootstrap.php';
		QDExtLoader::init();
		QDExtLoader::loadFromConf();
		//QDExtLoader::loadDir('modules/test/');
		//QDExtLoader::loadDir('modules/sandbox/');
		QDExtLoader::render()
		?>
		<script type="text/javascript" src="libs/ext.plugins/Ext.eu.sm.cors.js"></script>
		<script type="text/javascript">
			Ext.onReady(function(){
				var desktopApplication = new Ext.app.App({
					init :function(app){
						var that = this;
						Ext.QuickTips.init();

						window.setTimeout(function(){
							var autoExecModule=that.modules[0];
							autoExecModule.launcher.handler.call(autoExecModule);
						},200);
					},

					getModules : function(){
						var aList=[];
						for( var k in Ext.app.Modules){
							if(Ext.app.Modules.hasOwnProperty(k)){
								aList.push(new Ext.app.Modules[k]());
							}
						}
						return aList;
					},

					getStartConfig : function(){
						return {
							title	: 'start menu',
							iconCls	: 'user',
							toolItems	: [{
								text	: 'Settings',
								iconCls	: 'settings',
								scope	: this
							},'-',{
								text	: 'Logout',
								iconCls	: 'logout',
								scope	: this
							}]
						};
					}
				});
			});
		</script>
		<style>
		.wtf-tag-disabled{
			text-decoration	: line-through;
			color			: #FF0000;
		}
		.orange{
			background-color:#FFA500;
		}
		.add {
			background-image: url("/ext-2.2.1/release/examples/shared/icons/fam/add.gif") !important;
		}
		.remove {
			background-image: url("/ext-2.2.1/release/examples/shared/icons/fam/delete.gif") !important;
		}
		</style>
	</head>
	<body scroll="no">
		<div id="x-desktop">
			<dl id="x-shortcuts">
			</dl>
		</div>
		<div id="ux-taskbar">
			<div id="ux-taskbar-start"></div>
			<div id="ux-taskbuttons-panel"></div>
			<div class="x-clear"></div>
		</div>
	</body>
</html>