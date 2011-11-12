/**************
* Browser code
***************/
var playerManager = require('./playermanager.js');
var codebots = require('./codebots.js');

var express = require('express')
  , io = require('socket.io').listen(app)
  , mongodb = require('mongodb')
  , mdns = require('node-bj')
  , app = express.createServer();

var ad = mdns.createAdvertisement('balibot', 9090);
ad.start();

var browserSocket;

var server = new mongodb.Server("127.0.0.1", 27017, {});
var playersCollection;

new mongodb.Db('balibot', server, {}).open(function (error, client) {
  if (error) throw error;
  
  playersCollection = new mongodb.Collection(client, 'players');
});

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

app.listen(9091);
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  browserSocket = socket;
  
  console.log("new browser client: ", socket.id);
  socket.emit('READY', { hello: 'server is ready and accepting clients' });
  // possible messages:
    //   player_added
    //   game_started
    //   player_dead
    //   game_finished
  socket.on('game_started', function (data) {
    console.log("NEW GAME HAS STARTED", data);
  });
  socket.on('player_dead', function (data) {
    console.log("A PLAYER HAS DIED", data);
  });
  socket.on('game_finished', function (data) {
    console.log("THIS GAME HAS JUST FINISHED", data);
  });
});

/*******************
* Client code
*******************/
var net = require('net');
var util = require('util');

// Message types
var TYPE_ID = "id";
var TYPE_POS = "pos";
var TYPE_COLOR = "color";

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

      codebots.usernameToBot(name, function(bot_url) {
        console.log(bot_url);
      });

      var playerOnTheDB;

      console.log("!!!!! NEW USER COMING IN !!!!!");

      browserSocket.emit('join', {name: name});

      playersCollection.find({IMEI: imei}, {limit:1}).toArray(function(err, docs) {

        if (docs.length > 0) {
          playerOnTheDB = docs[0];
          console.log("found player: " + playerOnTheDB);
          console.log("WE HAVE USER IN MONGO");
        } else {
          console.log("WE HAVE NO USER IN MONGO");
          
          playersCollection.insert({IMEI: imei, name: name, score: 0}, {safe:true}, function(err, objects) {
            if (err) console.warn(err.message);
            if (err && err.message.indexOf('E11000 ') !== -1) {
              console.log("duplicated id");
            }
          });
  
          playersCollection.find({IMEI: imei}, {limit:1}).toArray(function(err, results) {
            if(err){
              console.log("BODE GRANDE: " + err);
            }
  
            console.log("found in mongo after inserting: " + results);
  
            if(results.length > 0){
              playerOnTheDB = results[0];
            }
          });
  
          console.log("no user, just inserted it: " + playerOnTheDB);
        }
      });
    } else if (type == TYPE_POS) {
      console.log("Position change: "+msg[1]);
      console.log("Vou enviar mensagem ao cabrao!");
      socket.write("color:#ff6677\n");
    } else {
      console.log("Unknown message type from client! (cheater?)");
    }
  });
});

server.on('connection', function(socket) {
  console.log("NEW CONNECTION!");
});

server.listen(9090);