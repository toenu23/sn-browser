// Load meta info of default apps
var appHome = require('../apps/home/manifest.json');
var appApps = require('../apps/apps/manifest.json');

var app = angular.module('MainApp', []);

var appController = function($scope, $timeout, $sce) {

  $scope.selectedTab = 'home';

  $scope.getTabSrc = function(tab) {
    var file = tab.manifest.main
      ? '/' + tab.manifest.main
      : '/index.html';
    var src = (tab.manifest && tab.manifest.url)
      ? tab.manifest.url
      : '../apps/' + tab.manifest.id + file;
    return $sce.trustAsResourceUrl(src);
  };

  $scope.selectTab = function(tabId) {
    $scope.selectedTab = tabId;
    // Force redraw of webview by adding
    // and removing class...
    // TODO this is hacky, do better
    $('#wrapper').addClass('force-redraw');
    setTimeout(function() {
      $('#wrapper').removeClass('force-redraw');
    }, 20);
  };

  $scope.closeTab = function(tabId) {
    var index = getTabIndex(tabId);
    if ($scope.selectedTab == tabId) {
      var fallback = $scope.tabs[index + 1]
        ? $scope.tabs[index + 1]
        : $scope.tabs[index - 1];
      $scope.selectedTab = fallback.id;
    }
    $scope.tabs.splice(index, 1);
  };

  var getTabIndex = function(tabId) {
    for (var k in $scope.tabs) {
      if ($scope.tabs[k].id == tabId) {
        return k;
      }
    }
  };

  $scope.tabs = [
    {
      id: 'home',
      title: appHome.name,
      isUncloseable: true,
      manifest: appHome,
    },
    {
      id: 'apps',
      title: appApps.name,
      isUncloseable: true,
      manifest: appApps,
    },
  ];
};

var ctrlArgs = [
  '$scope',
  '$timeout',
  '$sce',
  appController,
];

app.controller('TabsCtrl', ctrlArgs);


// Webview initialization
// This directive handles events emitted
// from within a webview (app)
var webviewInit = function($timeout) {

  var $scope;
  var webview;

  var webviewReady = function(e) {

    // IPC messages
    webview.addEventListener('ipc-message', ipcHandler);

    //webview.openDevTools();

    // Webview logged a message
    webview.addEventListener('console-message', function(e) {
      console.log(e.message);
    });

    // Open external links in default browser
    webview.addEventListener('new-window', function(e) {
      require('shell').openExternal(e.url);
    });
  };

  var ipcHandler = function(e) {
    $timeout(function() {
      // App is launched from within webview
      if (e.channel == 'app-launch') {
        appInfo = e.args[0];

        // Use current timestamp as tab id
        var date = new Date();
        var millis = date.getTime();

        var tab = {
          id: millis.toString(),
          title: appInfo.name,
          manifest: appInfo,
        };
        if (!tab.manifest.icon) {
          tab.favicon = '../apps/' + tab.manifest.id + '/favicon.ico';
        }
        $scope.tabs.push(tab);
        $scope.selectTab(tab.id);
      }
    });
  };

  return {
    link: function(scope, element, attrs) {
      $scope = scope;
      element.bind('dom-ready', function() {
        webview = this;
        $timeout(function() {
          webviewReady();
        });
      });
    },
  };
};

app.directive('webviewinit', ['$timeout', webviewInit]);

