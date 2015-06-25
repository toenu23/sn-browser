var ipc = require('ipc');
var appLoader = require('./js/app_loader');

var dependencies = [
  'pascalprecht.translate',
  'ngCookies',
];

var app = angular.module('MainApp', dependencies);

var appController = function($scope, $timeout, $translate) {

  var lang = $translate.use();

  $scope.apps = [];

  appLoader(function(data) {
    $timeout(function() {
      $scope.apps = data;
    });
  });

  $scope.getAppText = function(text) {
    if (typeof text === 'object') {
      text = text[lang]
        ? text[lang]
        : text['en'];
    }
    return text;
  };

  $scope.openApp = function(app) {
    ipc.sendToHost('appLaunch', app);
  };
};

var ctrlArgs = [
  '$scope',
  '$timeout',
  '$translate',
  appController,
];

app.controller('AppsCtrl', ctrlArgs);

