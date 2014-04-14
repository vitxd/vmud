var net 			= require('net'),
	Cookie 			= require('cookie'),
	parseCookie 	= require('connect').utils.parseSignedCookie,
	sessionMng 		= require('./sessionManagement.js'),
	Converter 		= require('./ansi-to-html.js'),
	Mongo			= require('./mongo.js')
;

Websocket = function(sio, sessionStore, secret){
	this.sio 			= sio;
	this.sessionStore 	= sessionStore;
	this.secret 		= secret;

	this._init();
	this._initSignals();
	this._initSessionClear();
};

Websocket.prototype._init = function(){
	var self = this;
	this.sio
		.set('authorization', function (data, accept) {
			if (data.headers.cookie) {
				data.cookie = Cookie.parse(data.headers.cookie);
				data.sessionID = parseCookie(data.cookie['vmud.sid'], self.secret);
				// (literally) get the session data from the session store
				self.sessionStore
					.get(data.sessionID, function (err, session) {
						if (err || !session) {
							// if we cannot grab a session, turn down the connection
							accept('Error', false);
						} else {
							// save the session data and accept the connection
							data.session = session;
							accept(null, true);
						}
					});
			} else {
				return accept('No cookie transmitted.', false);
			}
		})
		.set('transport', ['websocket']);
};

Websocket.prototype._initSessionClear = function(){
	setInterval(function(){
		console.log('clearing expired cache');
		var num = sessionMng.removeUnactive(function(session){
			session.socket.close();
			session.client.end();
		});
		console.log('Cleared ' + num + ' cache');
	},60000);
};

Websocket.prototype._initSignals = function(){
	var self = this;
	this.sio
		.sockets
		.on('connection', function (socket) {
			console.log('IO connect');
			console.log('A websocket with sessionID ' + socket.id + ' connected!');
			var cookie = socket.handshake.cookie;
			socket
				.on('setUserInfo', function(data){
					var user = sessionMng.getSessionById(cookie['vmud.sid']);
					if(user === null){
						var user = new Object();
						user.sessionId 			= cookie['vmud.sid'];
						user.client_connected 	= false; 	// connected to the mud
						sessionMng.add(user);
					} else {
						sessionMng.activate(user.sessionId);
						console.log('User identified by sessionid "' + user.sessionId + '" refreshed the page');
					}
					user.socket = socket;
				})
				.on('connectTo', self.connect)
				.on('close remote connection', function(){
					console.log('user requested a connection close');
					var user = sessionMng.getSessionById(cookie['vmud.sid']);
					try{
						user.client.end();
					} catch(e){
						console.log(e);
					}
					user.client_connected = false;
					user.socket.emit('remote closed',{disconnected: true});
				})
				.on('web input', function(data){
					console.log('Trying to write: ' + data)

					var user = sessionMng.getSessionById(cookie['vmud.sid']);

					if(user.client_connected && typeof user.client == 'object' ){
						user.client.write(data + "\n");
					} else {
						console.log('Connection closed...');
						user.socket.emit('system output', {data : 'Connection lost'});
					}
				})
				.on('open stored connection', function(data){
					var connection = Mongo.getConnection(data.id);
					self.connect(connection);
				})
				.on('disconnect', function () {
					console.log('Disconnected received by ' + socket.id);
					var user = sessionMng.getSessionById(cookie['vmud.sid']);
					if(user !== null){
						console.log('A websocket with sessionID ' + user.sessionId + ' disconnected!');
						sessionMng.unactivate(user.sessionId);
					}
				});
		});
};

Websocket.prototype.connect = function(data){
	var user 	= sessionMng.getSessionById(cookie['vmud.sid']),
		client  = net.connect(data, function(){
			user.client_connected = true;
			console.log(user.userId + ' connected!');
		});

	user.client = client;

	user.client
		.on('data', function(data){
			console.log('incoming data');

			var converter = new Converter(),
				text 		= data.toString();
			text = text
				.replace(/ /g, '&nbsp;')
				.replace(/\r/gm,'')
				.replace(/</gm, '&lt;')
				.replace(/>/gm, '&gt;')
				.replace(/\n/gm,'<br />')
			;
			text = converter.toHtml(text);
			if(sessionMng.isActive(user.sessionId)){
				user.socket.emit('socket output',{ data : text });
			} else {
				console.log('Ehm... no one listening...');

			}
		})
		.on('end', function(){
			console.log('socket disconnected!!');
			user.socket.emit('remote closed', {disconnect: true});
			user.client_connected = false;
		})
	;
};

module.exports = Websocket;