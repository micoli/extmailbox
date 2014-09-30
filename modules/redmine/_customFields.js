{
	"custom_fields" : [ {
		"id" : 1,
		"name" : "CF1_text",
		"customized_type" : "issue",
		"field_format" : "string",
		"regexp" : "",
		"max_length" : 100,
		"is_filter" : true,
		"searchable" : true,
		"default_value" : "",
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 2,
		"name" : "CF2_text",
		"customized_type" : "issue",
		"field_format" : "string",
		"regexp" : "",
		"default_value" : "",
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 3,
		"name" : "CF3_longtext",
		"customized_type" : "issue",
		"field_format" : "text",
		"regexp" : "",
		"default_value" : "",
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 4,
		"name" : "CF4_integer",
		"customized_type" : "issue",
		"field_format" : "int",
		"regexp" : "",
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 5,
		"name" : "CF5_float",
		"customized_type" : "issue",
		"field_format" : "float",
		"regexp" : "",
		"is_required" : true,
		"is_filter" : true,
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 6,
		"name" : "CF6_list",
		"customized_type" : "issue",
		"field_format" : "list",
		"regexp" : "",
		"is_filter" : true,
		"searchable" : true,
		"visible" : true,
		"possible_values" : [ {
			"value" : "aaa"
		}, {
			"value" : "bbb"
		}, {
			"value" : "ccc"
		}, {
			"value" : "ddd"
		}, {
			"value" : "eee"
		} ],
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 7,
		"name" : "CF6_list_multiple",
		"customized_type" : "issue",
		"field_format" : "list",
		"regexp" : "",
		"is_filter" : true,
		"searchable" : true,
		"visible" : true,
		"possible_values" : [ {
			"value" : "m-aaa"
		}, {
			"value" : "m-bbb"
		}, {
			"value" : "m-ccc"
		}, {
			"value" : "m-ddd"
		}, {
			"value" : "m-eee"
		} ],
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 8,
		"name" : "CF7_date",
		"customized_type" : "issue",
		"field_format" : "date",
		"regexp" : "",
		"is_filter" : true,
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 9,
		"name" : "CF8_boolean",
		"customized_type" : "issue",
		"field_format" : "bool",
		"regexp" : "",
		"is_filter" : true,
		"visible" : true,
		"possible_values" : [ {
			"value" : "1"
		}, {
			"value" : "0"
		} ],
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 10,
		"name" : "CF9_user",
		"customized_type" : "issue",
		"field_format" : "user",
		"regexp" : "",
		"is_filter" : true,
		"searchable" : true,
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 11,
		"name" : "CF9_user_multiple",
		"customized_type" : "issue",
		"field_format" : "user",
		"regexp" : "",
		"is_filter" : true,
		"searchable" : true,
		"multiple" : true,
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 12,
		"name" : "CF10_version",
		"customized_type" : "issue",
		"field_format" : "version",
		"regexp" : "",
		"is_filter" : true,
		"searchable" : true,
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 13,
		"name" : "CF10_version_multiple",
		"customized_type" : "issue",
		"field_format" : "version",
		"regexp" : "",
		"is_filter" : true,
		"searchable" : true,
		"multiple" : true,
		"visible" : true,
		"trackers" : [ {
			"id" : 1,
			"name" : "Bug"
		}, {
			"id" : 2,
			"name" : "Feature"
		}, {
			"id" : 3,
			"name" : "Support"
		} ],
		"roles" : []
	}, {
		"id" : 14,
		"name" : "CF_ST1_text",
		"customized_type" : "time_entry",
		"field_format" : "string",
		"regexp" : "",
		"is_filter" : true,
		"visible" : true
	} ]
}
