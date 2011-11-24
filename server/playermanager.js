var MAX_PLAYERS = 2;
var players = [];

/***************
* Player class
****************/
var Player = function(socket, imei, name) {
  this.imei = imei;
  this.socket = socket;
  this.name = name;
  this.points = 0;
}

Player.fn = Player.prototype;

Player.fn.send = function(message) {
  if (this.socket != null && this.connected()) {
    this.socket.write(message+"\n");
  }
}

Player.fn.connected = function() {
  if (this.socket == null) {
    return false;
  }
  return !this.socket.destroyed;
}

/**************************
* Playermanager functions
**************************/
exports.addPlayer = function(socket, imei, name) {
  var player = new Player(socket, imei, name);
  if (players.length<MAX_PLAYERS) {
    players.push(player);
    return true;
  } else {
    console.log("Player list is full. Can't add more players!");
    return false;
  }
};

exports.removePlayer = function(imei) {
  for (var i=0; i<players.length; i++) {
    var player = players[i];
    if (player.imei == imei) {
      players.splice(i, 1);
      return true;
    }
  }
  return false;
}

exports.findByImei = function(imei) {
  for (var i=0; i<players.length; i++) {
    var player = players[i];
    if (player.imei == imei) {
      return player;
    }
  }
  return null;
}

exports.findClosed = function() {
  for (var i=0; i<players.length; i++) {
    var player = players[i];
    if (player.socket.destroyed) {
      return player;
    }
  }
}

exports.getAllPlayers = function() {
  return players;
}