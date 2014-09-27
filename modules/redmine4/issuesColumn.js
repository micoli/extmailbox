Ext.define('Ext.modules.redmine4.issuesColumn',{
	singleton	: true,

	getConfig	: function (cfg){
		var that = this;
		var lst=[cfg.col];
		var t = 0

		while(that.configs[lst[0]] && that.configs[lst[0]].extend){
			lst.unshift(that.configs[lst[0]].extend);
		}
		var cfg =  {
			header		: "-",
			width		: 50,
			sortable	: true,
			fixed		: false,
			gridId		: cfg.gridId
		};

		Ext.each(lst,function(k){
			cfg = Ext.apply(cfg,that.configs[k])
		})

		if(cfg.editorInit){
			cfg.editor = cfg.editorInit.call(that)
		}
		return cfg;

	},
	configs		:{
		'subject':{
			header		: 'Subject',
			dataIndex	: 'subject',
			width		: 200,
		},
		'project':{
			header		: 'Project',
			dataIndex	: 'project.name',
			width		: 180,
			fixed		: true
		},
		'tracker':{
			header		: 'Type',
			dataIndex	: 'tracker.name',
			width		: 60,
			fixed		: true
		},
		'user':{
			width		: 150,
			fixed		: true,
			renderer	: function (v,meta,record,rowIndex,colIndex) {
				return (v && v.name) ? v.name : '-'
			},
			editorInit	: function (){
				var that = this;
				return new Ext.form.ComboBox({
					store			: that.usersStore,
					anchor			: '-14',
					displayField	: 'fullname',
					valueField		: 'fullname',
					emptyText		: 'Select an account...',
					mode			: 'remote',
					queryParam		: 'name',
					triggerAction	: 'all',
					queryDelay		: 300,
					typeAhead		: true,
					forceSelection	: true,
					tpl				: '<tpl for="."><div class="x-combo-list-item"><div><b>{login}</b>, {mail}</div><div><i>{firstname} {lastname}</i></div></div></tpl>',
					selectOnFocus	: true,
					listeners		:{
						select			: function(combo,record,index){
						}
					}
				})
			}
		},
		'author':{
			extend		: 'user',
			header		: 'Author',
			dataIndex	: 'author'
		},
		'assigned_to':{
			extend		: 'user',
			header		: 'Assignee',
			dataIndex	: 'assigned_to'
		},
		'priority':{
			header		: 'priority',
			dataIndex	: 'priority.name',
			width		: 50,
			fixed		: true
		},
		'date':{
			header		: '-',
			dataIndex	: 'date',
			width		: 70,
			fixed		: true,
			renderer	: Ext.util.Format.dateRenderer('d/m/Y')
		},
		'created_on':{
			extend		:'date',
			header		: 'Created',
			dataIndex	: 'created_on'
		},
		'created_on':{
			extend		:'date',
			header		: 'updated',
			dataIndex	: 'updated_on'
		},
		'start_date':{
			extend		:'date',
			header		: 'Start',
			dataIndex	: 'start_date'
		},
		'done_ratio':{
			header		: 'Done',
			dataIndex	: 'done_ratio',
			width		: 120,
			fixed		: true,
			renderer	: function (val, meta, record, rowIndex, colIndex, store){
				var percent = val;
				var width = 120;//Ext.getCmp(store.extra.gridId).ownerCt.gridColumnModel[colIndex].width;
				var bar = 4-parseInt(percent/25);
				meta.style = meta.style + ";background-position: ";
				meta.style = meta.style + (percent==0?-120:(width*percent/100)-120);
				meta.style = meta.style +"px 50%; background-repeat:no-repeat;";
				meta.css = meta.css+' '+'progressBar-back-'+bar
				return val+'%';
			}
		}
	}
});