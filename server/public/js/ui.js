var Ui = function() {
  this.botSize = "100x100";
};

// Just a shortcut
Ui.fn = Ui.prototype;

/**
* Adds player to player list. This method only needs to receive a 
* player object. The player will appear as a div on the player list.
*/
Ui.fn.addPlayer = function(player) {
  var mainDiv = document.createElement('div');
  var bot = document.createElement('img');
  var name = document.createElement('p');
  var score = document.createElement('p');

  $(name).addClass('name');
  $(name).text(player.name);

  $(score).addClass('score');
  $(score).text(player.score);

  $(bot).addClass('bot');
  $(bot).attr('src', '/bots/'+player.name+'.png');
  $(bot).attr('width', this.botSize.split("x")[0]);
  $(bot).attr('height', this.botSize.split("x")[1]);
  
  $(mainDiv).attr('id', 'player-'+player.imei);
  $(mainDiv).css('background', player.color);
  $(mainDiv).addClass('player');
  $(mainDiv).append(bot).append(name).append(score);
  
  $('#players').append($(mainDiv));
};

/**
* Removes a player from the list, removing the div from the
* parent '#players' div.
*/
Ui.fn.removePlayer = function(imei) {
  var playerDiv = $('#player-'+imei);
  $(playerDiv).remove();
};

/**
* Resize game lobby to get all width minus the player list div
*/
Ui.fn.expandContainer = function() {
  var container = $('#container');
  container.height(window.innerHeight-20);
  container.width(window.innerWidth-310);
}

/**
* This method toggles between the lobby and the game canvas.
* It's called on the start and stop of the game.
*/
Ui.fn.toggleLobby = function() {
  var lobbyDiv = $('#lobby');
  var gameDiv = $('#gamecanvas');
  lobbyDiv.toggle();
  gameDiv.toggle();
};

/**
* Updates the player score, based on information of the
* player object and player.score value.
*/
Ui.fn.updateScore = function(player) {
  var div = $('#player-'+player.imei+' .score');
  $(div).text(player.score);
}

/**
* Shows the score table when a round ends for a while.
* This will receive a rank with the player imeis ordered
* for that round.
*/
Ui.fn.showScoreTable = function(scores, playerManager) {
  var scoreDiv = $('#endgamescores');
  var header = document.createElement('h2');
  var scoreList = document.createElement('ol');

  $(header).text('Round Scores')
  $(scoreDiv).empty();

  // Add list items to ol with player positions this round
  for (var i=0; i<scores.rank.length; i++) {
    var player = playerManager.getPlayer(scores.rank[i]);
    if (player.isPlaying) {
      var li = document.createElement('li');
      $(li).text(player.name+" (+"+(scores.rank.length-(i+1))+")");
      $(li).css('color', player.color);
      $(scoreList).append(li);
    }
  }

  $(scoreDiv).append(header).append(scoreList);

  // Position the score table in the center of the screen
  var parentW = Config.canvasWidth,
      parentH = Config.canvasHeight,
      selfW = $(scoreDiv).width(),
      selfH = $(scoreDiv).height();

  $(scoreDiv).css('top', (parentH/2)-(selfH/2));
  $(scoreDiv).css('left', (parentW/2)-(selfW/2));

  $(scoreDiv).show();
};

/**
* Hides the score table at the end of the round.
*/
Ui.fn.hideScoreTable = function() {
  $('#endgamescores').hide();
};