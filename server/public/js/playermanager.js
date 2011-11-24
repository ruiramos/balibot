var PlayerManager = function() {
  this.players = [];
  this.colorManager = new ColorManager(Config.colorSaturation, Config.colorValue);
};

PlayerManager.prototype.addPlayer = function(name, imei) {
  var player = new Player();
  
  player.name = name;
  player.imei = imei;
  player.color = this.getColor();
  
  this.players.push(player);
  return player;
};

PlayerManager.prototype.removePlayer = function(imei) {
  for (var i=0; i<this.players.length; i++) {
    var player = this.players[i];
    if (player.imei == imei) {
      this.players.splice(i, 1);
      return;
    }
  }
}

PlayerManager.prototype.initializePlayers = function() {
  for (var i=0; i<this.players.length; i++) {
    var player = this.players[i];
    player.x = Utilities.random(Config.canvasWidth / 4, 3 * Config.canvasWidth / 4);
    player.y = Utilities.random(Config.canvasHeight / 4, 3 * Config.canvasHeight / 4);
    player.angle = Math.random() * 360;
    player.isPlaying = true;
    player.isAlive = true;
    player.resetTimeout();
  }
};

PlayerManager.prototype.getPlayer = function(imei) {
  for (var i=0; i<this.players.length; i++) {
    var player = this.players[i];
    if (player.imei == imei) {
      return player;
    }
  }
  return null;
}

PlayerManager.prototype.getColor = function() {
  return this.colorManager.convertRGBToHex(this.colorManager.getColor());
};

PlayerManager.prototype.getNewPlayerColor = function(imei) {
  var newColor = this.getColor();
  var player = this.getPlayer(imei);
  player.color = newColor;
  return newColor;
};

PlayerManager.prototype.navigatePlayer = function(imei, direction) {
  var player = this.getPlayer(imei);
  player.navigate(direction);
};

PlayerManager.prototype.numberOfPlayersAlive = function() {
  var count = 0;
  for (var i=0; i<this.players.length; i++) {
    if (this.players[i].isAlive) {
      count++;
    }
  }
  return count;
};

PlayerManager.prototype.numberOfPlayers = function() {
  return this.players.length;
};

PlayerManager.prototype.resetScores = function() {
  for (var i=0; i<this.players.length; i++) {
    this.players[i].wins = 0;
    this.players[i].distane = 0;
  }
};

PlayerManager.prototype.getPlayerName = function(imei) {
  var player = this.getPlayer(imei);
  return player.name;
};

PlayerManager.prototype.getPlayerDistance = function(imei) {
  var player = this.getPlayer(imei);
  return player.distance;
};

PlayerManager.prototype.getPlayerColor = function(imei) {
  var player = this.getPlayer(imei);
  return player.color;
};

PlayerManager.prototype.getPlayerWins = function(imei) {
  var player = this.getPlayer(imei);
  return player.wins;
};

PlayerManager.prototype.getAlivePlayers = function() {
  var alivePlayers = [];
  
  for (var i=0; i<this.players.length; i++) {
    if (this.players[i].isAlive) {
      alivePlayers.push(this.players[i].imei);
    }
  }
  return alivePlayers;
};

PlayerManager.prototype.getDeadPlayers = function() {
  var deadPlayers = [];
  
  for (var i=0; i<this.players.length; i++) {
    if (!this.players[i].isAlive) {
      deadPlayers.push(this.players[i].imei);
    }
  }
  return deadPlayers;
};