Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.attachmentsUploader = Ext.extend(Ext.Panel,{
	uploadBlob		: function (blob, attachmentId, fileName, options) {
		var that			= this;
		var actualOptions = Ext.apply({
			loadstartEventHandler: Ext.emptyFn,
			progressEventHandler: Ext.emptyFn
		}, options);

		//uploadUrl = uploadUrl + '?attachment_id=' + attachmentId;
		if (blob instanceof window.File) {
			//uploadUrl += '&filename=' + encodeURIComponent(blob.name);
		}

		that.redmineService.request({
			method			: 'POST',
			url				: 'uploads.json?attachment_id=' + attachmentId+'&filename=' + encodeURIComponent(fileName),
			headers			: {
				'Content-Type'	: 'application/octet-stream',
				'Accept'		: 'application/json'
			},
			data			: blob,
			cache			: false,
			processData		: false,
			success			: function (data){
				eval('var result = '+data.responseText);
				that.fireEvent('fileuploaded',filename,result.upload.token);
				console.log(blob);
			}
		});
	},

	initComponent		: function (){
		var that = this;
		that.addEvent('fileuploaded');
		Ext.apply(that,{
			items			: [{
				xtype			: 'browsebutton',
				getFileName		: function(inp) {
					return inp.getValue().split(/[\/\\]/).pop();
				},
				getFilePath		: function(inp) {
					return inp.getValue().replace(/[^\/\\]+$/,'');
				},
				getFileCls		: function(name) {
					var atmp = name.split('.');
					if(1 === atmp.length) {
						return this.fileCls;
					}else {
						return this.fileCls + '-' + atmp.pop().toLowerCase();
					}
				},
				handler			: function (bb){
					var inp = bb.detachInputFile();
					inp.addClass('x-hidden');
					var fileName = bb.getFileName(inp);

					var rec = {
						input		: inp,
						fileName	: fileName,
						filePath	: bb.getFilePath(inp),
						shortName	: Ext.util.Format.ellipsis(fileName, bb.maxLength),
						fileCls		: bb.getFileCls(fileName),
						state		:'queued'
					};
					console.log(inp,rec);
					that.uploadBlob(inp,that.issue_id,fileName)
				}
			}]
		});

		Ext.org.micoli.redmine.attachmentsUploader.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('org.micoli.redmine.attachmentsUploader', Ext.org.micoli.redmine.attachmentsUploader);