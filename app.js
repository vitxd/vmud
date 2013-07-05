var net 			= require('net'),
	express			= require('express'),
	root 			= require('./libs/router.js'),
    app				= module.exports = express.createServer(),
	MemoryStore 	= express.session.MemoryStore,
	sessionStore 	= new MemoryStore({ reapInterval: 60000 * 10 }),
	io 				= require('socket.io'),
	cookie 			= require('cookie'),
	parseCookie 	= require('connect').utils.parseSignedCookie,
	secret 			= 'ioajsdfp9ay97fdhsiufhgasd87ftyas7dtfgaps987dfyg',
	session 		= require('./libs/sessionManagement.js'),
	Converter 		= require('ansi-to-html')
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


var sio = io.listen(app);

sio.set('authorization', function (data, accept) {
	if (data.headers.cookie) {
		data.cookie = cookie.parse(data.headers.cookie); //parseCookie(data.headers.cookie);
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
});


sio.sockets
	.on('connection', function (socket) {
		console.log('IO connect');
		console.log('A socket with sessionID ' + socket.id + ' connected!');
		var cookie = socket.handshake.cookie;
		socket
			.on('setUserInfo', function(data){	
				var i;
				if((i = session.indexOf(cookie['vmud.sid'])) === null){
					var sess = new Object();
					sess.sessionId = cookie['vmud.sid'];
					//sess.userId = data.userId;
					//sess.username = data.username;
					//sess.role = data.role;
					sess.cookie = cookie['vmud.sid'];
					session.add(sess);
				} else {
					var s = session.activate(i);
					console.log('User identified by sessionid "' + s + '" refreshed the page');
					console.log(session.getSessionById(socket.id));
				}
			})
			.on('connectTo', function(data){

				var user 	= session.getSessionById(cookie['vmud.sid']),
					client  = net.connect(data, function(){
						console.log(user.userId + ' connected!');
						user.connected = true;
					});
				user.client = client;

				user.client.on('data', function(data){
					var converter = new Converter(),
						text 		= data.toString();
					text = text 
								.replace(/ /g, '&nbsp;')
								.replace(/\r/gm,'')
								.replace(/\n/gm,'<br />');
					text = converter.toHtml(text);
					socket.emit('socket output',{ data : text });
				})
				.on('disconnect', function(){
					console.log('bye!');
					user.connected = false;
				})
				;


			})
			.on('web input', function(data){
				console.log('Trying to write: ' + data)

				var user = session.getSessionById(cookie['vmud.sid']);

				if(user.connected){
					user.client.write(data + "\n");
				} else {
					console.log('Connection closed...');
					socket.emit('socket output', {data : 'Connection lost'});
				}
			})
			.on('disconnect', function () {
				console.log('Disconnected received by ' + socket.id);
				var user = session.getSessionById(cookie['vmud.sid']);
				if(user !== null){
					console.log('A socket with sessionID ' + user.sessionId + ' disconnected!');
					// clear the socket interval to stop refreshing the session
					session.unactivate(user.sessionId);
					// .client.remove(socket.id);
				}
			});


	/*
	// setup an inteval that will keep our session fresh
	var intervalID = setInterval(function () {
		// reload the session (just in case something changed,
		// we don't want to override anything, but the age)
		// reloading will also ensure we keep an up2date copy
		// of the session with our connection.
		hs.session.reload( function () {
			// "touch" it (resetting maxAge and lastAccess)
			// and save it back again.
			hs.session.touch().save();
		});
	}, 60 * 1000);
*/

	});


