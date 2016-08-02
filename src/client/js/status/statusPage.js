var statusPage = angular.module("StatusPage", []);

statusPage.service("StatusService", function($http) {
  this.getBots = () => {
    return $http.get("api/bots");
  }

  this.startBot = (id) => {
    return $http.post("api/start/" + id)
  }

  this.stopBot = (id) => {
    return $http.post("api/stop/" + id)
  }
});

statusPage.controller("StatusCtrl", function(StatusService) {

  this.bots = [];

  StatusService.getBots()
    .then(response => {
      if (response.data) {
        this.bots = response.data;
      }
    });

  this.startBot = (bot) => {
    StatusService.startBot(bot.id)
      .then(() => {
        bot.running = true;
      }, (err) => {

      });
  }

  this.stopBot = (bot) => {
    StatusService.stopBot(bot.id)
      .then(() => {
        bot.running = false;
      }, (err) => {

      });
  }
});

statusPage.component("statusPage", {
  controller: "StatusCtrl",
  templateUrl: "status.html"
});
