var https = require('https')
  , fs = require ('fs');

var BOT_URL_PATTERN = new RegExp(/\/bots\/([\w\d]*?)\?/);

exports.downloadBotForUser = function (username, callback) {
  fs.stat(__dirname + '/public/bots/'+username+".png", function (err, stats) {
    if (!err && stats.isFile()){
      callback('/bots/'+username+".png");
    }else{
      https.get({host:'codebits.eu', port:443, path:'/'+username, agent:false}, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (response) {
          var matches = response.match(BOT_URL_PATTERN);
          
          if (matches) {
            var bot_filename = matches[1];
        
            var request = https.request({host: 'codebits.eu', port: 443, path: "/bots/"+bot_filename, method: 'GET'});
            request.on('response', function (response) {
              var file = fs.createWriteStream(__dirname + '/public/bots/'+username+".png");
              response.on('data', function(chunk){
                file.write(chunk);
              }).on('end', function(){
                file.end();
                callback('/bots/'+username+".png");
              });
            });
            request.end()
          }
        });
      });
    }
  });
};
