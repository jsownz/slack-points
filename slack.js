var express = require('express'),
    pg      = require('pg'),
    bodyParser = require('body-parser'),
    http = require('http'),
    Slack = require('node-slack'),
    app = express();

var slack = new Slack('dopamine','REQtnGjBsWotN3hTxCDtbzmV');
var conString = "postgres://slack:slackPoints@localhost/slack";

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res){

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT * FROM users ORDER BY points DESC', function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      var data = result.rows;

      client.end();
      res.json(data);
    });
  });

});

app.post('/', function(req, res){
  var command = req.body.text;
  var name = command.split(" ")[0].toLowerCase();
  var points = Math.floor(command.split(" ")[1]);

  var queryString = 'SELECT points FROM users WHERE LOWER(name)=LOWER(\''+name+'\')';

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query(queryString, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      
      var currentPoints = result.rows[0].points;

      if (typeof points === 'undefined') {

        res.json({"success": false});

      } else {

        var newPoints = currentPoints + points;

        client.query('UPDATE users SET points = $1 where LOWER(name) = LOWER($2)',[newPoints,name], function(err, result) {
          if(err) {
            return console.error('error running query', err);
          }

          client.end();

          slack.send({
            text: 'Success! '+points+' points added to '+name+'\nThat\'s '+newPoints+' total!',
            channel: '#finlit',
            username: 'The Arbiter of Justice'
          });

          res.json({"success":true});

        });
      }

    });
  });
});

app.post('/services/hooks/incoming-webhook', function(req, res){
  console.log(req.body);
});

var port = process.env.PORT || 6001;
var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});