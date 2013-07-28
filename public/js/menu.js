Menu = function(menu){
	this.menu = menu;
	this.open = false;
	this._initHandlers();
};

Menu.prototype._initHandlers = function(){
	var self = this;

	$('*').not('#menu')
		.click(function(){
			if($(this).closest('#menu').length == 0){
				self.closeMenu();
			}
		});

	self.menu
		.on('click', 'li', function(e){
			e.stopPropagation();
			self.click($(this));
		})
		.on('mouseover', 'ul > li', function(){
			if(self.open){
				$('.hover').removeClass('hover');
				$(this).addClass('hover');
			}
		});
};

Menu.prototype.click = function(obj){
	if(this.open){
		var action = obj.find('a').attr('data-action');
		console.log(action);
		if(typeof Menu[action] == 'function'){
			Menu[action]();
		}
		this.closeMenu();
	} else {
		this.open = true;
		obj.addClass('hover');
	}
};

Menu.prototype.closeMenu = function(){
	this.open = false;
	$('.hover').removeClass('hover');
};


Menu.connect = function(){
	$( "#dialog-connect" ).dialog('open');
};