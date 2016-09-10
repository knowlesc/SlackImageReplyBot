'use strict';

var Bot = require('slackbots');
var logger = require("../common/logger");

class ImageReplyBot {

  constructor(params, token, id) {
    if (!token) {
      throw new Error("No slack token provided to bot.");
    }

    if (!id) {
      throw new Error("No id provided to bot.");
    }

    this.id = id;

    this.validateParams(params);
    this.validateTriggers(params.triggers);

    this.config = params;
    this.log = new logger(params.name);

    this.settings = {
      token: token,
      name: params.name,
    };

    this.triggers = params.triggers;
    this.imageUrl = params.imageUrl;
    this.channel = params.channel;
    this.user = null;
    this.running = false;
    this.messagesRespondedTo = 0;
  }

  validateParams(params) {
    if (!params.triggers) {
      throw new Error("No triggers provided to bot.");
    }

    if (!params.name) {
      throw new Error("No name provided to bot.");
    }

    if (!params.imageUrl) {
      throw new Error("No image provided to bot.");
    }
  }

  validateTriggers(triggers) {
    triggers.forEach(trigger => {
      if (!trigger.trigger) {
        throw new Error("No trigger words provided to trigger.");
      }

      if (!trigger.channel) {
        throw new Error("No slack channel provided to trigger.");
      }

      if (!trigger.message) {
        throw new Error("No message provided to trigger.");
      }

      if (!trigger.imageUrl) {
        throw new Error("No image url provided to trigger.");
      }
    });
  }

  startBot() {
    this.slackbot = new Bot(this.settings);

    this.slackbot.on('start', () => {
      this.log.info('Bot has connected to Slack API.')
      this.running = true;

      this.user = this.slackbot.users.find(
        (user) => user.name === this.slackbot.self.name);
    });

    this.slackbot.on('message', (message) => {
      if (this.isMessage(message)
        && !this.isOwnMessage(message)) {
        this.triggers.forEach(trigger => {
          if (this.triggerMatch(message, trigger)) {
            this.log.info('Received trigger, sending response. Trigger: ' + trigger);
            this.messagesRespondedTo++;
            this.sendTriggerMessage(trigger);
          }
        });
      }
    });

    this.slackbot.on('close', (data) => {
      this.log.info('Websocket has closed' + data ? ": " + data : ".");
      this.slackbot = null;
      this.running = false;
    })

    this.slackbot.on('error', (error) => {
      this.log.error(error);
      this.slackbot = null;
      this.running = false;
    });
  }

  triggerMatch(message, trigger) {
    var messageChannel = this.slackbot.channels.find(
      channel => channel.id === message.channel);

    return messageChannel
      && messageChannel.name === trigger.channel
      && message.text.toLowerCase().indexOf(trigger.trigger.toLowerCase()) > -1;
  }

  sendTriggerMessage(trigger) {
    var params = {
      icon_url: this.imageUrl,
      attachments: [
        {
          "text": trigger.message,
          "fallback": trigger.message,
          "image_url": trigger.imageUrl,
        }
      ]
    }
    this.slackbot.postMessageToChannel(trigger.channel, '', params);
  }

  isMessage(message) {
    return message.type === 'message'
      && Boolean(message.text);
  }

  isOwnMessage(message) {
    return message.user === this.user.id
  }
}

module.exports = ImageReplyBot;