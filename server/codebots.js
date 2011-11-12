var https = require('https');

var BOT_URL_PATTERN = new RegExp(/\/bots\/([\w\d]*?)\?/);

exports.usernameToBot = function (username, callback) {
  https.get({host:'codebits.eu', port:443, path:'/'+username, agent:false}, function (res) {
    res.setEncoding('utf8');
    
    //console.log("response");

    res.on('data', function (response) {

      //console.log("!!! recebi response");

      var matches = response.match(BOT_URL_PATTERN);
      
      //console.log(matches[1]);

      if (matches) {
        callback("/bots/"+matches[1]);
      }
    });
  });
};
