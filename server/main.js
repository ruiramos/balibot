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
    var message = message = data.toString('utf8', 0, data.length).split(":");
    var type = message[0];
    
    if (type == TYPE_ID) {
      console.log("IMEI:"+message[1]);
      console.log("Nickname:"+message[2]);
    } else if (type == TYPE_POS) {
      console.log("Position change: "+message[1]);
    } else {
      console.log("Unknown message type from client! (cheater?)");
    }
  });
});

server.on('connection', function(socket) {
  console.log("CONNECTION!");
});

server.listen(9090);