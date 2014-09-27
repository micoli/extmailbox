<?php
class baseclient extends QDOrm{
	public $table	= 'test.client';

	public $pk		= 'id';

	public $fields = array(
		'id'						,
		'raison_sociale'			,
		'contact_nom'				,
		'contact_prenom'			,
		'contact_titre'				,
		'contact_fonction'			,
		'siren'						,
		'siret'						,
		'ape'						,
		'enr_ordre'					,
		'num_tva'					,
		'adresse1'					,
		'adresse2'					,
		'codepostal'				,
		'ville'						,
		'pays'						,
		'commune'					,
		'id_commune'				,
		'telephone'					,
		'portable'					,
		'fax'						,
		'url'						,
		'email'						,
		'id_origine'				,
		'webmail'					,
		'email_mp'					,
		'login'						,
		'password'					,
		'description'				,
		'descrip_client'			,
		'descrip_activ'				,
		'representant_nom'			,
		'representant_prenom'		,
		'representant_titre'		,
		'id_forme_juridique'		,
		'id_contact'				,
		'id_telepro'				,
		'remarque'					,
		'validation'				,
		'id_logo1'					,
		'id_logo2'					,
		'logotype'					,
		'avirer'					,
		'date_insert'				,
		'date_creation'				,
		'effectif'					,
		'refus_presence_annuaire'	,
		'tier'						,
		'date_tier'					,
		'era_id_credit_score'		,
		'ccj'					,
		'credit_score'			,
		'postal_area'			,
		'password_md5'			,
		'enable_sa'				,
	);

	public function getConnectionName(){
		return 'main';
	}
}

class client extends baseclient{

}
