var express = require('express');
var packageInfo = require('./package.json');
const tokenJson = require('./token.json');
const botToken = tokenJson.token;

var app = express();

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/' + botToken, function (req, res) {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

var server = app.listen(process.env.PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Web server started at http://%s:%s', host, port);
});