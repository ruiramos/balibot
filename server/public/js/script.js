$(document).ready(function() {

//global window: false

var game = Game || {};

(function(Game) {
    var canvasID = 'canvas',
        domCanvas = document.getElementById(canvasID),
        domStartGameButton = document.getElementById('startgame'),
        domAddPlayerButton = document.getElementById('addplayer'),
        minimalPlayerNameLength = 2,
        keysInUse = {},
        currentDirections = {},
        temporaryString,
        numberOfUnusedControls,
        temporarySortItem,
        numberOfDirectionProcessesPerSecond = 100,
        processCurrentDirectionsIntervalID,
        scoreList = [],
        roundResult = [],
        gameStarted = false,
        i,
        j,
        pendingPlayers = [],
        controls=0,
        player,
        players = [],
        keyPressCount = 0,
        listOfControls = [
            {
                label: 'Left / Right',
                leftKeyCode: 37,
                rightKeyCode: 39,
                inUse: false
            },
            {
                label: 'A / S',
                leftKeyCode: 65,
                rightKeyCode: 83,
                inUse: false
            },
            {
                label: 'G / H',
                leftKeyCode: 71,
                rightKeyCode: 72,
                inUse: false
            },
            {
                label: 'K / L',
                leftKeyCode: 75,
                rightKeyCode: 76,
                inUse: false
            }
        ],
        game = new Game(canvasID, 600, 600, false),
        drawingContext = game.getDrawingContext(),
        setCurrentDirection = function(playerID, direction) {
            currentDirections[playerID] = direction;   
        },
        
        // *** HANDLERS ***
        handleKeyUp = function(event) {
            if (keysInUse[event.keyCode]) {
                setCurrentDirection(keysInUse[event.keyCode].playerID, 0);
                keyPressCount++;
            }
        },
        handleKeyDown = function(event) {
            if (keysInUse[event.keyCode]) {
                setCurrentDirection(keysInUse[event.keyCode].playerID, keysInUse[event.keyCode].direction);
            }
        },
        handleStartGameClick = function() {
            domCanvas.className = 'show';
            //domStartGameButton.onclick = function(){gameStarted = true; game.restart()};

            gameStarted = true;
            game.start();
            game.startSession();
            clearInterval(processCurrentDirectionsIntervalID);
            startCurrentDirectionsProcess();
        },
        handleAddPlayerClick = function() {
            addPlayer("player", controls);
            controls++;
            console.log('add player');
        },
        handleRoundEnd = function(statistics) {
            game.stop();
            console.log('roundEnd');
            saveEndscreen();
            roundResult = statistics.rank;
            
            for (i = 0; i < players.length; i++) {
                if (players[i].isPlaying) {
                    players[i].points = game.playerManager.getPlayerWins(players[i].ID);   
                }
            }

            //updatePlayerList();
            drawEndScreen();
            
            // pending players
            if(pendingPlayers.length > 0){
              $.each(pendingPlayers, function(i, player){
                activateControls(player.ID, player.controlID);
                player.isPlaying = true;
              });
              pendingPlayers = [];
            }
            
            
            setTimeout(function() {
              console.log(gameStarted);
                if(!gameStarted) drawLobbyScreen();
            }, 2500);
        },
        handleRemovePlayerClick = function(event) {
            if (event.target.nodeName.toUpperCase() == 'SPAN') {
                removePlayer(event.target.parentNode.id);
            };
        },
        
        // **** DRAW SCREENS ****
        drawEndScreen = function() {
            console.log('end');
            
            gameStarted = false;
            drawingContext.font = "50px Georgia serif";
            drawingContext.textAlign = 'center';
            var start = (domCanvas.clientHeight / 2) - (50 * players.length) / 2;

            for (i = 0; i < roundResult.length; i++) {
                drawingContext.fillStyle = players[roundResult[i]].color;
                drawingContext.fillText(i + 1 + '. ' + players[roundResult[i]].name, domCanvas.clientWidth / 2, start + i * 50);
            }
                        
        },   
        drawLobbyScreen = function() {
          console.log('lobby');
          
          game.clearFrame();
          drawingContext.font = "50px Georgia serif";
          drawingContext.textAlign = 'center';
          var startY = (domCanvas.clientHeight / 2);
          var startX = (domCanvas.clientWidth / 2);
          
          drawingContext.fillStyle = "white";
          drawingContext.fillText(players.length + " players connected", startX, startY);

        },   
        
        addPlayer = function(name, controlID) {
            player = {};

            player.ID = game.addPlayer(name);
            player.name = name;
            player.color = game.playerManager.getPlayerColor(player.ID);
            player.controlID = controlID;
            player.points = 0;
            player.isPlaying = true;
            players.push(player);
            
            if(!gameStarted){
              activateControls(player.ID, controlID);
              updatePlayerList();            
            } else {
              player.isPlaying = false;
              pendingPlayers.push(player);
            }

        },
        removePlayer = function(playerID) {
          console.log('remove player - TODO!');
            /*playerID = parseInt(playerID, 10);

            game.removePlayer(playerID);
            var index = -1;

            for (i = 0; i < players.length; i++) {
                if (players[i].ID == playerID) {
                    index = i;
                    break;
                }
            }

            delete keysInUse[listOfControls[players[i].controlID].leftKeyCode];
            delete keysInUse[listOfControls[players[i].controlID].rightKeyCode];
            delete currentDirections[playerID];
            listOfControls[players[i].controlID].inUse = false;

            players[index].isPlaying = false;

            //writePlayerControls();

            updatePlayerList();*/
        },
        

        processCurrentDirections = function() {
            for (var playerID in currentDirections) {
                if (currentDirections.hasOwnProperty(playerID)) {
                    game.handleControl(playerID, currentDirections[playerID]);
                }
            }
        },
        startCurrentDirectionsProcess = function() {
            processCurrentDirectionsIntervalID = setInterval(processCurrentDirections, 1000 / numberOfDirectionProcessesPerSecond);
        },
        activateControls = function(playerID, controlID) {
          
          console.log('activateControls: '+playerID+" - "+controlID);
          
            keysInUse[listOfControls[controlID].leftKeyCode] = {
                playerID: playerID,
                direction: -1
            };

            keysInUse[listOfControls[controlID].rightKeyCode] = {
                playerID: playerID,
                direction: 1
            };

            listOfControls[controlID].inUse = true;
        },
        updatePlayerList = function() {
            drawLobbyScreen();
            console.log('update player list - TODO');
            
           /* if (players.length) {
                domPlayerListContainer.className = 'show';

                scoreList = [];

                for (i = 0; i < players.length; i++) {
                    if (players[i].isPlaying) {
                        scoreList.push(players[i]);
                    }
                }

                Utilities.sort(scoreList, 'points');

                temporaryString = '';

                for (i = 0; i < scoreList.length; i++) {
                    temporaryString += '<li id="' + scoreList[i].ID + '" style="color:' + scoreList[i].color + ';"> ' + scoreList[i].name + ' - ' + scoreList[i].points + '  points <span>Remove</span></li>';
                }

                domPlayerList.innerHTML = temporaryString;
            } else {
                domPlayerListContainer.className = 'hide';
            }*/
        },
        getNumberOfUnusedControls = function() {
            numberOfUnusedControls = 0;

            for (i = 0; i < listOfControls.length; i++) {
                if (!listOfControls[i].inUse) {
                    numberOfUnusedControls++;
                }
            }

            return numberOfUnusedControls;
        },
        checkPlayerLimit = function() {
            /*if (getNumberOfUnusedControls()) {
                domAddPlayerContainer.className = 'show';
            } else {
                domAddPlayerContainer.className = 'hide';
            }*/
        },
        saveEndscreen = function() {
            if (keyPressCount < 2) return;

            var data = domCanvas.toDataURL("image/png");

            $.ajax({
                url: "./endscreens/save.php",
                type: "POST",
                data: { data: data, keyPressCount: keyPressCount },
                success: function(response) {}
            });

            keyPressCount = 0;
        }, 
        init = function() {
          
          //handlers
          window.onkeydown = handleKeyDown;
          window.onkeyup = handleKeyUp;  

          domAddPlayerButton.onclick = handleAddPlayerClick;
          domStartGameButton.onclick = handleStartGameClick;
          domStartGameButton.disable = true;
          
          game.setRoundCallback(handleRoundEnd);
          
          //init 
          drawLobbyScreen();
          
        };
  
        init();      
    
})(Game);


});