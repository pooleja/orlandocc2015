var bitcore = require('bitcore');

var network = bitcore.Networks.testnet;


$('#secret-button').click(function (e) {

  e.preventDefault();

  var mySecret = $("#secret").val();
  var buff = bitcore.deps.Buffer(mySecret);
  var sha = bitcore.crypto.Hash.sha256(buff);

  var privateKey = new bitcore.PrivateKey(sha, network);
  var address = privateKey.toAddress(network);

  $("#generated-private-key").text(privateKey.toString());
  $("#generated-public-key").text(privateKey.publicKey.toString());
  $("#generated-address").text(address.toString());

  var qr = "bitcoin:" + address.toString() + "?amount=0.0002";
  $("#generated-qr-code").empty();
  $("#generated-qr-code").qrcode({width: 200, height: 200, text: qr });

  updateBalance();
  window.setInterval(updateBalance, 5000);

});


// Grabs the address in the browser and retrieves the balance (confirmed + unconfirmed)
function updateBalance() {

    var address = $("#generated-address").text();

    $.ajax({
      url: "/api/balance/" + address
    })
      .done(function( res ) {

        console.log("Total balance for address is: " + res.balance + " BTC");
        $("#balance").text(res.balance + " BTC");
      });
}


$('#send-button').click(function (e) {

    e.preventDefault();

    // Get info from the page
    var fromAddress = $("#generated-address").text();
    var toAddress = $("#sendAddress").val();

    var amount = $("#amountToSend").val();
    var amountSatoshis = parseFloat(amount) * 100000000;

    // Recreate the private key object
    var mySecret = $("#secret").val();
    var buff = bitcore.deps.Buffer(mySecret);
    var sha = bitcore.crypto.Hash.sha256(buff);

    var privateKey = new bitcore.PrivateKey(sha, network);

    $.ajax({
      url: "/api/uxto/" + fromAddress
    })
    .done(function( utxos ) {

      var transaction = new bitcore.Transaction()
        .from(utxos)            // Feed information about what unspent outputs one can use
        .to(toAddress, amountSatoshis)  // Add an output with the given amount of satoshis
        .change(fromAddress)      // Sets up a change address where the rest of the funds will go
        .sign(privateKey);     // Signs all the inputs it can

        $("#serialized-transaction").text(transaction.serialize());

        $.ajax({
          url: "/api/send/" + transaction.serialize()
        })
        .done(function( res ) {
          $("#send-result").text(res);
        });

    });


});
