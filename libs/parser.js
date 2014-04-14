var fs = require('fs');
var Converter = require('./ansi-to-html.js');
fs.readFile('/Users/vitxd/develop/vmud/mud_stream', function (err, data) {

	console.log(data);
//	var text = data.toString();
//
//	for (var i = 0 ; i < text.length ; i ++){
//		console.log(text.charAt(i) + '  => ' + text.charCodeAt(i));
//	}
	console.log('hello');
	var parser = new Converter();
	parser.toHtml(data.toString());



});


