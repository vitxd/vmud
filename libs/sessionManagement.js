var sessions = [],
	unactive = [];

//User roles list
var userRoles = {
  Admin: "administrator",
  User: "user",
  Supervisor: "supervisor"
};

var sessionManagement = {
  indexOf: function(sessionId) {
    for(var i in sessions) {
        if(sessions[i].sessionId == sessionId)
            return i;
    }
    
    return null;
  },
  indexOfUser: function(userId) {
    for(var i in sessions) {
        if(sessions[i].userId == userId)
            return i;
    }
    
    return null;
  },
  
  add: function(sessionData) {
    sessions.push(sessionData);
  },
  remove: function(sessionId) {
    var index = this.indexOf(sessionId);
    if(index != null) {
        sessions.splice(index, 1);
    } else {
        return null;
    }
  },
  removeByUserId: function(userId) {
    var index = this.indexOf(userId);
    if(index != null) {
        sessions.splice(index, 1);
    } else {
        return null;
    }
  },
  
  getSessionById: function(sessionId) {
    var index = this.indexOf(sessionId);
    if(index != null) {
        return sessions[index];
    } else {
        return null;
    }
  },
  getSessionByUserId: function(sessionId) {
    var index = this.indexOfUser(userId);
    if(index != null) {
        return sessions[index];
    } else {
        return null;
    }
  },
  
  isAdmin: function(userId) {
    var index = this.indexOfUser(userId);
    if(index != null) {
        if(users[index].role == userRoles.Admin) {
            return true;
        } else {
            return false;
        }
    } else {
        return null;
    }
  },
  getUsersByRole: function(role) {
    var usersByRole = [];
    for(var i in users) {
        if(users[i].role == role)
            usersByRole.push(users[i]);
    }
    
    return usersByRole;
  },
  removeUnactive: function() {
    for(var i in unactive) {
      if(unactive[i].time < (Math.round(new Date().getTime() / 1000) - 20 * 60 * 60)){
        var session = this.getSessionById(unactive[i].sessionId);
        session.client.end();
        this.removeByUserId(session.sessionId);
      }
	}
  },
  unactivate: function(sessionId){
    unactive.push({time: Math.round(new Date().getTime() / 1000), sessionId : sessionId});
  },
  activate: function(index) {
	var sessionId = this.sessions[index].sessionId;
    for(var i in unactive) {
      if(unactive[i].sessionId == sessionId)
        unactive.splice(i, 1);
    }

	return sessionId;
  }
};

module.exports = sessionManagement;
