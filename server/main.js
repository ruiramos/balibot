var playerManager = require('./playermanager.js');

var app = require('express').createServer()
  , io = require('socket.io').listen(app)
  , mongodb = require('mongodb')
  , mdns = require('node-bj');

var ad = mdns.createAdvertisement('balibot', 9090);
ad.start();

var playersCollection;

var dbClient = new mongodb.Db('balibot', new mongodb.Server("127.0.0.1", 27017, {}), {}).open(function (error, client) {
  if (error) throw error;
  playersCollection = new mongodb.Collection(client, 'players');
});

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
      console.log("IMEI:"+imei);
      console.log("Nickname:"+name);
      playerManager.addPlayer(socket, imei, name);

      playersCollection.find({IMEI: imei}).toArray(function(err, results) {
        console.log(err);
        console.log(results);
        // FIXME - ficar com user
      });

      //se nao existir na db - FIXME
      playersCollection.insert({IMEI: imei, nick: name, score: 0}, {safe:true}, function(err, objects) {
        if (err) console.warn(err.message);
        if (err && err.message.indexOf('E11000 ') !== -1) {
          console.log("duplicated id");
        }
      });

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