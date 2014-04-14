var   mongoose 	= require('mongoose')
	, Schema	= mongoose.Schema
	, db 		= mongoose.createConnection('localhost', 'shopperlo')
	;

module.exports.db		= db;
module.exports.Schema	= Schema;
