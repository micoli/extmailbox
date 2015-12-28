<!DOCTYPE html>
<html>
	<head>
		<title>Ext 2 Sandbox</title>
		<link rel="stylesheet" type="text/css"	href="/ext-2.2.1/release/resources/css/ext-all.css" />
		<script type="text/javascript"			src="/ext-2.2.1/release/adapter/ext/ext-base.js"></script>
		<script type="text/javascript"			src="/ext-2.2.1/release/ext-all-debug.js"></script>
		<link rel="stylesheet" type="text/css"	href="modules/mailbox/Ext.eu.sm.Mailbox.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.boxSelect/boxselect.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/mailselect.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.eu.sm.pdf/Ext.eu.sm.pdf.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/openLayers/theme/default/style.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.eu.sm.form.starField/Ext.eu.sm.form.starField.css" />
		<!-- script type="text/javascript"		src="libs/ext.plugins/Ext.eu.sm.ajaxOverride.js"></script -->
		<script type="text/javascript"			src="libs/ext.plugins/Ext.ux.boxSelect/Ext.ux.BoxSelect.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.form.RadioGroup.override/Ext.form.RadioGroup.override.js"></script>

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/columnLock.css" />
		<script type="text/javascript"			src="libs/ext.plugins/columnLock.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.grid.CellActions/Ext.ux.grid.CellActions.js"></script>
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.grid.CellActions/Ext.ux.grid.CellActions.css" />

		<script type="text/javascript"			src="libs/ext.plugins/Ext.util/ext.util.md5.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.util/Ext.ux.util.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/pdfobject.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.ModalWindow/Ext.ModalWindow.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.attachedWindow/Ext.eu.attachedWindow.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.inlineViewer/Ext.eu.sm.inlineViewer.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/pdf.js/pdf.compatibility.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/pdf.js/pdf.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.form.renderedField/Ext.eu.sm.form.renderedField.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.form.starField/Ext.eu.sm.form.starField.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.PivotEditorGridPanel/Ext.eu.sm.PivotEditorGridPanel.js"></script>

<!-- 		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.swfObject.js"></script> -->
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.youtube/Ext.eu.sm.youtube.js"></script>
<!-- 		<script type="text/javascript"			src="http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject_src.js"></script> -->
		<!-- <script type="text/javascript"		src="libs/ext.plugins/swfobject.js"></script>-->
		<!-- <script type="text/javascript"		src="libs/ext.plugins/Ext.eu.sm.cors.js"></script> -->
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.pdf/Ext.eu.sm.pdf.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/openLayers/openLayers.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.openLayers/Ext.eu.sm.openLayers.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.dataTemplateSelector/Ext.eu.sm.dataTemplateSelector.js"></script>
		<script type="text/javascript"			src="modules/mailbox/Ext.eu.sm.Mailbox.i18n.js"></script>
		<script type="text/javascript"			src="modules/mailbox/Ext.eu.sm.Mailbox.MailSelect.js"></script>
		<script type="text/javascript"			src="modules/mailbox/Ext.eu.sm.Mailbox.MailSelect.ContactWindow.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.form.MultiSelectField/Ext.form.MultiSelectField.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.sm.form.dynamicForm/Ext.eu.sm.form.dynamicForm.js"></script>
<!-- 		<script type="text/javascript"			src="modules/sandbox/sandbox.js"></script> -->
		<script type="text/javascript"			src="modules/rest/Ext.eu.sm.rest.mainPanel.js"></script>
		<script type="text/javascript"			src="modules/rest/rest.js"></script>

		<!-- <script type="text/javascript"		src="http://open.mapquestapi.com/sdk/js/v7.0.s/mqa.toolkit.js?key=Fmjtd%7Cluur216and%2C8g%3Do5-90za94"></script>-->
		<!--  script type="text/javascript"		src="modules/mailbox/Ext.eu.MailSelect.js"></script-->
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.HtmlEditor.Plugins/Ext.ux.form.HtmlEditor.Plugins.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.HtmlEditor.Plugins/Ext.ux.form.HtmlEditor.Table.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.HtmlEditor.Plugins/Ext.ux.form.HtmlEditor.FindAndReplace.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.ux.form.HtmlEditor.EnsureContent.js"></script>

		<link rel="stylesheet" type="text/css"	href="modules/rest/css/cssrest.css" />

		<script>
			Ext.BLANK_IMAGE_URL = '/ext-2.2.1/release/resources/images/default/s.gif';
		</script>
		<!-- script type="text/javascript" src="sandbox.js"></script -->
		<script type="text/javascript">console.log(new Date);</script>
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
	<body>
		<div id="mainPanel" style="width:1024x;"></div>
	</body>
</html>