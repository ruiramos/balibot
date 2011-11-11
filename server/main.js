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

var server = net.createServer(function(socket) {
  socket.on('data', function(data) {
    console.log("RCV: "+data);
    data = ""+data;
    var message = data.split(':');
    var type = message[0];
    console.log("TYPE: _"+type+"_");
    if (type == "id") {
      console.log("IMEI:"+message[1]);
      console.log("Nickname:"+message[2]);
    } else if (type == "position") {
      console.log("Position change: "+message[1]);
    } else {
      console.log("AI QUE BODE! ESTE GAJO TA A TENTAR CHEATS");
    }
  });
});

server.on('connection', function(socket) {
  console.log("CONNECTION!");
});

server.listen(9090);