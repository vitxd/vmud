function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1) {
		c_start = c_value.indexOf(c_name + "=");
	}
	if (c_start == -1) {
		c_value = null;
	} else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) {
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}
function debug(str){
	console.log('----- START -----');
	for(var i = 0 ; i < str.length ; i++){
		console.log(str.charAt(i) + ' -> ' + str.charCodeAt(i));
	}
	console.log('----- END -----');
}

$.fn.tableSelect = function(options){
	var config = $.extend(true,{
		onClick 	: function(row, e){},
		onDblClick	: function(row, e){},
		multi 		: false
	}, options || {});
	return $(this).each(function(){
		$(this)
			.on('mouseover', 'tbody tr', function(){
				$(this).addClass('hover');
			})
			.on('mouseout', 'tbody tr', function(){
				$(this).removeClass('hover');
			})
			.on('click', 'tbody tr', function(e){
				if($(this).hasClass('click')){
					$(this).removeClass('click');
				} else {
					if(!config.multi){
						$(this).siblings('tr').removeClass('click');
					}
					$(this).addClass('click');
				}
				if(typeof config.onClick == 'function'){
					config.onClick($(this), e);
				}
			})
			.on('dblclick', 'tbody tr', function(e){
				$(this).siblings('tr').removeClass('click');
				if(typeof config.onClick == 'function'){
					config.onDblClick($(this), e);
				}
			})
		;
	});
};
