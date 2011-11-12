var https = require('https');

var BOT_URL_PATTERN = new RegExp(/\/bots\/([\w\d]*?)\?/);

exports.usernameToBot = function (username, callback) {
  https.get({host:'codebits.eu', port:443, path:'/'+username, agent:false}, function (res) {
    res.setEncoding('utf8');

    res.on('data', function (response) {
      var matches = response.match(BOT_URL_PATTERN);
      
      if (matches) {
        callback("/bots/"+matches[1]);
      }
    });
  });
};
