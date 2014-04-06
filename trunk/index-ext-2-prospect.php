<!DOCTYPE html>
<html>
	<head>
		<title>Ext 2 sandbox prospectUploader</title>
		<link rel="stylesheet" type="text/css"	href="/ext-2.2.1/release/resources/css/ext-all.css" />
		<script type="text/javascript"			src="/ext-2.2.1/release/adapter/ext/ext-base.js"></script>
		<script type="text/javascript"			src="/ext-2.2.1/release/ext-all-debug.js"></script>

		<script type="text/javascript"			src="libs/ext.plugins/Ext.ModalWindow.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.attachedWindow.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.form.renderedField.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.form.FileUploadField.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.form.MultiSelectField.js"></script>

		<script type="text/javascript"			src="modules/prospectImporter/Ext.eu.sm.prospectImporter.main.js"></script>
		<script type="text/javascript"			src="modules/prospectImporter/Ext.eu.sm.prospectImporter.batchConfigurationEditor.js"></script>
		<script type="text/javascript"			src="modules/prospectImporter/Ext.eu.sm.prospectImporter.campaignEditor.js"></script>
		<script type="text/javascript"			src="modules/prospectImporter/Ext.eu.sm.prospectImporter.importGridEditor.js"></script>
		<script type="text/javascript"			src="modules/prospectImporter/sandboxProspect.js"></script>
		<style>
		.upload-icon {
			background: url('/ext-2.2.1/release/examples/shared/icons/fam/image_add.png') no-repeat 0 0 !important;
		}
		.x-form-file-wrap {
			height: 22px;
			position: relative;
		}
		.x-form-file-wrap .x-form-file {
			height: 22px;
			opacity: 0;
			position: absolute;
			right: 0;
			z-index: 2;
		}
		.x-form-file-wrap .x-form-file-btn {
			position: absolute;
			right: 0;
			z-index: 1;
		}
		.x-form-file-wrap .x-form-file-text {
			color: #777777;
			left: 0;
			position: absolute;
			z-index: 3;
		}
		</style>
		<script>
			Ext.BLANK_IMAGE_URL = '/ext-2.2.1/release/resources/images/default/s.gif';
		</script>
		<!-- script type="text/javascript" src="sandbox.js"></script -->
		<script type="text/javascript">console.log(new Date);</script>
	</head>
	<body>
		<div id="mainPanel" style="width:1024x;"></div>
	</body>
</html>