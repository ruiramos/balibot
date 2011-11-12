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
	this.createPlayerBar();
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

Game.prototype.createPlayerBar = function() {
  this.drawingContext.fillStyle="#121212";
  this.drawingContext.fillRect(Config.canvasWidth-120, 5, Config.canvasWidth-5, Config.canvasHeight-10);
  
  this.drawPlayers();
}
Game.prototype.drawPlayers = function() {
  players = this.playerManager.getAlivePlayers();
  var startX = Config.canvasWidth-110;
  var startY = 10;  
  
  for(i=0;i<players.length;i++){
     this.drawPlayer(startX, startY, this.playerManager.getPlayerByID(players[i]));
    startY+=115;
  } 
  
  deadPlayers = this.playerManager.getDeadPlayers();
  for(i=0;i<deadPlayers.length;i++){
     this.drawInactivePlayer(startX, startY, this.playerManager.getPlayerByID(deadPlayers[i]));
    startY+=115;
  } 

  
}
Game.prototype.drawPlayer = function(x, y, player) {
  console.log(player);
  var playerSqWidth = 100;
  var playerSqHeight = 100;

 // drawingContext.fillStyle = "#38b95a";
//  drawingContext.fillRect(x, y, playerSqWidth, playerSqHeight);
  var that = this;
  var img = new Image();
  img.onload = function(){
   that.drawingContext.drawImage(img,x+playerSqWidth/2-(75/2),y+4, 75, 75);
  }
  img.src = '/bots/'+player.name+".png";
  
  this.drawingContext.fillStyle = player.color;
	this.drawingContext.fillRect(x+2, y+playerSqHeight-17, playerSqWidth-4, 15);
  this.drawingContext.fillStyle = "white";
  this.drawingContext.font = "12px 'Commodore 64 Pixelized'";
  this.drawingContext.textAlign = 'center';
  this.drawingContext.fillText(player.name + " ("+this.playerManager.getPlayerWins(player.ID)+")", x+playerSqWidth/2, y+playerSqHeight-5);

}

Game.prototype.drawInactivePlayer = function(x, y, player) {
  console.log(player);
  var playerSqWidth = 100;
  var playerSqHeight = 100;

  this.drawingContext.fillStyle = "#999999";
  this.drawingContext.fillRect(x, y, playerSqWidth, playerSqHeight);
  
  var that = this;
  var img = new Image();
  img.onload = function(){
   that.drawingContext.drawImage(img,x+playerSqWidth/2-(75/2),y+4, 75, 75);
  }
  img.src = '/bots/'+player.name+".png";
  
  this.drawingContext.fillStyle = player.color;
	this.drawingContext.fillRect(x+2, y+playerSqHeight-17, playerSqWidth-4, 15);
  this.drawingContext.fillStyle = "white";
  this.drawingContext.font = "12px 'Commodore 64 Pixelized'";
  this.drawingContext.textAlign = 'center';
  this.drawingContext.fillText(player.name, x+playerSqWidth/2, y+playerSqHeight-5);

}


Game.prototype.setPlayerBot = function(id, bot){
  this.playerManager.getPlayerByID(id).bot_url = bot;
} 


