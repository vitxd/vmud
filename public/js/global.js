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


$(document)
	.ready(function(){
		var socket = io.connect('http://localhost');
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
				}
			});
		socket.on('socket output', function(data){
			var div = $('#screen');
			console.log(data.data);
			text = data.data;


			div
				.html(div.html() + text)
				.scrollTop(div[0].scrollHeight);;
		});
	});
