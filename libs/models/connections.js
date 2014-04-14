var   db = require('./db.js').db
	, Schema = require('./db.js').Schema
	;

Connections = new Schema({
	name 	: String,
	host 	: String,
	port 	: Number
});

module.exports.schema 		= Connections;
module.exports.Connections	= db.model('Connections', Connections);