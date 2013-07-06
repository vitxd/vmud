$.fn.commandLine = function(options){

	var config = $.extend(true, {
		socket : null,
		screen : null
	}, options || {});

	return $(this)
		.each(function(){
			$(this)
				.on('keypress', function(e){
					if(e.which == 13){
						var self 	= $(this),
							command = self.val();
						if(self.attr('type') != 'password'){
							config.screen.appendCmd(command);
						}
						config.socket.emit('web input', command);
						self.select();
						if(self.attr('type') == 'password'){
							self
								.val('')
								.attr('type', 'text');
						}
					}
				})
		})
};

$.fn.appendCmd = function(txt){
	var self = $(this)
		cmd  = $('<span/>')
					.addClass('command-message')
					.text(txt)
		;

	cmd.appendTo(self);
};

$.fn.systemMsg = function(txt){
	var self = $(this)
		cmd  = $('<span/>')
					.addClass('system-message')
					.text('#' + txt)
		;

	cmd.appendTo(self);
};