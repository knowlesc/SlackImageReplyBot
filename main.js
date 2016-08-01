var ImageReplyBot = require('./src/server/bot');
var ConfigReader = require('./src/server/configReader')
var express = require("express");

process.on("unhandledRejection", (error) => {
  throw new Error(error);
});

var slackToken = process.env.SLACKTOKEN;

if (!slackToken) {
  throw new Error("SLACKTOKEN environment variable must be set.")
}

ConfigReader.readBotsConfig("config.json")
  .then(
    (botParamsArray) => {
      if (!botParamsArray) {
        console.log("No bots config exists, one will be created when a bot is created.")
      } else {
        botParamsArray.forEach(botParams => {
          var bot = new ImageReplyBot(botParams, process.env.SLACKTOKEN);
        });
      }
    },
    (error) => {
      console.error("Error reading bot params");
      throw new Error(error);
    });

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/build'));

app.get('/', function (req, res) {
  res.sendFile("src/client/index.html", { root: __dirname });
});

app.listen(port, () => {
  console.log('Listening on port ' + port);
});