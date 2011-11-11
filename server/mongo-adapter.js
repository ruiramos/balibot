var mongodb = require('mongodb');

var dbClient = new mongodb.Db('balibot', new mongodb.Server("127.0.0.1", 27017, {}), {}).open(function (error, client) {
  if (error) throw error;
  var collection = new mongodb.Collection(client, 'players');
  collection.insert({hello: 'world'}, {safe:true}, function(err, objects) {
    if (err) console.warn(err.message);
    if (err && err.message.indexOf('E11000 ') !== -1) {
      console.log("duplicated id");
    }
  });
});

var client = new Db('test', new Server("127.0.0.1", 27017, {})),
    test = function (err, collection) {
      collection.insert({a:2}, function(err, docs) {

        collection.count(function(err, count) {
          test.assertEquals(1, count);
        });

        // Locate all the entries using find
        collection.find().toArray(function(err, results) {
          test.assertEquals(1, results.length);
          test.assertTrue(results.a === 2);

          // Let's close the db
          client.close();
        });
      });
    };

client.open(function(err, p_client) {
  client.collection('test_insert', test);
});

  playersCollection.insert({imei: '2376434324324423432', nick: 'homemzao', score: 25}, {safe:true}, function(err, objects) {
    if (err) console.warn(err.message);
    if (err && err.message.indexOf('E11000 ') !== -1) {
      console.log("duplicated id");
    }
  });

  playersCollection.find({imei: '2376434324324423432'}).toArray(function(err, results) {
          console.log(results);
        });