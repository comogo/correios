// Constructor
function Correios() {
  this.WEBSRO = 'http://websro.correios.com.br/sro_bin/txect01$.QueryList?P_LINGUA=001&P_TIPO=001&P_COD_UNI=';

  this.STATUS = {
    posted: 'Postado',
    submitted: 'Encaminhado',
    delivering: 'Saiu para entrega ao destinatário',
    absent: 'Destinatário ausente',
    awaiting_removal: 'Aguardando retirada',
    delivered: 'Entrega Efetuada',
    checked: 'Conferido'
  };
}

/* This method make a query to correios to get track of your delivery.
 *
 * Params:
 *    - code: is the track code;
 *    - callback: the callback method;
 *
 * Callback:
 *    The callback function take the track in JSON format.
 *
 * Tracking data:
 *    - date: when the event happens;
 *    - location: the current location of the packet;
 *    - status: the current status;
 *    - details: some extra details of the delivery;
 */
Correios.prototype.track = function (code, callback) {
  var url = this.WEBSRO + code;
  var http = require('http');
  var iconv = new require('iconv').Iconv('latin1', 'utf-8');
  var self = this;

  http.get(url, function (res) {
    var page = "";

    res.on('data', function onData(chunk) {
      page += iconv.convert(chunk).toString();
    });

    res.on('end', function onEnd(data, encoding) {
      var cheerio = require('cheerio');
      var $ = cheerio.load(page);
      var rows = $('table tr');
      var result = [];

      for (var i=0; i < rows.length; i++) {
        var $row = $(rows[i]);
        var columns = $row.find('td');
        var $first_column = $(columns[0]);
        var rowspan = $first_column.attr('rowspan');
        var item_status = "";

        if ($first_column.text() == 'Data') continue;

        // Set status
        for (var key in self.STATUS) {
          if (self.STATUS[key] == $(columns[2]).text()){
            item_status = key;
          }
        }

        if (rowspan == 1) {
          result.push({
            date: $first_column.text(),
            location: $(columns[1]).text(),
            status: item_status
          });
        } else {
          if (rowspan == 2) {
            i += 1;

            var details = $(rows[i]).find('td')[0];

            result.push({
              date: $first_column.text(),
              details: $(details).text(),
              location: $(columns[1]).text(),
              status: item_status
            });
          }
        }
      }

      callback(result);
    });
  });
}

module.exports = Correios;
