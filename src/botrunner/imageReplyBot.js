'use strict';

var SlackBot = require('./slackbot');
var logger = require("../common/logger");

class ImageReplyBot {

  constructor(params, token, id) {
    if (!token) {
      throw new Error("No slack token provided to bot.");
    }

    if (!id) {
      throw new Error("No id provided to bot.");
    }

    this.validateParams(params);
    this.validateTriggers(params.triggers);

    this.id = id;
    this.config = params;
    this.log = new logger(params.name);
    this.token = token,
    this.user = null;
    this.running = false;
    this.messagesRespondedTo = 0;
    this.pinged = 0;
    this.pingDelaySeconds = 1; 
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
    this.slackbot = new SlackBot(this.token, this.config.name);

    return new Promise((resolve, reject) => {
      this.slackbot.connect()
        .then(() => {
          this.user = this.slackbot.users.find((user) =>
            user.name === this.slackbot.self.name);

          this.slackbot.socket.on('open', (message) => {
            this.log.info('Bot has connected to Slack API.')
            this.running = true;
            this.ping();
          });

          this.slackbot.socket.on('message', (message) => {
            this.handleMessage(JSON.parse(message));
          });

          this.slackbot.socket.on('close', (data) => {
            this.log.info('Websocket has closed' + (data ? ": " + data : "."));
            if (!this.running) {
              this.botHasStopped(false);
            }
          });
          
          resolve();
        }, (error) => {
          this.log.error(error);
          reject(error);
        });
    });
  }

  stopBot() {
    return new Promise((resolve, reject) => {
      if (!this.running) {
        resolve();
        return;
      }

      this.slackbot.disconnect()
        .then(() => {
          this.botHasStopped(true);
          resolve();
        }, (error) => {
          log.error(error);
          reject(error);
        });
    });
  }

  botHasStopped(expected) {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (expected) {
      this.log.info("Bot has stopped running.");
    } else {
      this.log.error("Bot has stopped running unexpectedly.");
    }
  }

  ping() {
    if (!this.running) {
      return;
    }

    var error = this.slackbot.ping(this.id);
    if (error) {
      this.log.error("Pinging websocket failed. " + error);
      this.botHasStopped(false);
      return;
    }

    this.pinged++;

    setTimeout(() => {
      if (!this.running) {
        return;
      }

      if (this.pinged > 0) {
        this.log.error("Websocket failed to respond " + this.pinged + " time(s).");
      } 

      if (this.pinged > 3) {
        this.log.error("Websocket has stopped responding.");
        this.botHasStopped(false);
      } else {
        this.ping();
      }
    }, this.pingDelaySeconds * 1000);
  }

  handleMessage(message) {
    if (this.isPong(message) && message.reply_to === this.id) {
      this.pinged = 0;
    }

    if (this.isMessage(message)
      && !this.isOwnMessage(message)) {
      this.config.triggers.forEach(trigger => {
        if (this.triggerMatch(message, trigger)) {
          this.log.info('Received trigger, sending response. Trigger: ' + JSON.stringify(trigger));
          this.messagesRespondedTo++;
          this.sendTriggerMessage(trigger);
        }
      });
    }
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
      icon_url: this.config.imageUrl,
      attachments: [
        {
          "text": trigger.message,
          "fallback": trigger.message,
          "image_url": trigger.imageUrl,
        }
      ]
    }
    this.slackbot.postToChannel(trigger.channel, params);
  }

  isPong(message) {
    return message.type === 'pong';
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