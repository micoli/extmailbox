$.fn.extimg = function(prm) {
	var that = this;
	prm = prm ||{};
	prm.loadingClass = prm.loadingClass||'.extimg-loading'
	$(that).filter(prm.loadingClass).filter(':not(extimg-onload)').each(function(k,v){
		console.log(this,that,url);
		var url = $(v).data("url");
		$(v).addClass("extimg-onload");
		var intImage = new Image();
		$(intImage).load(function() {
			$(v).attr('src',url)
			.removeClass(prm.loadingClass)
			.removeClass('extimg-onload')
			.height(intImage.height)
			.width(intImage.width);
		})
		intImage.src=url;
	});
	return that;
}