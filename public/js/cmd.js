
$.fn.commandLine = function(options){

	var config = $.extend(true, {
		socket : null,
		screen : null
	}, options || {}),
		cmd_history = [],
		i_history = null;


	return $(this)
		.each(function(){
			$(this)
				.on('keydown', function(e){
					var self 	= $(this),
						command = self.val();

					switch(e.which){
						case 13: // Send msg
							i_history = null;
							if(self.attr('type') != 'password'){
								config.screen.appendCmd(command);
								cmd_history.push(command);
								if(cmd_history.length > 5){
									cmd_history.splice(0,1);
								}
							}
							config.socket.emit('web input', command);
							self.select();
							if(self.attr('type') == 'password'){
								self
									.val('')
									.attr('type', 'text');
							}
							break;
						case 27: // Esc
							i_history = null;
							self.val('').focus();
							break;
						// Up and Down handle command history.
						// @todo code it cleaner....
						case 38: // Up
							if(cmd_history.length == 0 || i_history < 0){
								return;
							} else {
								if(i_history == null){
									i_history = cmd_history.length;
								}
								if(i_history != 0){
									i_history--;
								}
							}
							self.val(cmd_history[i_history]);
							break;
						case 40: // Down
							if(i_history == null){
								self.val('');
								return;
							} else if(i_history != cmd_history.length){
								i_history++;
							}
							self.val(cmd_history[i_history]);
							break;

						default:
							// Do the thing
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