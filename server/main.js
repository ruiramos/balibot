/**************
* Browser code
***************/
var playerManager = require('./playermanager.js');
var codebots = require('./codebots.js');

var express = require('express')
  , mongodb = require('mongodb')
  , mdns = require('node-bj')
  , app = express.createServer()
  , io = require('socket.io').listen(app);

var ad = mdns.createAdvertisement('balibot', 9090);
ad.start();

var browserSocket = 40; // isto não é quarenta

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
  socket.emit('ready', { hello: 'server is ready and accepting clients' });
  // possible messages:
    //   player_added
    //   game_started
    //   player_dead
    //   game_finished
  socket.on('game_started', function (data) {
    console.log("NEW GAME HAS STARTED", data);
  });
  socket.on('color', function (data) {
    var player = playerManager.findByImei(data.imei);
    
    if(player!=null){
      player.send("color:"+data.color);
      player.send("started:"+data.started);
    } else console.log("o player é null!!!!!!!!!!!! --------------- color,54");
    
  });
  
  socket.on('die', function (data) {
    p = playerManager.findByImei(data.playerImei);
    if(p!=null) 
      p.send("die"); 
    else
      console.log("o player é null!!!!!!!!!!!! --------------- die,65, "+data.playerImei);
        
  });

  socket.on('game_finished', function (data) {
    console.log("THIS GAME HAS JUST FINISHED", data);
    for(i=0;i<=data.scores.length;i++){
      var player = data.scores[i];
      playersCollection.find({IMEI: player.imei}, {limit:1}).toArray(function(err, results) {
        if(err){
          console.log("BODE GRANDE: " + err);
        }
      
        if(results.length > 0){
          playerOnTheDB = results[0];
        }

        playersCollection.findAndModify({IMEI: player.imei}, [['_id','asc']], {$set: {high_score: player.score}}, {limit:1},
          function(err, object) {
            if (err) console.warn(err.message);
            else console.dir(object);  // undefined if no matching object exists.
          });
      });
    }
  });
});

/*******************
* Client code
*******************/
var net = require('net');
var util = require('util');

// Message types
var TYPE_ID = "id";
var TYPE_GO = "go";
var TYPE_POS = "pos";
var TYPE_COLOR = "color";

var server = net.createServer(function(socket) {
  
  // on client data    
  socket.on('data', function(data) {
    var msg = data.toString('utf8', 0, data.length).split(":");
    var type = msg[0];
    
    if (type == TYPE_ID) {
      var imei = msg[1];
      var name = msg[2];
      console.log("IMEI:"+imei);
      console.log("Nickname:"+name);
      playerManager.addPlayer(socket, imei, name);

      codebots.downloadBotForUser(name, function(bot_url) {
        socket.write("bot:"+bot_url+"\n");
        browserSocket.emit('bot', {imei: imei, bot_url:bot_url});
      });

      var playerOnTheDB;
      browserSocket.emit('join', {name: name, imei: imei});
      
      playersCollection.find({IMEI: imei}, {limit:1}).toArray(function(err, docs) {

      if (docs.length > 0)
        playerOnTheDB = docs[0];
          
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
      
        if(results.length > 0){
          playerOnTheDB = results[0];
        }
      });
      
      });
    } else if (type == TYPE_POS) {
      console.log("Position change: "+msg[1]);
      browserSocket.emit('pos', {imei: msg[2], pos: msg[1]});
    } else if (type == TYPE_GO) {
      console.log("Starting a new game");
      browserSocket.emit('startgame');
    } else {
      console.log("Unknown message type from client! (cheater?)");
    }
  });
  
  // on disconnect
  socket.on('close', function(data) {
    console.log("Disconnected");   
     
    player = playerManager.findDisconnected();
    if(player!=null)
      browserSocket.emit('close', {imei: player.imei});
    else console.log("could not disconnect, can't find socket");
    
    playerManager.clearDeadPeople();
  });
  
  
  /*
  socket.on('end', function(data) {
    console.log("Disconnected - end");   
     
    player = playerManager.findBySocket(socket);
    if(player!=null)
      browserSocket.emit('close', {imei: player.imei});
    else console.log("could not disconnect, can't find socket")
  });
  
  socket.on('timeout', function(data) {
    console.log("Disconnected - timeout");   
     
    player = playerManager.findBySocket(socket);
    if(player!=null)
      browserSocket.emit('close', {imei: player.imei});
    else console.log("could not disconnect, can't find socket")
  });
  */
  
  
  
});

server.on('connection', function(socket) {
  console.log("New Connection"); 
   
  
});

server.listen(9090);