<!DOCTYPE html>
<?php define('EXT_ROOT','');?>
<html>
	<head>
		<title>Ext 2 sandbox mailbox</title>

		<link rel="shortcut icon"	href="/favicon.ico" type="image/x-icon">
		<link rel="icon"			href="/favicon.ico" type="image/x-icon">

		<link rel="stylesheet" type="text/css"	href="<?php print EXT_ROOT?>/ext-2.2.1/release/resources/css/ext-all.css" />
		<script type="text/javascript"			src ="<?php print EXT_ROOT?>/ext-2.2.1/release/adapter/ext/ext-base.js"></script>
		<script type="text/javascript"			src ="<?php print EXT_ROOT?>/ext-2.2.1/release/ext-all-debug.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/lodash/lodash.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.ManagedIFrame/Ext.ux.ManagedIFrame.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.grid.RowExpander/RowExpander.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.util/ext.util.md5.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.util/ext.util.base64.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.util/ext.data.ArrayStore.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/stomp/stomp.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/stomp/sockjs-0.3.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/stomp/ReconnectingWebSocket.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.eu.stomp/Ext.eu.stomp.js"></script>
		<!-- script type="text/javascript"			src ="libs/ext.plugins/Ext.JsonReaderOverride.js"></script -->
		<!-- <script type="text/javascript"			src ="libs/ext.plugins/operative.js"></script> -->

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.eu.sm.toaster/Ext.eu.sm.toaster.css" />
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.eu.sm.toaster/Ext.eu.sm.toaster.js"></script>

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.BoxSelect/boxselect.css" />
		<script type="text/javascript" 			src ="libs/ext.plugins/Ext.ux.BoxSelect/Ext.ux.BoxSelect.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/ical/ical.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/ical/ijp.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.util/broofa-node-uuid/uuid.js"></script>
		<script type="text/javascript"			src="libs/ext.plugins/pdfobject.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.HtmlEditor.Plugins/Ext.ux.form.HtmlEditor.Plugins.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.HtmlEditor.Plugins/Ext.ux.form.HtmlEditor.Table.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.HtmlEditor.Plugins/Ext.ux.form.HtmlEditor.FindAndReplace.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.ux.form.HtmlEditor.EnsureContent.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.grid.CellActions/Ext.ux.grid.CellActions.js"></script>
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.grid.CellActions/Ext.ux.grid.CellActions.css" />

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.Uploader/filetype.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.Uploader/filetree.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.Uploader/icons.css" />
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.Uploader/Ext.ux.form.BrowseButton.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.Uploader/Ext.ux.UploadPanel.js"></script>

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/Ext.ux.form.tristate/checkbox.css" />
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.tristate/ext-base-addon.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.tristate/Ext.ux.form.Checkbox.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.tristate/Ext.ux.form.Radio.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.form.tristate/Ext.ux.form.TriCheckbox.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.eu.sm.grid.infiniteScroll.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.menu.Item.override.js"></script>

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/column-tree.css" />
		<link rel="stylesheet" type="text/css"	href="modules/mailbox/Ext.eu.sm.Mailbox.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/mailselect.css" />
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.eu.sm.dataTemplateSelector/Ext.eu.sm.dataTemplateSelector.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.eu.attachedWindow/Ext.eu.attachedWindow.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailSelect.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.Mailbox.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailPanel.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailView.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailEditor.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.FolderTree.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.FolderTreeColumnNodeUI.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.FolderSelect.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailGrid.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailSearchForm.js"></script>
		<script type="text/javascript"			src= "modules/mailbox/Ext.eu.sm.Mailbox.MailSelect.ContactWindow.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.utils.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.i18n.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.countdown.js"></script>

		<script type="text/javascript"			src ="modules/mailbox/sandboxMailbox.js"></script>

		<script type="text/javascript"			src= "libs/ext.plugins/Ext.eu.sm.inlineViewer/Ext.eu.sm.inlineViewer.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.Uploader/Ext.ux.FileUploader.js"></script>


		<script>
			Ext.BLANK_IMAGE_URL = '<?php print EXT_ROOT?>/ext-2.2.1/release/resources/images/default/s.gif';
		</script>
		<!-- script type="text/javascript" src="sandbox.js"></script -->
		<script type="text/javascript">console.log('START', new Date);</script>
	</head>
	<body>
		<div id="mainPanel" style="width:1024x;"></div>
	</body>
</html>