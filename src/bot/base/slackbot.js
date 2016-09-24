"use strict"

var request = require("request");
var WebSocket = require("ws");

class SlackBot {

  constructor(token, name) {
    this.token = token;
    this.name = name;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.postToApi("rtm.start")
        .then((response) => {
          this.self = response.self;
          this.users = response.users;
          this.channels = response.channels;
          this.socket = new WebSocket(response.url);
          resolve();
        }, (error) => {
          reject(error);
        });
      });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.readyState
        || this.socket.readyState === WebSocket.CONNECTING) {
        reject("Websocket is attempting to connect, cannot close connection.");
        return;
      }

      if (this.socket.readyState === WebSocket.CLOSING
        || this.socket.readyState === WebSocket.CLOSED) {
        resolve();
        return;
      }

      this.socket.close();
      if (this.socket.readyState === WebSocket.CLOSING
        || this.socket.readyState === WebSocket.CLOSED) {
        resolve();
      } else {
        reject("Websocket failed to close successfully.")
      }
    });
  }

  postToChannel(channelName, params) {
    var channel = this.channels.find((channel) => {
      return channel.name === channelName;
    });

    if (!channel) {
      log.error("Channel " + channelName + " doesn't exist");
      return;
    }

    params.channel = channel.id;

    return this.postToApi("chat.postMessage", params);
  }

  ping(id) {
    try {
      this.socket.send(JSON.stringify({
        "id": id,
        "type": "ping"
      }));
    } catch (error) {
      return error;
    }
    return null;
  }

  postToApi(method, params) {
    params = params || {};
    params.token = this.token;

    Object.keys(params).forEach((name) => {
      params[name] = (typeof(params[name]) === "object")
        ? JSON.stringify(params[name])
        : params[name];
    });

    return new Promise((resolve, reject) => {
      request.post({
        url: "https://slack.com/api/" + method,
        form: params
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          body = JSON.parse(body);
          if (body.ok) {
            resolve(body);
          } else {
            reject(body.error || "Unknown error occurred.");
          }
        }
      });
    });
  }
}

module.exports = SlackBot;
