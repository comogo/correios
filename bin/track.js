#!/usr/bin/env node

var args = process.argv.splice(2);

if (args.length != 1) {
  console.error("You need to specify the track number");
  process.exit();
}

var colors = require('colors');
var Correios = require('../correios.js');
var correio = new Correios();

var statusColors = {
  posted: 'red',
  submitted: 'yellow',
  delivering: 'blue',
  absent: 'red',
  awaiting_removal: 'blue',
  delivered: 'green',
  checked: 'yellow'
};

correio.track(args[0], function (track_data) {
  console.log('==================================================');

  track_data.forEach(function (item) {
    console.log("Date:     %s", item.date);
    console.log("Location: %s", item.location);
    console.log("Status:   %s", correio.STATUS[item.status][statusColors[item.status]]);

    if (item.details) {
      console.log("Details:  %s", item.details);
    }

    console.log('--------------------------------------------------');
  });
});
