var ImageReplyBot = require('./bot/bot');
var request = require("request");

var slackToken = process.env.SLACKTOKEN;

if (!slackToken) {
  throw new Error("SLACKTOKEN environment variable must be set.")
}

var botsConfig = process.env.BOTSCONFIG;

if (!botsConfig) {
  throw new Error("BOTSCONFIG environment variable must be set with a URL to a json file.")
}

console.log("Loading bots config from " + botsConfig);

request({ url: botsConfig, json: true},
  (error, response, body) => {
    if (!error && response.statusCode === 200) {
        if (body) {
          body.forEach(botParams => {
            var bot = new ImageReplyBot(botParams, process.env.SLACKTOKEN);
          })
        }
    }
    if (error) {
      console.error(error);
    }
});
