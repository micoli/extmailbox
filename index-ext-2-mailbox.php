<!DOCTYPE html>
<?php define('EXT_ROOT','');?>
<html>
	<head>
		<title>Ext 2 sandbox mailbox</title>
		<link rel="stylesheet" type="text/css"	href="<?php print EXT_ROOT?><?php print EXT_ROOT?>/ext-2.2.1/release/resources/css/ext-all.css" />
		<script type="text/javascript"			src ="<?php print EXT_ROOT?>/ext-2.2.1/release/adapter/ext/ext-base.js"></script>
		<script type="text/javascript"			src ="<?php print EXT_ROOT?>/ext-2.2.1/release/ext-all-debug.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.ux.ManagedIFrame.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/rowExpander/RowExpander.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/utils/ext.util.md5.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/utils/ext.util.base64.js"></script>

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/boxselect/boxselect.css" />
		<script type="text/javascript" 			src ="libs/ext.plugins/boxselect/Ext.ux.BoxSelect.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/ical/ical.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/ical/ijp.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/cellActions/Ext.ux.grid.CellActions.js"></script>
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/cellActions/Ext.ux.grid.CellActions.css" />

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/uploader/filetype.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/uploader/filetree.css" />
		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/uploader/icons.css" />
		<script type="text/javascript"			src ="libs/ext.plugins/uploader/Ext.ux.form.BrowseButton.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/uploader/Ext.ux.UploadPanel.js"></script>

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/tristate/checkbox.css" />
		<script type="text/javascript"			src ="libs/ext.plugins/tristate/ext-base-addon.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/tristate/Ext.ux.form.Checkbox.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/tristate/Ext.ux.form.Radio.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/tristate/Ext.ux.form.TriCheckbox.js"></script>

		<script type="text/javascript"			src ="libs/ext.plugins/Ext.menu.Item.override.js"></script>

		<link rel="stylesheet" type="text/css"	href="libs/ext.plugins/column-tree.css" />
		<link rel="stylesheet" type="text/css"	href="modules/mailbox/Ext.eu.sm.Mailbox.css" />
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.attachedWindow.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailSelect.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.Mailbox.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailView.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailEditor.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.FolderTree.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.FolderTreeColumnNodeUI.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.FolderSelect.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailGrid.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.MailSearchForm.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.utils.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/Ext.eu.sm.Mailbox.i18n.js"></script>
		<script type="text/javascript"			src ="modules/mailbox/sandboxMailbox.js"></script>
		<script type="text/javascript"			src ="libs/ext.plugins/uploader/Ext.ux.FileUploader.js"></script>


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