'use strict';

var ImageReplyBot = require('./src/botrunner/imageReplyBot');
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
    return new Promise((resolve, reject) => {
      var bot = this.bots.find((bot) => bot.id === id);
      if (bot) {
        bot.startBot()
          .then(() => {
            resolve();
            return;
          }, (error) => {
            reject(error);
            return;
          });
      } else {
        reject("bot with id " + id + " not found.");
      }
    });    
  }

  stopBot(id) {
    return new Promise((resolve, reject) => {
      var bot = this.bots.find((bot) => bot.id === id);
      if (bot) {
        bot.stopBot()
          .then(() => {
            resolve();
            return;
          }, (error) => {
            reject(error);
            return;
          });
      } else {
        reject("bot with id " + id + " not found.");
      }
    });  
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