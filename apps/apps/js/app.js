var ipc = require('ipc');
var url = require('url');
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

    for (i = 0; i < data.length; i++) {
      if (!data[i].image) {
        data[i].image = './img/placeholder.jpg';
        continue;
      }
      var image = url.parse(data[i].image);
      // Relative URL
      if (!image.protocol) {
        data[i].image = '../' + data[i].id + '/' + data[i].image;
      }
    }

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

