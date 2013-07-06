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

var strip_char = [65533, 1, 0];

$(document)
	.ready(function(){
		var url 	= 'http://localhost/',
			socket 	= io.connect(url),
			cmd		= $('#cmd'),
			screen	= $('#screen'),
			connected = false;
			;

		$('*').keydown(function(e){
			e.stopPropagation();
			switch(e.which){
				case 8:
					if(!cmd.is(':focus')){
						e.preventDefault();
					}
					break;

				default:
					console.log(e.which);
			}
		});

		socket.emit('setUserInfo',{});

		$('.panel')
			.on('click', '#connect', function(){
				if(!connected){
					socket.emit('connectTo', {host: 'leu.mclink.it', port: 6000});
					connected = true;
					$('#cmd').focus();
				} else {
					screen.systemMsg('Already connected');
				}
			})
			.on('click', '#disconnect', function(){
				socket.emit('close remote connection',{});
			})

		;

		cmd.focus()
			.commandLine({
				socket: socket,
				screen: screen
			});

		socket
			.on('socket output', function(data){
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
						cmd.val('').attr('type', 'password');
					}
				}

				div
					.html(div.html() + text)
					.scrollTop(div[0].scrollHeight);;
			})
			.on('system output', function(data){
				screen.systemMsg(data.data);
			})
			.on('remote closed', function(){
				connected = false;
				screen.systemMsg('#Disconnected');
			})
		;
	});
