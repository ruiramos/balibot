$(document).ready(function() {

var game = Game || {};

(function(Game) {
  var socket = io.connect(),
    canvasID = 'gamecanvas',
    canvas = $('gamecanvas'),
    currentDirections = {},
    numberOfDirectionProcessesPerSecond = 100,
    processCurrentDirectionsIntervalID,
    gameStarted = false;
    
    // Let's expand the game container to maximum possible
    // excluding the player list. I'm saving 8 pxs for the
    // 4px border on canvas.
    var ui = new Ui();
    ui.expandContainer();
    var contW = parseInt($('#container').width())-8;
    var contH = parseInt($('#container').height())-8;

    // The 3rd parameter tells the game that canvas will be "full screen"
    var game = new Game(canvasID, contW, contH, false),

    /**
    * Starts the game, hidding the lobby, showing the canvas
    * and setting gameStarted to true. Also sets the starting
    * directions for each player.
    */
    startGame = function() {
      ui.toggleLobby();
      gameStarted = true;
      game.start();
      clearInterval(processCurrentDirectionsIntervalID);
      startCurrentDirectionsProcess();
    },
    
    /**
    * This is where we define what happens when a round ends.
    * We must show the score for that round, update player scores
    * and update the player list with the total score for
    * each player.
    */
    handleRoundEnd = function(scores) {
      game.stop();
      clearInterval(processCurrentDirectionsIntervalID);
      
      // Show the score table ordered by deaths
      ui.showScoreTable(scores, game.playerManager);
      gameStarted = false;
      
      // Go through the players and update score
      for (var i=0; i<scores.rank.length; i++) {
        var player = game.getPlayer(scores.rank[i]);
        player.score = player.score + scores.rank.length-(i+1);
        // update score on the ui
        ui.updateScore(player);
      }

      // Activate pending players
      game.activatePending();
      ui.activatePending();
      
      // Timeout to hide the score table and go to lobby
      setTimeout(function() {
        if (!gameStarted) {
          ui.toggleLobby();
          ui.hideScoreTable();
        }
      }, 6500);
    },

    /**
    * When a player dies the imei is the unique id
    * of the dying player.
    */
    handlePlayerDeath = function(imei) {
      var player = game.getPlayer(imei);
      socket.emit('die', {imei: player.imei});
    },
    
    /**
    * Adds a player to the game. Also adds the player to the player
    * list on the Ui.
    */
    addPlayer = function(name, imei) {
      var player = game.addPlayer(name, imei);
      player.color = game.playerManager.getPlayerColor(imei);
      player.points = 0;
      player.isPlaying = true;
      
      if (!gameStarted) {
        player.isActive = true;
        ui.addPlayer(player, player.isPlaying);
      } else {
        player.isPlaying = false;
        ui.addPlayer(player, player.isPlaying);
      }

      return player;
    },
    
    removePlayer = function(imei) {
      game.removePlayer(imei);
      ui.removePlayer(imei);
    },
    
    processCurrentDirections = function() {
      var alive = game.playerManager.getAlivePlayers();
      for (var i=0; i<alive.length; i++) {
        var player = game.getPlayer(alive[i]);
        game.handleControl(player.imei, player.currentDirection);
      }
    },
    
    startCurrentDirectionsProcess = function() {
      processCurrentDirectionsIntervalID = setInterval(processCurrentDirections, 1000 / numberOfDirectionProcessesPerSecond);
    },

    setCurrentDirection = function(imei, direction) {
      var player = game.getPlayer(imei);
      player.currentDirection = direction;
    },
    
    init = function() {
      game.setRoundCallback(handleRoundEnd);
      game.setCollisionCallback(handlePlayerDeath);
      
      game.startSession();
      
      // Get game state (useful when refreshing browser)
      socket.emit('state');

      addPlayer("braposo", 120312);
      addPlayer("tpinto", 12931);
      addPlayer("pelf", 23133);
      startGame();
      
      // Player joins
      socket.on('join', function (data) {
        var player = addPlayer(data.name, data.imei);
        socket.emit('color', {imei: player.imei, color: player.color});
      });
      
      // Player send position
      socket.on('pos', function (data) {
        if (gameStarted) {
          var imei = data.imei;
          imei = imei.replace("pos",""); // HACK HACK HACK why this?! 
          setCurrentDirection(imei, data.pos);
        }
      });
      
      // Player disconnects
      socket.on('close', function (data) {
        console.log('Disconnected player '+data.imei);
        removePlayer(data.imei);
      });
      
      // Players wants to start game!
      socket.on('startgame', function (data) {
        if (!gameStarted) {
          startGame();
        }
      });
    }
    
    // Initialize
    init();
  })(Game);
});