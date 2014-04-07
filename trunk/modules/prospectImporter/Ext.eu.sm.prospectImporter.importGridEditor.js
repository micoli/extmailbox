Ext.ns('Ext.eu.sm.prospectImporter');
Ext.eu.sm.prospectImporter.importGridEditor = Ext.extend(Ext.FormPanel, {
	refresh			: function(){
		var that = this;
		that.batchStore.removeAll();
		that.batchStore.load();
	},
	initComponent	: function (){
		var that = this;
		that.prospectGridId					= Ext.id();
		that.batchComboId					= Ext.id();
		that.labelCountTotalId				= Ext.id();

		that.allDuplOptions = [
			'phone'			,
			'email'			,
			'company_name'	,
			'company_number',
			'postcode'
		];

		Ext.each(that.allDuplOptions,function(v,k){
			that['labelCountDupl_'	+v+'Id'	] = Ext.id();
			that['checkShowDupl_'	+v+'Id'	] = Ext.id();
			that['labelDupl_'		+v+'Id'	] = Ext.id();
		});

		that.batchStore		= new Ext.data.JsonStore({
			fields			: [
				'ipb_id'			,
				'ipb_batch_id'		,
				'ipb_campaign_id'	,
				'ipb_act_mapping'	,
				'ipb_dedup_options'
			],
			root			: 'data',
			idProperty		: 'ipb_id',
			totalProperty	: 'total',
			autoLoad		: false,
			baseParams		: {
				'exw_action'	: 'local.prospectImporter.getBatch'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
			})/*,
			listeners		: {
				datachanged		: function(store){
					console.log('store Changed 1');
				},
				load			: function(store){
					console.log('store Changed 2');
				},
				add			: function(store){
					console.log('store Changed 3');
				}
			}*/
		});

		that.prospectStore = new Ext.data.JsonStore({
			fields			: [
				'ipr_id'				,
				'ipr_batch_id'			,
				'ipr_status'			,
				'ipr_company_name'		,
				'ipr_company_number'	,
				'ipr_address1'			,
				'ipr_address2'			,
				'ipr_town_name'			,
				'ipr_raw_activities'	,
				'ipr_mapped_activities'	,
				'ipr_postcode'			,
				'ipr_phone'				,
				'ipr_email'				,
				'ipr_contact_title'		,
				'ipr_contact_firstname'	,
				'ipr_contact_lastname'	,
				'ipr_contact_function'	,
				'ipr_description'		,
				'ipr_dupl_company_name'	,
				'ipr_dupl_email'		,
				'ipr_dupl_phone'		,
				'ipr_dupl_company_number',
				'ipr_dupl_postcode'
			],
			root			: 'data',
			idProperty		: 'id',
			totalProperty	: 'total',
			remoteSort		: true,
			autoLoad		: false,
			pruneModifiedRecords:true,
			baseParams		: {
				exw_action						: 'local.prospectImporter.getProspects'
			},
			proxy			: new Ext.data.HttpProxy({
				url				: 'proxy.php',
			}),
		});

		that.prospectStoreChanged	= function(){
			var readerData = that.prospectStore.reader.jsonData;
			Ext.getCmp(that.labelCountTotalId).setText(readerData.total);
			var prct = function (a){
				if(readerData.total>0){
					return ''+a+' - '+(parseInt(a*100*100*100/readerData.total)/(100*100))+'%'
				}else{
					return '';
				}
			}
			Ext.each(that.allDuplOptions,function(v,k){
				Ext.getCmp(that['labelCountDupl_'+v+'Id']	).setText(prct(readerData.duplicates['dupl_'+v]));
			});
		}
		var rendederDupl = function(colName){
			return function (value,meta,record,rowIdx,colIdx){
				if(record.get('ipr_dupl_'+colName)){
					meta.css = 'client-dupl';
				}
				return value;
			}
		}

		var filterCheckHandler = function(colName){
			return function (checkbox,value){
				that.prospectStore.baseParams['with_ipr_dupl_'+colName]=value;
				if(that.prospectStore.baseParams.ipb_id){
					that.prospectStore.removeAll();
					that.prospectStore.load({
						params		: {
							start		: 0,
							limit		: 25
						},
						callback	: that.prospectStoreChanged
					});
				}
			}
		}
		Ext.apply(that,{
			layout	: 'border',
			items	:[{
				xtype				: 'grid',
				id					: that.prospectGridId,
				region				: 'center',
				store				: that.prospectStore,
				tbar				:['Batch&nbsp;:&nbsp;',{
					store			: that.batchStore,
					id				: that.batchComboId,
					xtype			: 'combo',
					valueField		: 'ipb_id',
					displayField	: 'ipb_batch_id',
					emptyText		: 'Select a batch ...',
					mode			: 'local',
					triggerAction	: 'all',
					typeAhead		: true,
					forceSelection	: true,
					selectOnFocus	: true,
					singleSelect	: true,
					listeners		: {
						select			: function (combo,record,idx){
							var t = record.get('ipb_dedup_options');
							var ipb_dedup_options = (t!='')?JSON.parse(t):{};

							Ext.each(that.allDuplOptions,function(v,k){
								var checkbox	= Ext.getCmp(that['checkShowDupl_'	+v+'Id']);
								var labelCount	= Ext.getCmp(that['labelCountDupl_'	+v+'Id']);
								var label		= Ext.getCmp(that['labelDupl_'		+v+'Id']);
								if (that.prospectStore.baseParams.hasOwnProperty('with_ipr_dupl_'+v)){
									that.prospectStore.baseParams['with_ipr_dupl_'+v]=false;
								}
								if (ipb_dedup_options.hasOwnProperty(v) && ipb_dedup_options[v]){
									that.prospectStore.baseParams['with_ipr_dupl_'+v]=true;
									checkbox.setDisabled(false);
									checkbox.setValue	(true );
									checkbox.show		();
									labelCount.show		();
									label.show			();
								}else{
									checkbox.setDisabled(true );
									checkbox.setValue	(false);
									checkbox.hide		();
									labelCount.hide		();
									label.hide			();
								}
							});

							that.prospectStore.baseParams.ipb_id = record.get('ipb_id');
							that.prospectStore.removeAll();
							that.prospectStore.load({
								params		: {
									start		: 0,
									limit		: 25
								},
								callback	: that.prospectStoreChanged
							});
						}
					}
				},'-','Total : ',{
					xtype			: 'label',
					style			: 'font-weight:bold;',
					id				: that.labelCountTotalId
				},'-',{
					xtype			: 'label',
					text			: 'Phone dup',
					id				: that.labelDupl_phoneId,
				},{
					xtype			: 'checkbox',
					checked			: false,
					disabled		: true,
					id				: that.checkShowDupl_phoneId,
					listeners		: {
						check			: filterCheckHandler('phone')
					}
				},{
					xtype			: 'label',
					style			: 'font-weight:bold;',
					id				: that.labelCountDupl_phoneId
				},'-',{
					xtype			: 'label',
					text			: 'E-mail dup ',
					id				: that.labelDupl_emailId,
				},{
					xtype			: 'checkbox',
					checked			: false,
					disabled		: true,
					id				: that.checkShowDupl_emailId,
					listeners		: {
						check			: filterCheckHandler('email')
					}
				},{
					xtype			: 'label',
					style			: 'font-weight:bold;',
					id				: that.labelCountDupl_emailId
				},'-',{
					xtype			: 'label',
					text			: 'Company name dup ',
					id				: that.labelDupl_company_nameId,
				},{
					xtype			: 'checkbox',
					checked			: false,
					disabled		: true,
					id				: that.checkShowDupl_company_nameId,
					listeners		: {
						check			: filterCheckHandler('company_name')
					}
				},{
					xtype			: 'label',
					style			: 'font-weight:bold;',
					id				: that.labelCountDupl_company_nameId
				},'-',{
					xtype			: 'label',
					text			: 'Company number dup ',
					id				: that.labelDupl_company_numberId,
				},{
					xtype			: 'checkbox',
					checked			: false,
					disabled		: true,
					id				: that.checkShowDupl_company_numberId,
					listeners		: {
						check			: filterCheckHandler('company_number')
					}
				},{
					xtype			: 'label',
					style			: 'font-weight:bold;',
					id				: that.labelCountDupl_company_numberId
				},'-',{
					xtype			: 'label',
					text			: 'Postcode dup ',
					id				: that.labelDupl_postcodeId,
				},{
					xtype			: 'checkbox',
					checked			: false,
					disabled		: true,
					id				: that.checkShowDupl_postcodeId,
					listeners		: {
						check			: filterCheckHandler('postcode')
					}
				},{
					xtype			: 'label',
					style			: 'font-weight:bold;',
					id				: that.labelCountDupl_postcodeId
				}],
				bbar				: new Ext.PagingToolbar({
					pageSize			: 25,
					store				: that.prospectStore,
					displayInfo			: true,
					displayMsg			: 'Displaying {0} - {1} of {2}',
					emptyMsg			: "Nothing to display",
					listeners			: {
						change				: that.prospectStoreChanged
					}
				}),
				loadMask			: true,
				autoExpandColumn	: 'name',
				cm					: new Ext.grid.ColumnModel([{
					header: 'id'				, width:  90, sortable: true, fixed:true,dataIndex: 'ipr_id'
				},{
					header: 'company_name'		, width: 200, sortable: true, fixed:false,dataIndex: 'ipr_company_name'		, renderer : rendederDupl('company_name')
				},{
					header: 'company_number'	, width:  50, sortable: true, fixed:false,dataIndex: 'ipr_company_number'	, renderer : rendederDupl('company_number')
				},{
					header: 'address1'			, width:  80, sortable: true, fixed:false,dataIndex: 'ipr_address1'			,
				},{
					header: 'address2'			, width:  80, sortable: true, fixed:false,dataIndex: 'ipr_address2'			,
				},{
					header: 'town_name'			, width: 90, sortable: true, fixed:false,dataIndex: 'ipr_town_name'		,
				},{
					header: 'raw_activities'	, width: 150, sortable: true, fixed:false,dataIndex: 'ipr_raw_activities'	,
				},{
					header: 'mapped_activities'	, width: 150, sortable: true, fixed:false,dataIndex: 'ipr_mapped_activities',
				},{
					header: 'postcode'			, width:  80, sortable: true, fixed:false,dataIndex: 'ipr_postcode'			, renderer : rendederDupl('postcode')
				},{
					header: 'phone'				, width:  80, sortable: true, fixed:false,dataIndex: 'ipr_phone'			, renderer : rendederDupl('phone')
				},{
					header: 'email'				, width: 110, sortable: true, fixed:false,dataIndex: 'ipr_email'			, renderer : rendederDupl('email')
				},{
					header: 'contact_title'		, width:  30, sortable: true, fixed:false,dataIndex: 'ipr_title'			,
				},{
					header: 'contact_firstname'	, width: 100, sortable: true, fixed:false,dataIndex: 'ipr_firstname'		,
				},{
					header: 'contact_lastname'	, width: 100, sortable: true, fixed:false,dataIndex: 'ipr_lastname'			,
				},{
					header: 'contact_function'	, width: 100, sortable: true, fixed:false,dataIndex: 'ipr_function'			,
				},{
					header: 'description'		, width: 200, sortable: true, fixed:false,dataIndex: 'ipr_description'
				}]),
				view				: new Ext.grid.GridView({
					forceFit			: true,
					getRowClass 		: function(record, rowIndex, p, store){
						if(record.get('ipr_status')=='CLIENT'){
							return 'client-grayed';
						}else{
							if(rowIndex==0){
								return 'row-marked-back';
							}else{
								return 'row-marked-back row-marked-line ';
							}
						}
					},
				})
			}]
		});
		Ext.eu.sm.prospectImporter.importGridEditor.superclass.initComponent.call(this);
	}
});

Ext.reg('prospectImporter.importGridEditor',Ext.eu.sm.prospectImporter.importGridEditor);