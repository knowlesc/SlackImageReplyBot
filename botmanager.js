var ConfigReader = require('./src/botmanager/configReader')
var express = require("express");

var logger = require("./src/common/logger");
var log = new logger("botmanager");

var BotRunner = require("./src/botrunner/botrunner");
var botRunner = new BotRunner();

// This handles errors getting swallowed up by promise rejection
// https://gist.github.com/benjamingr/0237932cee84712951a2
process.on("unhandledRejection", (error) => { log.error(error); });

var configFile = "config.json";

ConfigReader.readBotsConfig(configFile)
  .then(
    (botParamsArray) => {
      if (!botParamsArray) {
        log.info("No bots config exists, one will be created when a bot is created.")
      } else {
        botParamsArray.forEach(botParams => {
          botRunner.createBot(botParams);
        });
      }
    },
    (error) => {
      log.error("Error reading bot params");
      throw new Error(error);
    });

var app = express();
var port = process.env.CLIENTPORT || 8080;

app.use(express.static(__dirname + '/build'));
app.use(express.static(__dirname + '/src/client/templates'));
app.use('/fonts/', express.static(__dirname + '/build/fonts'));

app.get('/', (req, res) => {
  res.sendFile("src/client/index.html", { root: __dirname });
});

app.get('/api/bots', (req, res) => {
  res.send(botRunner.getBots());
});

app.post("/api/start/:id", (req, res) => {
  var id = parseInt(req.params.id);
  botRunner.startBot(id)
    .then(() => {
      res.sendStatus(200);
    }, (error) => {
      res.sendStatus(500);
    });
});

app.post("/api/stop/:id", (req, res) => {
  var id = parseInt(req.params.id);
  botRunner.stopBot(id)
    .then(() => {
      res.sendStatus(200);
    }, (error) => {
      res.sendStatus(500);
    });
});

app.listen(port);
