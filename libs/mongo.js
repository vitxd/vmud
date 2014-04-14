Mongo = {
	getConnections: function(callback){
		ConnectionsModel = require('./connections.js').connections;
		ConnectionsModel
			.findAll();
	}
}
