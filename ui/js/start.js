var ipc = require('ipc');
var app = angular.module('MainApp', []);

var mainController = function($scope, $timeout) {

  $scope.hostAddress = 'http://127.0.0.1:7777';

  $scope.connect = function() {
  console.log('connecting');
    ipc.send('appConnect', {});
  };

};

var ctrlArgs = [
  '$scope',
  '$timeout',
  mainController,
];

app.controller('MainController', ctrlArgs);

