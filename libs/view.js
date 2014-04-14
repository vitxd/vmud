View = function(response){
	this.response = response;
	this.code = 200;
	this.obj = {
		layout : 'layout.html',
		locals : {
			libraries : []
		}
	}
};

View.prototype.set = function(key, value){
	if(typeof key === 'string' && key.length && key != 'layout' && key != 'libraries')
		this.obj.locals[key] = value;
	return this;
};

View.prototype.setCode = function(code){
	this.code = code;
	return this;
};

View.prototype.setLayout = function(layout){
	this.obj.layout = layout;
	return this;
};

View.prototype.addLibrary = function(library){
	this.obj.locals.libraries.push(library);
	return this;
}

View.prototype.display = function(filename){
	this.response.status(this.code);
	this.response.render(filename, this.obj);
	return this;
}

View.prototype.debug = function(key){
	console.log('[VIEW-DEBUG] Key (' + key + '): ' + this.obj.locals[key]);
}

module.exports = View;
