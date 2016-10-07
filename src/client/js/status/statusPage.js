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

statusPage.controller("StatusCtrl", function(StatusService, $mdDialog) {

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

  this.getUptime = (bot) => {
    if (!bot.running) {
      return null;
    }

    var duration = moment.duration(Date.now() - bot.stats.startedAt);
    return duration.humanize();
  }

  this.getLastPing = (bot) => {
    if (!bot.running) {
      return null;
    }

    var duration = moment.duration(Date.now() - bot.stats.lastPing);
    return duration.humanize();
  }

  this.openStats = (bot) => {
    $mdDialog.show({
      controllerAs:'$ctrl',
      clickOutsideToClose: true,
      bindToController: true,
      locals: {
        stats: bot.stats
      },
      controller: function($mdDialog, stats){
        this.closeDialog = () => {
          $mdDialog.hide();
        }
      },
      template: `
        <md-dialog aria-label="List dialog" layout-padding>
          <md-dialog-content>
            Messages responded to: {{ $ctrl.stats.messagesRespondedTo }}
          </md-dialog-content>
          <md-dialog-actions>
            <md-button ng-click="$ctrl.closeDialog()" class="md-primary">
              Close
            </md-button>
          </md-dialog-actions>
        </md-dialog>
      `
    });
  }
});

statusPage.component("statusPage", {
  controller: "StatusCtrl",
  templateUrl: "status.html"
});
