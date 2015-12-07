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

		<script type="text/javascript"			src="libs/ext.plugins/Ext.ux.ManagedIFrame.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.grid.CellActions/Ext.ux.grid.CellActions.js"></script>
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.grid.CellActions/Ext.ux.grid.CellActions.css" />

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.grid.RowActions/Ext.ux.grid.RowActions.js"></script>
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.grid.RowActions/Ext.ux.grid.RowActions.css" />

		<script type="text/javascript"			src="libs/ext.plugins/Ext.util/ext.util.md5.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.util/ext.util.base64.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.util/Ext.ux.util.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/pdfobject.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.ModalWindow/Ext.ModalWindow.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/Ext.eu.attachedWindow/Ext.eu.attachedWindow.js"></script>

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/codemirror-5.9/lib/codemirror.css" />
		<script type="text/javascript"			src="libs/ext.plugins/codemirror-5.9/lib/codemirror.js"></script>

		<script type="text/javascript"			src="libs/ext.plugins/Ext.grid.RowExpander/RowExpander.js"></script>

		<script type="text/javascript"			src="libs/ext.plugins/codemirror-5.9/mode/javascript/javascript.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/codemirror-5.9/mode/xml/xml.js"></script>

		<script type="text/javascript"			src="libs/ext.plugins/Ext.ux.form.CodeMirror.js"></script>
		<script type="text/javascript"			src="modules/rest/Ext.eu.sm.rest.keyValueGrid.js"></script>
		<script type="text/javascript"			src="modules/rest/Ext.eu.sm.rest.mainPanel.js"></script>
		<script type="text/javascript"			src="modules/rest/rest.js"></script>
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
		.CodeMirror pre{
			outline: 0px	;
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