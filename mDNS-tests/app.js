var mdns = require('node-bj');
var ad = mdns.createAdvertisement('balibot', 55555);
ad.start();