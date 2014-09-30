/**
 *
 */
Ext.ns('Ext.org.micoli.redmine');

Ext.org.micoli.redmine.issueColumn = function(){
	var that	= this;
	that.id		= that.dataIndex;
	(that.init || Ext.emptyFn).call(that);
};

Ext.extend(Ext.org.micoli.redmine.issueColumn,{
	header		: "-",
	width		: 50,
	sortable	: true,
	fixed		: false,
});

Ext.org.micoli.redmine.issueColumn.subject = Ext.extend(Ext.org.micoli.redmine.issueColumn,{
	header		: 'Subject',
	dataIndex	: 'subject',
	width		: 200,
});

Ext.org.micoli.redmine.issueColumn.project = Ext.extend(Ext.org.micoli.redmine.issueColumn,{
	header		: 'Project',
	dataIndex	: 'project.name',
	width		: 180,
	fixed		: true
});

Ext.org.micoli.redmine.issueColumn.tracker = Ext.extend(Ext.org.micoli.redmine.issueColumn,{
	header		: 'Type',
	dataIndex	: 'tracker.name',
	width		: 60,
	fixed		: true
});

Ext.org.micoli.redmine.issueColumn.user = Ext.extend(Ext.org.micoli.redmine.issueColumn,{
	width		: 150,
	fixed		: true,
	renderer	: function (v,meta,record,rowIndex,colIndex) {
		return (v && v.name) ? v.name : '-'
	},
	editorInit	: function (){
		var that = this;
		return new Ext.form.ComboBox(Ext.org.micoli.redmine.service.enumerations.users.dynComboCfg)
	}
});

Ext.org.micoli.redmine.issueColumn.author = Ext.extend(Ext.org.micoli.redmine.issueColumn.user,{
	header		: 'Author',
	dataIndex	: 'author'
});

Ext.org.micoli.redmine.issueColumn.assigned_to = Ext.extend(Ext.org.micoli.redmine.issueColumn.user,{
	header		: 'Assignee',
	dataIndex	: 'assigned_to'
});

Ext.org.micoli.redmine.issueColumn.priority = Ext.extend(Ext.org.micoli.redmine.issueColumn,{
	header		: 'priority',
	dataIndex	: 'priority.name',
	width		: 50,
	fixed		: true
});

Ext.org.micoli.redmine.issueColumn.date = Ext.extend(Ext.org.micoli.redmine.issueColumn,{
	header		: '-',
	dataIndex	: 'date',
	width		: 70,
	fixed		: true,
	renderer	: Ext.util.Format.dateRenderer('d/m/Y')
});

Ext.org.micoli.redmine.issueColumn.created_on = Ext.extend(Ext.org.micoli.redmine.issueColumn.date,{
	header		: 'Created',
	dataIndex	: 'created_on'
});

Ext.org.micoli.redmine.issueColumn.created_on = Ext.extend(Ext.org.micoli.redmine.issueColumn.date,{
	header		: 'updated',
	dataIndex	: 'updated_on'
});

Ext.org.micoli.redmine.issueColumn.start_date = Ext.extend(Ext.org.micoli.redmine.issueColumn.date,{
	header		: 'Start',
	dataIndex	: 'start_date'
});

Ext.org.micoli.redmine.issueColumn.done_ratio = Ext.extend(Ext.org.micoli.redmine.issueColumn,{
	header		: 'Done',
	dataIndex	: 'done_ratio',
	width		: 80,
	fixed		: true,
	renderer	: function (val, meta, record, rowIndex, colIndex, store){
		var percent = val;
		var width = Ext.getCmp(store.extra.gridId).ownerCt.gridColumnModel[colIndex].width;
		var bar = 4-parseInt(percent/25);
		this.style = this.style + ";background-position: ";
		this.style = this.style + (percent==0?-120:(width*percent/100)-120);
		this.style = this.style +"px 50%; background-repeat:no-repeat;";
		meta.css = meta.css+' '+'progressBar-back-'+bar
		return val+'%';
	}
});
