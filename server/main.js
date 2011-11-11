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

var server = net.createServer(function(socket) {});

server.on('connection', function(socket) {
  console.log("CONNECTION DE ", socket);
});

server.listen(9090);