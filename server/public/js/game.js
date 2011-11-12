var Game = function(canvasID, canvasWidth, canvasHeight , useFullscreen ) {
    if (arguments[3]) {
        this.useFullscreen = arguments[3];
    }

    Config.canvasWidth = canvasWidth;
    Config.canvasHeight = canvasHeight;
	
    this.canvasElement = document.getElementById(canvasID);

    if (this.useFullscreen) {
        Config.canvasWidth = window.innerWidth-30;
        Config.canvasHeight = window.innerHeight-30;
    }

    this.canvasElement.width = Config.canvasWidth;
    this.canvasElement.height = Config.canvasHeight; 
    
    if (this.canvasElement.getContext) {
        this.drawingContext = this.canvasElement.getContext('2d');
    } else {
        throw 'No canvas support';
    }
	
    this.playerManager = new PlayerManager();
    this.engine = new Engine(this.drawingContext, this.playerManager.players);
	this.engineOnHalt = false;
};

Game.prototype.getDrawingContext = function() {
    return this.drawingContext;  
};

Game.prototype.start = function() {
	this.clearFrame();
	
	if (this.playerManager.numberOfPlayers() < 1) {
		this.engineOnHalt = true;
		this.drawFrame();
		return;
	}
	
	this.drawFrame();
	this.playerManager.initializePlayers();
	this.engine.start();
	this.engineOnHalt = false;
};

Game.prototype.restart = function() {
	this.engine.stop();
	this.start();
};

Game.prototype.stop = function() {
	this.engine.stop();
};

Game.prototype.addPlayer = function(name) {
    var playerID = this.playerManager.addPlayer(name);
	
	if (this.engineOnHalt) {
		this.start();
	}
	
	return playerID;
};

Game.prototype.removePlayer = function (playerID) {
	this.playerManager.removePlayer(playerID);
	/*
	if (this.playerManager.numberOfPlayersAlive() < 2) {
		this.stop();

        if (this.engine.onRoundOver) {
            this.engine.onRoundOver();
        }
	}*/
};

Game.prototype.activatePlayer = function (playerID) {
  this.playerManager.activatePlayer(playerID);
}

Game.prototype.activePlayers = function (playerID) {
  return this.playerManager.numberOfPlayers();
}


Game.prototype.handleControl = function(playerID, direction) {
    this.playerManager.navigatePlayer(playerID, direction);  
};

Game.prototype.setCollisionCallback = function(callback) {
	this.engine.setCollisionCallback(callback);
};

Game.prototype.setRoundCallback = function(callback) {
	that = this;
	
	this.engine.setRoundCallback(function() {
		that.engine.playerRank.unshift(that.playerManager.getAlivePlayers()[0]);
		
		var stats = {
			winnerID: that.playerManager.getAlivePlayers()[0],
			rank: that.engine.playerRank
		}
		
		callback(stats);
	});
};

Game.prototype.startSession = function() {
	this.playerManager.resetScores();
	this.engine.countWins = true;
};

Game.prototype.stopSession = function() {
	this.engine.countWins = false;
};

Game.prototype.drawFrame = function () {
	this.drawingContext.lineWidth = 10;
	this.drawingContext.strokeStyle = "#368b37";
	this.drawingContext.strokeRect(0, 0, Config.canvasWidth - 0, Config.canvasHeight - 0);
};

Game.prototype.clearFrame = function () {
  this.drawingContext.clearRect(0, 0, Config.canvasWidth, Config.canvasHeight);
};

