var express 		= require('express'),
	root 			= require('./libs/router.js'),
	app 			= module.exports = express.createServer(),
	MemoryStore 	= express.session.MemoryStore,
	sessionStore 	= new MemoryStore({ reapInterval: 60000 * 10 }),
	io 				= require('socket.io'),
	Websocket		= require('./libs/websocket.js'),
	secret 			= 'ioajsdfp9ay97fdhsiufhgasd87ftyas7dtfgaps987dfyg'
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
		secret	: secret,
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
app.get('*', root.router);

app.listen(3000, function(){
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


var sio = io.listen(app);

new Websocket(sio, sessionStore, secret);


process.on('uncaughtException',function(error){
	console.log('' + error );
	console.trace();
});
