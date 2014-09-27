Ext.ns("Ext.ux.layout");


/**
 * @class Ext.ux.layout.EasyColumnLayout
 * @extends Ext.layout.ContainerLayout
 * @author Chad Eberle June 29, 2009
 * @version $Id$
 *
 * A variation of Ext.layout.ColumnLayout, that requires less code and adds the
 * following extra features:
 * <ul>
 *    <li>Control over the placement order and tab order of the controls</li>
 *    <li>Automatic gutters (i.e., spacing) between columns</li>
 *    <li>Ability to fit the layout height to its parent container so that
 *    all the columns have matching height</li>
 * </ul>
 *
 * Placing form fields side-by-side in Ext is a pain, especially if you want
 * the tab order to go across the columns horizontally first, then down
 * to the next row of fields, or if you only want two columns with one
 * field in each column. A lot of nesting is required.  For example:
 * <pre>
 * ...
 * {
 *    xtype: "form",
 *    items: [{
 *        xtype: "container",
 *        autoCreate: "div",
 *        layout: "column"
 *        items:[{
 *            xtype: "container",
 *            autoCreate: "div",
 *            style: "padding-right: 2px",     //for a 5px gutter
 *            columnWidth: .5
 *            layout: "form",
 *            items: [{
 *                xtype: "textfield",
 *                name: "firstName",
 *                fieldLabel: "First Name"
 *            }]
 *        }, {
 *            xtype: "container",
 *            autoCreate: "div",
 *            style: "padding-left: 3px",      //for a 5px gutter
 *            columnWidth: .5,
 *            layout: "form",
 *            items: [{
 *                xtype: "textfield",
 *                name: "lastName",
 *                fieldLabel: "Last Name"
 *            }]
 *        }]
 *    }]
 * }
 * ...
 * </pre>
 *
 * By contrast, EasyColumnLayout can do the same layout with roughly half as much code:
 * <pre>
 * ...
 * {
 *     xtype: "form",
 *     items: [{
 *         xtype: "container",
 *         autoCreate: "div",
 *         layout: "easycolumn",
 *         items: [{
 *             xtype: "textfield",
 *             name: "firstName",
 *             fieldLabel: "First Name"
 *         }, {
 *            xtype: "textfield",
 *            name: "lastName",
 *            fieldLabel: "Last Name"
 *         }]
 *     }]
 * }
 * ...
 * </pre>
 *
 * The above example relies on the defaults for gutter size, column count and
 * column widths. The following example shows all the ways one can customize
 * this layout.
 * <pre>
 * ...
 * {
 *     xtype: "form",
 *     items: [{
 *         xtype: "container",
 *         autoCreate: "div",
 *         layout: "easycolumn",
 *         layoutConfig: {
 *             columns: 3,
 *             vertical: false,         //lay out horizontally first
 *             autoTabIndex: 1,         //automatically assign tab indexes
 *             columnConfigs: [{
 *                 width: 100,          //fixed width for first column
 *                 defaultType: "datefield",
 *             }],
 *             defaultColConfig: {
 *                 defaultType: "textfield"
 *             }
 *             gutterSize: 10,			//10 pixels between columns
 *             fitHeight: true			//stretch to fit form's height
 *         }
 *         items: [
 *             ...
 *         ]
 *     }
 * }
 */

