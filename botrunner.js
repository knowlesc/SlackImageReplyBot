'use strict';

var ImageReplyBot = require('./src/botrunner/bot');
var express = require("express");
var http = require('http');
var io = require('socket.io');

var logger = require("./src/common/logger");
var log = new logger("botrunner");

class BotRunner {

  constructor() {
    this.slackToken = process.env.SLACKTOKEN;

    if (!this.slackToken) {
      throw new Error("SLACKTOKEN environment variable must be set.")
    }

    this.bots = [];
  }

  createBot(botParams) {
    log.info("Creating new bot with the following params: " + JSON.stringify(botParams));

    var bot = new ImageReplyBot(botParams, this.slackToken, this.bots.length + 1);
    this.bots.push(bot);
  }

  startBot(id) {
    for (var i = 0; i < this.bots.length; i++) {
      if (this.bots[i].id === id) {
        log.info("Starting both with id: " + id);
        this.bots[i].startBot();
        return;
      }
    }

    throw new Error("bot with id " + id + " not found.");
  }

  getBots() {
    var botConfigs = this.bots.map((bot) => {
      return {
        id: bot.id,
        running: bot.running,
        config: bot.config
      }
    });
    return botConfigs;
  }
}

module.exports = BotRunner;