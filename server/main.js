var playerManager = require('./playermanager.js');

var app = require('express').createServer()
  , io = require('socket.io').listen(app);

app.listen(9091);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  console.log("Recebi connection! ->", socket.id);
  socket.broadcast.emit("UTILIZADOR "+socket.id+" LIGOU-SE!");
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log("LOLAO", data);
  });
});

//------------------------------------------------

var net = require('net');
var util = require('util');

// Message types
var TYPE_ID = "id";
var TYPE_POS = "pos";

var server = net.createServer(function(socket) {
  socket.on('data', function(data) {
    var msg = data.toString('utf8', 0, data.length).split(":");
    var type = msg[0];
    
    if (type == TYPE_ID) {
      var imei = msg[1];
      var name = msg[2];
      console.log("IMEI:"+msg[1]);
      console.log("Nickname:"+msg[2]);
      playerManager.addPlayer(socket, imei, name);
      console.log(playerManager.getPlayers());
    } else if (type == TYPE_POS) {
      console.log("Position change: "+msg[1]);
    } else {
      console.log("Unknown message type from client! (cheater?)");
    }
  });
});

server.on('connection', function(socket) {
  console.log("NEW CONNECTION!");
});

server.listen(9090);