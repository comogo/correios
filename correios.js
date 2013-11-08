#!/usr/bin/env node

var WEBSRO = 'http://websro.correios.com.br/sro_bin/txect01$.QueryList?P_LINGUA=001&P_TIPO=001&P_COD_UNI=';

var cheerio = require('cheerio');
var http = require('http');
var args = process.argv.splice(2);

if (args.length != 1) {
  process.exit();
}

var url = WEBSRO + args[0];

function buildData(data) {
  var $ = cheerio.load(data);
  var result = [];
  var rows = $('table tr');

  for (var i=0; i < rows.length; i++) {
    var $row = $(rows[i]);
    var columns = $row.find('td');
    var $first_column = $(columns[0]);
    var rowspan = $first_column.attr('rowspan');

    if ($first_column.text() == 'Data')
      continue;

    if (rowspan == 1) {
      result.push({
        date: $first_column.text(),
        location: $(columns[1]).text(),
        status: $(columns[2]).text()
      });
    } else {
      if (rowspan == 2) {
        i += 1;

        var details = $(rows[i]).find('td')[0];

        result.push({
          date: $first_column.text(),
          details: $(details).text(),
          location: $(columns[1]).text(),
          status: $(columns[2]).text()
        });
      }
    }
  }

  return result;
}

function printData(data) {
  console.log('==================================================');

  data.forEach(function (item) {
    console.log("Date:     %s", item.date);
    console.log("Location: %s", item.location);
    console.log("Status:   %s", item.status);

    if (item.details) {
      console.log("Details:  %s", item.details);
    }

    console.log('--------------------------------------------------');
  });
}

function processResponse(data) {
  var data_json = buildData(data);

  printData(data_json);
}


http.get(url, function (res) {
  var page = "";

  res.setEncoding('utf8');

  res.on('data', function onData(chunk) {
    page += chunk.toString();
  });

  res.on('end', function onEnd(data, encoding) {
    processResponse(page);
  });
});
