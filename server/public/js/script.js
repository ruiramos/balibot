$(document).ready(function() {

//global window: false

var game = Game || {};

(function(Game) {
    var canvasID = 'canvas',
        domCanvas = document.getElementById(canvasID),
 //       domStartGameButton = document.getElementById('startgame'),
//        domAddPlayerButton = document.getElementById('addplayer'),
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
        playerImeiToId = [],
        i,
        j,
        socket,
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
        game = new Game(canvasID, 600, 600, true),
        drawingContext = game.getDrawingContext(),
        setCurrentDirection = function(playerID, direction) {
            currentDirections[playerID] = direction;   
        },
        
        // *** HANDLERS ***
        /*handleKeyUp = function(event) {
            if (keysInUse[event.keyCode]) {
                setCurrentDirection(keysInUse[event.keyCode].playerID, 0);
                keyPressCount++;
            }
        },
        handleKeyDown = function(event) {
            if (keysInUse[event.keyCode]) {
                setCurrentDirection(keysInUse[event.keyCode].playerID, keysInUse[event.keyCode].direction);
            }
        },*/
        handleStartGameClick = function() {
            gameStarted = true;
            game.start();
            clearInterval(processCurrentDirectionsIntervalID);
            startCurrentDirectionsProcess();
        },
        handleAddPlayerClick = function() {
            addPlayer("player", controls);
            controls++;
            console.log('add player');
        },
        handlePlayerDeath = function(playerID){
            for(i=0; i<players.length;i++)
              if(players[i].ID == playerID){
                socket.emit('die', {playerImei: players[i].imei});
                console.log("------------ morreu o :"+players[i].name);
                break;
              }
          
        }
        handleRoundEnd = function(statistics) {
            game.stop();
            clearInterval(processCurrentDirectionsIntervalID);
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
            gameStarted = false;
            
            
            // pending players
            if(pendingPlayers.length > 0){
              $.each(pendingPlayers, function(i, player){
                activateControls(player.ID, player.controlID);
                players[player.ID].isPlaying = true;
                players[player.ID].isActive = true;
                
              });
              pendingPlayers = [];
            }
            
            
            setTimeout(function() {
              console.log(gameStarted);
                if(!gameStarted){
                  drawLobbyScreen();
                } 
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
            
            drawingContext.font = "70px 'Commodore 64 Pixelized'";
            drawingContext.textAlign = 'center';
            var start = (domCanvas.clientHeight / 2) - (50 * players.length) / 2;
            
            console.log(roundResult);

            for (i = 0, pos = 0; i < roundResult.length; i++) {
              if(players[roundResult[i]]){
                drawingContext.fillStyle = players[roundResult[i]].color;
                drawingContext.fillText(pos + 1 + '. ' + players[roundResult[i]].name, domCanvas.clientWidth / 2, start + i * 50);
                pos++;
              }
            }
                        
        },   
        drawLobbyScreen = function() {
          console.log('lobby');
          
          game.clearFrame();
          
          drawingContext.fillStyle = "#368b37";
          drawingContext.fillRect(0, 0, Config.canvasWidth, Config.canvasHeight);
          
          var startY = 100;
          var startX = 0;
          
          drawingContext.fillStyle = "#38b95a";
          drawingContext.fillRect(startX+50, startY, Config.canvasWidth, 25);
          
          var img = new Image();
          img.onload = function(){
            drawingContext.drawImage(img,startX-10,startY-75);
          };
          img.src = '/bot.png';
          
          
          startYt = (domCanvas.clientHeight / 2)+35;
          startXt =  30;
          
          drawingContext.font = "90px 'bitween 10'";
          drawingContext.textAlign = 'left';
          drawingContext.fillStyle = "white";
          drawingContext.fillText("BALIBOT", startXt, startYt);
          
          drawingContext.font = "22px 'Commodore 64 Pixelized'";
          
          drawingContext.fillText("Please connect controllers and", startXt, startYt+40);
          drawingContext.fillText("press the Start button!", startXt, startYt+62);
          
          drawPlayers();

        },   
        drawPlayers = function(){
          //draw players
          
          drawingContext.fillStyle = "#368b37";
        	drawingContext.fillRect(700, 100, Config.canvasWidth, Config.canvasHeight);
          drawingContext.fillStyle = "white";
          
          var startYp = 120;
          var startXp = 750;
          drawingContext.font = "18px 'Commodore 64 Pixelized'";
          drawingContext.textAlign = 'left';
          drawingContext.fillText(game.activePlayers() + " players", startXp-2, startYp);
          startYp += 15;
          
          for(i=0;i<players.length;i++){
            if(players[i].isActive) drawPlayer(startXp, startYp, players[i]);
            //else drawInactivePlayer(startXp, startYp, players[i]);
            startYp += 105;
          }
          
        },
        drawPlayer = function(x, y, player){
          var playerSqWidth = 125;
          var playerSqHeight = 100;
      
          drawingContext.fillStyle = "#38b95a";
          drawingContext.fillRect(x, y, playerSqWidth, playerSqHeight);
          
          var img = new Image();
          img.onload = function(){
            drawingContext.drawImage(img,x+playerSqWidth/2-(75/2),y+4, 75, 75);
          };
          img.src = '/bots/'+player.name+".png";
          
          drawingContext.fillStyle = player.color;
        	drawingContext.fillRect(x+2, y+playerSqHeight-17, playerSqWidth-4, 15);
          drawingContext.fillStyle = "white";
          drawingContext.font = "12px 'Commodore 64 Pixelized'";
          drawingContext.textAlign = 'center';
          drawingContext.fillText(player.name, x+playerSqWidth/2, y+playerSqHeight-5);
          
        },
        drawInactivePlayer = function(x, y, player){
          var playerSqWidth = 125;
          var playerSqHeight = 100;
      
          drawingContext.fillStyle = "#aeaeae";
          drawingContext.fillRect(x, y, playerSqWidth, playerSqHeight);
          
          var img = new Image();
          img.onload = function(){
            drawingContext.drawImage(img,x+playerSqWidth/2-(75/2),y+4, 75, 75);
          };
          img.src = '/bots/'+player.name+".png";
          
          drawingContext.fillStyle = player.color;
        	drawingContext.fillRect(x+2, y+playerSqHeight-17, playerSqWidth-4, 15);
          drawingContext.fillStyle = "white";
          drawingContext.font = "12px 'Commodore 64 Pixelized'";
          drawingContext.textAlign = 'center';
          drawingContext.fillText(player.name, x+playerSqWidth/2, y+playerSqHeight-5);
          
        }, 
        setPlayerBot = function(imei, bot_url){
          if( (id = playerImeiToId[imei]) >= 0){ 
            players[id].bot_url = bot_url;
            game.setPlayerBot(id, bot_url);
          }
        }       
        addPlayer = function(name, imei) {
            player = {};
                        
                        
            if( (id = playerImeiToId[imei]) >= 0){ 
              console.log(players[id].name);
              game.activatePlayer(id);
              players[id].isActive = true;
              players[id].isPlaying = true;
              players[id].color = game.playerManager.getNewPlayerColor(id);
              updatePlayerList();
              return players[id];
            }
            
            player.ID = game.addPlayer(name);
            player.imei = imei;
            playerImeiToId[player.imei] = player.ID;
            
            player.name = name;
            player.color = game.playerManager.getPlayerColor(player.ID);
            player.controlID = 0;
            player.points = 0;
            player.isPlaying = true;
            
            
            if(!gameStarted){
              activateControls(player.ID, player.controlID);
              player.isActive = true;
            } else {
              player.isPlaying = false;
              pendingPlayers.push(player);
            }
            
            players.push(player);
            updatePlayerList();            
            if(gameStarted) game.drawPlayers();
            
            
            return player;

        },
        removePlayer = function(playerID) {
          console.log('remove player');
          
            game.removePlayer(playerID);
            var index = -1;

            for (i = 0; i < players.length; i++) {
                if (players[i].ID == playerID) {
                    index = i;
                    break;
                }
            }

            currentDirections[playerID] = 0;
            players[index].isPlaying = false;
            players[index].isActive = false;
            

            //writePlayerControls();
            updatePlayerList();
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
          /*
          console.log('activateControls: '+playerID+" - "+controlID);
          
            keysInUse[listOfControls[controlID].leftKeyCode] = {
                playerID: playerID,
                direction: -1
            };

            keysInUse[listOfControls[controlID].rightKeyCode] = {
                playerID: playerID,
                direction: 1
            };

            listOfControls[controlID].inUse = true;*/
        },
        updatePlayerList = function() {
          if(gameStarted) return;
          drawPlayers();
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
           /* numberOfUnusedControls = 0;

            for (i = 0; i < listOfControls.length; i++) {
                if (!listOfControls[i].inUse) {
                    numberOfUnusedControls++;
                }
            }

            return numberOfUnusedControls;*/
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
          //window.onkeydown = handleKeyDown;
          //window.onkeyup = handleKeyUp;  

//          domAddPlayerButton.onclick = handleAddPlayerClick;
//          domStartGameButton.onclick = handleStartGameClick;
//          domStartGameButton.disable = true;
          
          game.setRoundCallback(handleRoundEnd);
          game.setCollisionCallback(handlePlayerDeath);
          
          //init 
          drawLobbyScreen();
          game.startSession();

          socket = io.connect();           
           
          socket.on('ready', function (data) {
          console.log("SERVER IS READY, ", data);
            // possible messages:
            //   player_added
            //   game_started
            //   player_dead
            //   game_finished
          socket.emit('game_started', { hello: 'viva amigos!' });
          });
        
          socket.on('join', function (player) {
            if(players.length==6) {
              //cheio!
              console.log("Server Cheio: ");
              socket.emit('color', { imei: -1, color: "", started: true });

            } else {
              console.log("PLAYER HAS JOINED: ", player.name);
              p = addPlayer(player.name, player.imei);            
              socket.emit('color', { imei: player.imei, color: p.color, started: gameStarted });
              console.log("SENT COLOR: "+p.color);
            }
          });
        
          socket.on('pos', function (data) {
            imei = data.imei;
            imei = imei.replace("pos","");
            
            if(playerImeiToId[imei] >= 0)
              setCurrentDirection(playerImeiToId[imei], data.pos);       
            else
              console.log("MEGA BODE!!!!!!!!!!!! " + imei);
          });
          
          socket.on('bot', function (data) {
            //setPlayerBot(data.imei, "http://codebits.eu"+data.bot_url);
          });
          
        
          socket.on('close', function (data) {
            console.log('Disconnected player '+data.imei);
            removePlayer(playerImeiToId[data.imei]);                        
          });
          
          socket.on('startgame', function (data) {
            if(!gameStarted)
              handleStartGameClick();
          });
          
          
        
        }
        
        init();
             
})(Game);

});