Ext.ux.layout.EasyColumnLayout = Ext.extend( Ext.layout.ContainerLayout, {
	monitorResize:true,

	/**
	 * @cfg {String} extraCls
	 * An optional extra CSS class that will be added to the container (defaults to 'x-column').  This can be useful for
	 * adding customized styles to the container or any of its children using standard CSS rules.
	 */
	extraCls: 'x-column',

	scrollOffset : 0,

	// private
	isValidParent : function(c, target){
		return (c.getPositionEl ? c.getPositionEl() : c.getEl()).dom.parentNode == this.innerCt.dom;
	},

	/**
	 * @cfg {Number} columns
	 * The number of columns to fill.  Default: 2.
	 */
	columns: 2,
	/**
	 * @cfg {Boolean} vertical
	 * True to fill the columns with items going down first, then across.  False
	 * to fill across then down.  Default: true.
	 */
	vertical: true,
	/**
	 * @cfg {Numeric} autoTabIndex
	 * If greater than 0, automatically assign a tabIndex property to each item, starting with the
	 * value of autoTabIndex. When vertical=false, this will cause tab order to follow the layout
	 * order (left-to-right).  Default: 0 (off).
	 */
	autoTabIndex: 0,
	/**
	 * @cfg {Object[]} columnConfigs
	 * An array of column Container configurations.
	 */
	columnConfigs: [],
	/**
	 * @cfg {Object} defaultColConfig
	 * An object representing default settings to apply to each column.  Settings specified
	 * in the columnConfigs take precedence.
	 */
	defaultColConfig: {},
	/**
	 * @cfg {Numeric} gutterSize
	 * Number of pixels of spacing to put between columns.  Default: 5.
	 */
	gutterSize: 5,
	/**
	 * @cfg {Boolean} fitHeight
	 * Size column heights to fill container height. Default: false.
	 */
	fitHeight: false,

	onLayout: function(ct, target)
	{
		if(!this.columnsInitialized) {
			this.setupColumns(ct, target);
			return;
		}
		if(!this.innerCt){
			target.addClass('x-column-layout-ct');

			// the innerCt prevents wrapping and shuffling while
			// the container is resizing
			this.innerCt = target.createChild({cls:'x-column-inner'});
			this.innerCt.createChild({cls:'x-clear'});
		}
		this.renderAll(ct, this.innerCt);

		var cs = ct.items.items, len = cs.length, c, i;
		var size = Ext.isIE && target.dom != Ext.getBody().dom ? target.getStyleSize() : target.getViewSize();

		if(size.width < 1 && size.height < 1){ // display none?
			return;
		}

		var w = size.width - target.getPadding('lr') - this.scrollOffset,
			h = size.height - target.getPadding('tb'),
			pw = w;

		this.innerCt.setWidth(w);

		// some columns can be percentages while others are fixed
		// so we need to make 2 passes

		for(i = 0; i < len; i++){
			c = cs[i];
			if(!c.columnWidth){
				pw -= (c.getSize().width + c.getEl().getMargins('lr'));
			}
		}

		pw = pw < 0 ? 0 : pw;

		for(i = 0; i < len; i++){
			c = cs[i];
			if(c.columnWidth){
				c.setSize(Math.floor(c.columnWidth*pw) - c.getEl().getMargins('lr'));
			}
		}

		if (this.fitHeight) {
			this.innerCt.setHeight(h);
			for(i = 0; i < len; i ++) {
				cs[i].setHeight(h);
			}
		}
	},

	//private
	setupColumns: function(ct, target)
	{
		var items = ct.items.items, dcc = this.defaultColConfig, cc = this.columnConfigs, cols = [],
			cwCount = 0;

		//create a container for each column
		for(var i = 0; i < this.columns; i++) {
			var cfg = {
				xtype: "container",
				autoEl: "div",
				layout: "form",
				items: []
			};
			Ext.apply(cfg, Ext.isArray(cc) ? cc[i] : {});
			Ext.applyIf(cfg, dcc);
			Ext.applyIf(cfg, {
				defaultType: ct.defaultType,
				labelSeparator: ct.labelSeparator,
				labelWidth: ct.labelWidth,
				labelPad: ct.labelPad,
				labelAlign: ct.labelAlign
			});

			//count columns without specified widths
			if(cfg.columnWidth == undefined && cfg.width == undefined) {
				cwCount++;
			}

			if(this.gutterSize > 0) {
				cfg.style = cfg.style || "";
				cfg.style += (!cfg.style.match(/;\s*$/) ? ";" : "") +
					(i + 1 < this.columns ? "padding-right: " + String(Math.floor(this.gutterSize/2)) + "px;" : "") +
					(i != 0 ? "padding-left: " + String(Math.ceil(this.gutterSize/2)) + "px;" : "");
			}
			cols.push(cfg);
		}

		//set width where width is unspecified, default to proportional width
		for(var i = 0; i < cols.length; i++) {
			var cfg = cols[i];
			if (cfg.columnWidth == undefined && cfg.width == undefined) {
				cfg.columnWidth = 1 / cwCount;
			}
		}

		//redistribute the original items
		for(var i = 0, len = items.length; i < len; i++) {
			var colIx;
			if(this.vertical) {
				colIx = Math.floor(i / Math.ceil(len / this.columns));
			} else {
				colIx = i % this.columns;
			}
			cols[colIx].items.push(items[i]);

			//set tabIndex based on autoTabIndex config
			if(!isNaN(this.autoTabIndex) && this.autoTabIndex > 0) {
				items[i].tabIndex = i + this.autoTabIndex;
			}
		}
		delete ct.items;
		ct.add.apply(ct, cols);
		this.columnsInitialized = true;
		this.onLayout(ct, target);
	}

});

Ext.Container.LAYOUTS["easycolumn"] = Ext.ux.layout.EasyColumnLayout;