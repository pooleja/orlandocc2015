var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/api/balance/:address', function(req, res) {

  var url = "https://test-insight.bitpay.com/api/addr/" + req.params.address + "/utxo";

  request({url:url, json:true}, function (error, response, body) {

    var retBalance = 0;

    // Iterate over utxos and add up value
    for (var i in body) {
      retBalance += body[i].amount;
    }

    res.json({balance : retBalance});
  });

});

router.get('/api/uxto/:address', function(req, res) {

  var url = "https://test-insight.bitpay.com/api/addr/" + req.params.address + "/utxo";

  request({url:url, json:true}, function (error, response, body) {
    console.log(body);
    res.json(body);
  });

});


router.get('/api/send/:transaction', function(req, res) {

  var url = "https://test-insight.bitpay.com/api/tx/send" ;

  request.post({
    url:url,
    body : "rawtx=" + req.params.transaction,
    headers: {'content-type' : 'application/x-www-form-urlencoded'}
    }, function (error, response, body) {

      res.json(body);
    });
});





module.exports = router;
