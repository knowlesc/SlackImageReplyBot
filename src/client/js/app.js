var angular = require("angular");

require("angular-route");
require("angular-animate");
require("angular-aria");
require("angular-material");

require("./status/StatusPage");


var app = angular.module("app", [
  "ngRoute",
  "ngMaterial",
  "StatusPage"
]);

app.config(["$routeProvider", ($routeProvider) => {
  $routeProvider
  .when("/status", {
    template: "<status-page></status-page>"
  })
  .otherwise({
    redirectTo: "/status",
  });
}]);