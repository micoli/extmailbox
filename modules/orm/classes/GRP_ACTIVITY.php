<?php
class baseGRP_ACTIVITY extends QDOrm{
	public $table	= 'test.GRP_ACTIVITY';

	public $pk		= 'GRP_ID';

	public $fields = array(
		'GRP_ID'					,
		'GRP_COUNTRY'				,
		'GRP_KEY'					,
		'GRP_NAME'					,
		'GRP_CAT_KEY'				,
		'GRP_CAT_NAME'				,
		'GRP_CAT_FATHER_ID'			,
		'GRP_CAT_LEVEL'				,
		'GRP_CAT_SORT'				,
		'GRP_IS_LEAF'				,
		'GRP_ACTIVE'				,
		'GRP_TODO'					,
		'GRP_OUT'					,
		'GRP_URL'					,
		'GRP_KEYWORDS'				,
		'GRP_DIRRR_TITLE_PART_1'	,
		'GRP_DIRRR_TITLE_PART_2'	,
		'GRP_DIRRR_META_DESCRIPTION'
	);

	public function getConnectionName(){
		return 'main';
	}
}

class GRP_ACTIVITY extends baseGRP_ACTIVITY{

}
