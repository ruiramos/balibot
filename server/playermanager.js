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

Player.prototype.getSocket = function() {
  return this.socket;
}

Player.prototype.getName = function() {
  return this.name;
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
    } else if (players[i].getSocket()==null || players[i].getSocket().destroyed) {
      console.log("Adding player "+player.getName()+" on previous slot: "+i);
      players[i] = player;
      return;
    } else {
      // can't add more players!
    }
  }
};

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