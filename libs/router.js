var View = require('./view.js')
	;

/*
 * GET home page.
 */

exports.router = function(req, res){
	new Router(req, res);
};

var Router = function(req, res){

    this.req		= req;
    this.res		= res;

	this.view 		= new View(res);

	this.method 	= req.method;
	//this.session 	= req.session;

	this.post		= req.body;

	this.url 		= req.url;

	this.view.set('site_type', 'development');

    this._init();
	this.close();
};

Router.prototype.isPost = function(){
	return (this.method == 'POST');
};

Router.prototype.isLogged = function(){
	//return (typeof this.session.user === 'object');
};

Router.prototype._init = function(){
	switch(this.url){
		case '/connections':
			this.connections();
			break;
		case '/':
			this.index();
			break;
		default:
			this.notFound();
	}
};

Router.prototype.connections = function(){
	var connections = {
		connections : [
			{
				id   : 123,
				name : 'test',
				host : 'leu.mclink.it',
				post : 6000
			},
			{
				id   : 123,
				name : 'test',
				host : 'leu.mclink.it',
				post : 6000
			},
			{
				id   : 123,
				name : 'test',
				host : 'leu.mclink.it',
				post : 6000
			}
		]
	};
	this.res.json(connections);
};

Router.prototype._setUser = function(user){
	//this.session.user 	= user;
};

Router.prototype.notFound = function(){
	this.view.setLayout('').set('url', this.url).setCode(404).display('404.html');
};

Router.prototype.index = function(){
	this.view
		.addLibrary('/socket.io/socket.io.js')
		.addLibrary('/js/menu.js')
		.addLibrary('/js/vmud.js')
		.addLibrary('/js/cmd.js')
		.addLibrary('/js/global.js')
		.display('index.html');
};

Router.prototype._getUser = function(){
	//return this.session.user;
};

Router.prototype.login = function(err){
	if(this.isLogged())
		return this.index();

	this.view
		.addLibrary('js/login.js')
		.set('error', err)
		.display('login.html')
};

Router.prototype._setGroups = function(groups){
	// this.session.groups = groups;
	return this;
};

Router.prototype.doLogin = function(){

	UserModel
		.findOne({username : this.post.username})
		.populate('groups', 'name groups')
		.exec(function(err, user){
			try{

				if(err) throw new Error(err);
				if(user === null) {
					console.log('User is null: ');
					console.log(user);
					throw new Error('User does not exist');
				}

				if(user.authenticate(this.post.password)){
					this._setUser(user);
					this._setGroups(user.groups);
					this.index();
				}
				else
					throw new Error('Wrong password');

			} catch (err) {
				console.log('Exception caught: ' + err.message);
				this.login(true);
			}
	}.bind(this));



};

Router.prototype.close = function(){
	//this.session.save();
}
