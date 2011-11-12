var MAX_PLAYERS = 6;
var players = new Array(MAX_PLAYERS);

/***************
* Player class
****************/
var Player = function(socket, imei, name) {
  this.imei = imei;
  this.socket = socket;
  this.name = name;
  this.points = 0;
}

Player.prototype.send = function(message) {
  if (this.socket != null && this.isConnected()) {
    this.socket.write(message+"\n");
  }
}

Player.prototype.isConnected = function() {
  if (this.socket == null) {
    return false;
  }
  return !this.socket.destroyed;
}

Player.prototype.getSocket = function() {
  return this.socket;
}

Player.prototype.getName = function() {
  return this.name;
}

Player.prototype.getIMEI = function() {
  return this.imei;
}

/**************************
* Playermanager functions
**************************/
exports.addPlayer = function(socket, imei, name) {
  var player = new Player(socket, imei, name);
  for (var i=0; i<players.length; i++) {
    if (players[i] == null) {
      console.log("Adding player "+player.getName());
      players[i] = player;
      return;
    } else if (players[i].getSocket()==null || players[i].isConnected()) {
      console.log("Adding player "+player.getName()+" on previous slot: "+i);
      players[i] = player;
      return;
    } else {
      // can't add more players!
    }
  }
};

exports.findByImei = function(imei) {
  for (var i=0; i<players.length; i++) {
    if(players[i]==null){ 
      players.splice(i,1);
      continue;
    }
    console.log(":: "+players[i].name + " - "+players[i].imei);
    
    if (players[i] != null && players[i].isConnected()) {
      if (players[i].imei == imei) {
        return players[i];
      }
    }
  }
  return null;
}

exports.findBySocket = function(s) {
  for (var i=0; i<players.length; i++) {
    if (players[i] != null && players[i].socket == s) {
      return players[i];
    }
  }
}
  
exports.findDisconnected = function(){
  for (var i=0; i<players.length; i++) {
    if (players[i] != null && players[i].socket.destroyed) {
      return players[i];
    }
  }  
}

exports.clearDeadPeople = function(){
  for (var i=0; i<players.length; i++) {
    if (players[i] != null && players[i].socket.destroyed) {
      players.splice(i,1);
    }
  }  
}
exports.getPlayers = function() {
  return players;
}
exports.setPoints = function(points) {
  m_points = points;
}

exports.getName = function() {
  return m_name;
}

exports.getSocket = function() {
  return m_socket;
};