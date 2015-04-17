
$(document).ready(function(){

    $('.tabs .tab-links a').on('click',function(e){
	var currentAttrValue =$(this).attr('href');
	$('.tabs ' + currentAttrValue).siblings().slideUp(400);
	$('.tabs ' + currentAttrValue).delay(400).slideDown(400);

	$(this).parent('li').addClass('active').siblings().removeClass('active');
	e.preventDefault();


    });
});


