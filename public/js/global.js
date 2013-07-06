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

var strip_char = [65533, 1, 0];

$(document)
	.ready(function(){
		var url = 'http://localhost/',
			socket = io.connect(url);
		console.log(url);
		console.log(getCookie('vmud.sid'));
		
		socket.emit('setUserInfo',{});

		$('#connect')
			.on('click', function(){
				socket.emit('connectTo', {host: 'leu.mclink.it', port: 6000});
				$('#cmd').focus();
			});

		$('#cmd').focus();
		$('#cmd')
			.on('keypress', function(e){
				if(e.which == 13){
					var command = $(this).val();
					console.log(command)
					socket.emit('web input', command);
					$(this).select();
					if($(this).attr('type') == 'password'){
						$(this).val('');
						$(this).attr('type', 'text');
					}
				}
			});
		socket.on('socket output', function(data){
			var div  = $('#screen'),
				text = data.data;

			if(text.indexOf(String.fromCharCode(65533)) !== false){
				var tmp = '';
				for(var i = 0 ; i < text.length ; i++){
					if($.inArray(text.charCodeAt(i), strip_char) < 0){
						tmp += text.charAt(i);
					}
				}
				text = tmp;

				if(/^Password:/.test(text)){
					$('#cmd').val('').attr('type', 'password');
				}
			}

			div
				.html(div.html() + text)
				.scrollTop(div[0].scrollHeight);;
		});
	});
