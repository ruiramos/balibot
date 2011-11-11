var players = new Array(4);

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

exports.addPlayer = function(socket, imei, name) {
  var player = new Player(socket, imei, name);
  for (var i=0; i<players.length; i++) {
    var p = players[i];
    if (p == null) {
      console.log("Adding player "+player.getName());
      players[i] = player;
      return;
    } else if (p.getSocket()==null || p.getSocket().destroyed) {
      console.log("Adding player "+player.getName()+" on previous slot.");
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