var express = require('express'),
    pg      = require('pg'),
    bodyParser = require('body-parser'),
    app = express();

app.use(bodyParser.json());

app.get('/', function(req, res){

  var conString = "postgres://slack:slackPoints@localhost/slack";

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT * FROM users', function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      console.log(result.rows);
      var data = result.rows;

      client.end();
      res.json(data);
    });
  });

});

app.post('/', function(req, res){
  console.log(req.body);
  res.json({'success':true});
});

var port = process.env.PORT || 6001;
var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});