var HTTP_PORT = 9091;
var CLIENT_PORT = 9090;

/******************************************
* Browser side code
*******************************************/
var playerManager = require('./playermanager.js');
var codebots = require('./codebots.js');

var express = require('express')
  , mdns = require('node-bj')
  , app = express.createServer().listen(HTTP_PORT)
  , io = require('socket.io').listen(app);

var ad = mdns.createAdvertisement('balibot', CLIENT_PORT).start();

// Socket for special browser client
var browser = {
  socket: null,
  
  send: function(type, object) {
    if (this.socket != null) {
      this.socket.emit(type, object);
    } else {
      console.log("Could not send to browser because browser socket is closed.");
    }
  }
};

// Public directory for browser
app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

// Serve index.html
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
  browser.socket = socket;
  
  /*
  * Browser requests game state
  */
  socket.on('state', function() {
    var players = playerManager.getAllPlayers();
    for (var i=0; i<players.length; i++) {
      var p = players[i];
      browser.send('join', {name: p.name, imei: p.imei});
    }
  });
  
  /*
  * Game engine sets player color
  */
  socket.on('color', function(data) {
    var player = playerManager.findByImei(data.imei);
    // If player found, send the color in hex
    if (player != null) {
      player.send("color:"+data.color);
    }
  });
  
  /*
  * Send die message to player
  */  
  socket.on('die', function(data) {
    var player = playerManager.findByImei(data.imei);
    // If player found send 'die' message
    if (player != null) {
      player.send("die"); 
    }
  });
});

/******************************************
* Android side code
*******************************************/
var net = require('net');

// Message types
var TYPE_ID = "id";
var TYPE_GO = "go";
var TYPE_POS = "pos";
var TYPE_COLOR = "color";

var server = net.createServer(function(socket) {
  //--------------------------
  // Received messages
  //--------------------------
  socket.on('data', function(data) {
    var msg = data.toString('utf8', 0, data.length).split(":");
    var type = msg[0];
    
    /**
    * 'id' message from client
    */
    if (type == TYPE_ID) {
      var imei = msg[1];
      var name = msg[2];
      
      // Add to playerlist
      if (playerManager.addPlayer(socket, imei, name) == true) {
        browser.send('join', {name: name, imei: imei});
        
        // Return bot image to browser
        /*codebots.downloadBotForUser(name, function(botURL) {
          browser.send('bot', {imei: imei, bot_url:botURL});
        });*/
      } else {
        // TODO: could not add player to player list
        console.log("Could not add player to players list! Closing socket.");
        socket.destroy();
      }
    }
    
    /**
    * 'pos' message from client
    */
    else if (type == TYPE_POS) {
      var player = playerManager.findByImei(msg[2]);
      if (player != null) {
        browser.send('pos', {imei: player.imei, pos: msg[1]});
      }
    }
    
    /**
    * 'go' message from client
    */
    else if (type == TYPE_GO) {
      console.log("Starting a new game");
      browser.send('startgame');
    }
    
    /**
    * unknown command
    */
    else {
      console.log("Unknown message type from client! (cheater?)");
    }
  });
  
  //--------------------------
  // Player disconnects (socket close)
  //--------------------------
  socket.on('close', function() {
    console.log("Disconnected socket!");
    player = playerManager.findClosed();
    
    if (player != null) {
      console.warn("Deleted player "+player.name+" from list");
      playerManager.removePlayer(player.imei)
      browser.send('close', {imei: player.imei});
    }
    else {
      console.warn("Could not disconnect, can't find socket!!");
    }
  });
});

server.on('connection', function(socket) {
  console.log("New Connection from player!");
});

server.maxConnections = playerManager.MAX_PLAYERS;
server.listen(CLIENT_PORT);