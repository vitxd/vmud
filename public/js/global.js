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


$(document)
	.ready(function(){
		var url 	= 'http://localhost/',
			socket 	= io.connect(url),
			cmd		= $('#cmd'),
			screen	= $('#screen'),
			menu 	= $('#menu'),
			mud 	= new vMud(url, socket, cmd, screen, menu)
			;
		$( "#dialog-connect" )
			.dialog({
				autoOpen: false,
				height: 300,
				width: 350,
				modal: true,
				buttons: {
					Connect: function() {
						var connection = {};
						$(this).find('form input[type="text"]').each(function(){
							connection[$(this).attr('name')] = $.trim($(this).val());
						});
						$( this ).dialog( "close" );
						mud.connect(connection);
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				}
			});
	});
