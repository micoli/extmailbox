$.fn.smSlider = function(action,prm) {
	var that = this;

	prm.prevSelector= prm.prevSelector	|| '.prev';
	prm.nextSelector= prm.nextSelector	|| '.next';
	prm.subSelector	= prm.subSelector 	|| '.subslider';
	prm.winSelector	= prm.winSelector 	|| '.slider-window';
	prm.windowWidth	= prm.windowWidth 	|| 240;
	prm.onSlide		= prm.onSlide		|| function(){};

	var fSlide = function(way){
		var i = that.data('slide-current');
		var m = that.data('slide-nb');
		if(way>0 && i<m) i++;
		if(way<0 && i>0  ) i--;
		$(prm.subSelector,that).animate({
			left:-1*prm.windowWidth*i
		});
		displayButtons(i,m);
	}

	var displayButtons = function(n,max){
		that.data('slide-current',n);
		$(prm.prevSelector)[(n==0  )?'hide':'show']();
		$(prm.nextSelector)[(n==max)?'hide':'show']();
		prm.onSlide.call(that,$(prm.winSelector,that)[n],n+1,max+1,(n==0),(n==max));
	}

	switch (action){
		case 'init':
			var max=$(prm.winSelector	,that).length-1;
			that.data('slide-nb'		,max);
			displayButtons(0,max);
			$(prm.prevSelector,that).click(function(){
				fSlide(-1);
				return false;
			});
			$(prm.nextSelector,that).click(function(){
				fSlide(+1);
				return false;
			});
		break;
		case 'prev':
			fSlide(-1);
		break;
		case 'next':
			fSlide(+1);
		break;
	}
}