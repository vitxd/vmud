var net 			= require('net'),
    express 		= require('express'),
	root 			= require('./libs/router.js'),
	app 			= module.exports = express.createServer(),
	MemoryStore 	= express.session.MemoryStore,
	sessionStore 	= new MemoryStore({ reapInterval: 60000 * 10 }),
	io 				= require('socket.io'),
	Cookie 			= require('cookie'),
	parseCookie 	= require('connect').utils.parseSignedCookie,
	secret 			= 'ioajsdfp9ay97fdhsiufhgasd87ftyas7dtfgaps987dfyg',
	session 		= require('./libs/sessionManagement.js'),
	Converter 		= require('./libs/ansi-to-html.js')
	;

app.configure(function(){
    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
	app.use(express.cookieParser(secret));
	app.use(express.session({
		store	: sessionStore,
		key		: 'vmud.sid',
		secret	: 'asdiufhaisd7fh8asd6fg3645r34',
		cookie 	: {
        	path 		: '/'
    	    ,expires 	: false // Alive Until Browser Exits
    	    ,httpOnly 	: true
    		//  ,domain:'.example.com'
    	}
	}));
	app.register(".html", require('handlebars'));
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes
app.get('/', root.router);

app.listen(3000, function(){
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

setInterval(function(){
	console.log('clearing expired cache');
	var num = session.removeUnactive(function(session){
		session.socket.close();
		session.client.end();
	});
	console.log('Cleared ' + num + ' cache');
},60000);

var sio = io.listen(app);

sio
	.set('authorization', function (data, accept) {
		if (data.headers.cookie) {
			data.cookie = Cookie.parse(data.headers.cookie);
			data.sessionID = parseCookie(data.cookie['vmud.sid'], secret);
			// (literally) get the session data from the session store
			sessionStore.get(data.sessionID, function (err, session) {
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
	.set('transport', ['websocket'])
	.sockets
		.on('connection', function (socket) {
			console.log('IO connect');
			console.log('A websocket with sessionID ' + socket.id + ' connected!');
			var cookie = socket.handshake.cookie;
			socket
				.on('setUserInfo', function(data){
					var user = session.getSessionById(cookie['vmud.sid']);
					if(user === null){
						var user = new Object();
						user.sessionId = cookie['vmud.sid'];
						user.cookie = cookie['vmud.sid'];
						user.connected = true;
						session.add(user);
					} else {
						var s = session.activate(user.sessionId);
						user.connected = true;
						console.log('User identified by sessionid "' + s + '" refreshed the page');
						console.log(user);
					}
					user.socket = socket;
				})
				.on('connectTo', function(data){

					var user 	= session.getSessionById(cookie['vmud.sid']),
						client  = net.connect(data, function(){
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
										.replace(/\n/gm,'<br />');
							text = converter.toHtml(text);
							if(user.connected){
								user.socket.emit('socket output',{ data : text });
							} else {
								console.log('Ehm... no one listening...');

							}
						})
						.on('disconnect', function(){
							console.log('socket disconnected!!');
							user.socket.emit('remote closed', {disconnect: true})
						})
					;


				})
				.on('close remote connection', function(){
					console.log('user requested a connection close');
					var user = session.getSessionById(cookie['vmud.sid']);
					user.client.end();
					user.socket.emit('remote closed',{disconnected: true});
				})
				.on('web input', function(data){
					console.log('Trying to write: ' + data)

					var user = session.getSessionById(cookie['vmud.sid']);

					if(user.connected && typeof user.client == 'object' ){
						user.client.write(data + "\n");
					} else {
						console.log('Connection closed...');
						user.socket.emit('system output', {data : 'Connection lost'});
					}
				})
				.on('disconnect', function () {
					console.log('Disconnected received by ' + socket.id);
					var user = session.getSessionById(cookie['vmud.sid']);
					if(user !== null){
						console.log('A websocket with sessionID ' + user.sessionId + ' disconnected!');
						user.connected = false;
						session.unactivate(user.sessionId);
					}
				});
		});


