Menu = function(menu){
	this.menu = menu;
	this.open = false;
	this.vMud = null;
	this._initHandlers();
	this._initModals();
};

Menu.prototype.setMud = function(vMud){
	this.vMud = vMud;
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


Menu.prototype._initModals = function(){
	var self = this;
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
					$(this).dialog("close");
					self.vMud.connect(connection);
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			}
		});
	$( "#dialog-connections" )
		.dialog({
			autoOpen: false,
			height: 300,
			width: 350,
			modal: true,
			open: function(){
				var modal = $(this);
				$.ajax({
					url: '/connections',
					method: 'GET',
					dataType: 'json',
					success: function(data){

						var source   	= $("#connection-template").text().replace(/\{%(.*?)%\}/mg, '{{$1}}'),
							template 	= Handlebars.compile(source);
						$('#dialog-connections table tbody').html(template(data));
						$('table.connections').tableSelect({
							onClick : function(e){

							},
							onDblClick : function(row, e){
								var id = row.attr('data-id');
								modal.dialog('close');
								self.vMud.connectStored(id)
							}
						});
					}
				});
			},
			buttons: {
				Connect: function() {
//					var connection = {};
//					$(this).find('form input[type="text"]').each(function(){
//						connection[$(this).attr('name')] = $.trim($(this).val());
//					});
//					$(this).dialog("close");
//					self.vMud.connect(connection);
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			}
		});
};

Menu.prototype.click = function(obj){
	if(this.open){
		var action = obj.find('a').attr('data-action');
		if(typeof Menu[action] == 'function'){
			Menu[action](this.vMud);
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

Menu.disconnect = function(vMud){
	vMud.disconnect();
};

Menu.connections = function(){
	$( "#dialog-connections").dialog('open');
};