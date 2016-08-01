'use strict';

var request = require("request");
var fs = require("fs");

class ConfigReader {

  static readBotsConfig(filename) {
    console.log("Loading bots config from " + filename);

    return new Promise((resolve, reject) => {
      fs.readFile(filename, 'utf8', (error, data) => {
        if(error) {
          if (error.code === "ENOENT") {
            resolve();
          }
          reject(error);
        } else {
          var jsonData = JSON.parse(data);
          resolve(jsonData);
        }
      });
    });
  }

  static readRemote(url) {
    return new Promise((resolve, reject) => {
      request({ url: botsConfig, json: true},
        (error, response, body) => {
          if (error) {
            reject(error);
          } else if (response.statusCode !== 200) {
            reject(response.statusCode + " status received from remote URL.");
          } else if (!body) {
            reject("Remote URL returned no data.");
          }
          resolve(body)
      });
    });
  }
}

module.exports = ConfigReader;