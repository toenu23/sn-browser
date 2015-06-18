var ipc = require('ipc');
var appLoader = require('./js/app_loader');

var app = angular.module('MainApp', []);

var appController = function($scope, $timeout) {

  $scope.apps = [];

  appLoader(function(data) {
    $timeout(function() {
      $scope.apps = data;
    });
  });

  $scope.openApp = function(app) {
    ipc.sendToHost('app-launch', app);
  };
};

var ctrlArgs = [
  '$scope',
  '$timeout',
  appController,
];

app.controller('AppsCtrl', ctrlArgs);

