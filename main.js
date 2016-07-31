var ImageReplyBot = require('./src/bot');
var ConfigReader = require('./src/configReader')
var express = require("express");

process.on("unhandledRejection", (error) => {
  throw new Error(error);
});

var slackToken = process.env.SLACKTOKEN;

if (!slackToken) {
  throw new Error("SLACKTOKEN environment variable must be set.")
}

var botsConfig = process.env.BOTSCONFIG;
var botsConfigRemote = process.env.BOTSCONFIGREMOTE;

if (!botsConfig && !botsConfigRemote) {
  throw new Error("BOTSCONFIG or BOTSCONFIGREMOTE environment variable must be set with a path or URL to a json file.")
}

console.log("Loading bots config from " + botsConfig);

var readBotParams = botsConfig
   ? ConfigReader.readLocal
   : ConfigReader.readRemote

readBotParams(botsConfig)
  .then((botParamsArray) => {
      botParamsArray.forEach(botParams => {
        var bot = new ImageReplyBot(botParams, process.env.SLACKTOKEN);
      })
    }, (error) => {
      console.error("Error reading bot params");
      throw new Error(error);
    });

var app = express();
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.send('Bots are running!');
});

app.listen(port, () => {
  console.log('App is listening on port ' + port);
});