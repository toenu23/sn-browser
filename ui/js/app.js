var remote = require('remote');
var Menu = remote.require('menu');
var currentWindow = remote.getCurrentWindow();

// Load meta info of default apps
var appHome = require('../apps/home/manifest.json');
var appApps = require('../apps/apps/manifest.json');
var appProjects = require('../apps/projects/manifest.json');
var appServices = require('../apps/services/manifest.json');

var dependencies = [
  'pascalprecht.translate',
  'ngCookies',
];

var app = angular.module('MainApp', dependencies);

// Load translations
app.config(function($translateProvider, $translatePartialLoaderProvider) {

  $translatePartialLoaderProvider.addPart('app');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: './messages/{part}/{lang}.json',
  });

  $translateProvider.preferredLanguage('en');
  $translateProvider.useLocalStorage();
  $translateProvider.useSanitizeValueStrategy(null);

});

var appController = function($scope, $timeout, $translate, $sce) {

  var messageStrings = [
    'MENU_VIEW',
    'MENU_RELOAD',
    'MENU_FULLSCREEN',
    'MENU_DEVTOOLS',
    'MENU_HELP',
    'MENU_ABOUT',
  ];

  $translate(messageStrings).then(function(translations) {

    var template = [
      {
        label: translations.MENU_VIEW,
        submenu: [
          {
            label: translations.MENU_RELOAD,
            accelerator: 'Ctrl+R',
            click: function() {
              currentWindow.reload();
            },
          },
          {
            label: translations.MENU_FULLSCREEN,
            accelerator: 'F11',
            click: function() {
              currentWindow.setFullScreen(
                !currentWindow.isFullScreen()
              );
            },
          },
          {
            label: translations.MENU_DEVTOOLS,
            accelerator: 'Alt+Ctrl+I',
            click: function() {
              currentWindow.toggleDevTools();
            },
          },
        ],
      },
      {
        label: translations.MENU_HELP,
        submenu: [
          {
            label: translations.MENU_ABOUT,
            click: function() {},
          },
        ],
      },
    ];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  
  });

  var lang = $translate.use();

  // Get App name by language, default to english
  var getAppName = function(name) {
    if (typeof name === 'object') {
      name = name[lang]
        ? name[lang]
        : name['en'];
    }
    return name;
  };

  $scope.selectedTab = 'home';

  $scope.loggedIn = function(account) {
    var apps = {
      id: 'apps',
      title: getAppName(appApps.name),
      isUncloseable: true,
      manifest: appApps,
    };
    var projects = {
      id: 'projects',
      title: getAppName(appProjects.name),
      isUncloseable: true,
      manifest: appProjects,
    };
    var services = {
      id: 'services',
      title: getAppName(appServices.name),
      isUncloseable: true,
      manifest: appServices,
    };
    $scope.tabs.push(apps);
    $scope.tabs.push(projects);
    $scope.tabs.push(services);
  };

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

  $scope.openTab = function(app) {
    if (typeof app !== 'object') {
      try {
        appInfo = require('../apps/' + app + '/manifest.json');
        appInfo.id = app;
        app = appInfo;
      } catch(e) {
        console.log(e.message);
        return;
      }
    }

    // Use current timestamp as tab id
    var date = new Date();
    var millis = date.getTime();

    var name = getAppName(app.name);

    var tab = {
      id: millis.toString(),
      title: name,
      manifest: app,
    };
    if (!tab.manifest.icon) {
      tab.favicon = '../apps/' + tab.manifest.id + '/favicon.ico';
    }
    $scope.tabs.push(tab);
    $scope.selectTab(tab.id);
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

  $scope.setTitle = function(tabId, text) {
    var index = getTabIndex(tabId);
    if ($scope.tabs[index]) {
      $scope.tabs[index].title = text;
    }
  };

  $scope.setSubtitle = function(tabId, text) {
    var index = getTabIndex(tabId);
    if ($scope.tabs[index]) {
      $scope.tabs[index].subtitle = text;
    }
  };

  $scope.setIcon = function(tabId, icon) {
    var index = getTabIndex(tabId);
    if ($scope.tabs[index] && $scope.tabs[index].manifest) {
      $scope.tabs[index].manifest.icon = icon;
    }
  };

  $scope.setFavicon = function(tabId, url) {
    var index = getTabIndex(tabId);
    if ($scope.tabs[index]) {
      $scope.tabs[index].favicon = url;
    }
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
      title: getAppName(appHome.name),
      isUncloseable: true,
      showBeforeLogin: true,
      manifest: appHome,
    },
  ];
};

var ctrlArgs = [
  '$scope',
  '$timeout',
  '$translate',
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

    webview.send('appReady');
  };

  var ipcHandler = function(e) {
    $timeout(function() {
      if (e.channel == 'appLaunch') {
        $scope.openTab(e.args[0]);

      } else if (e.channel == 'loggedIn') {
        $scope.loggedIn(e.args[0]);

      } else if (e.channel == 'setTitle') {
        $scope.setTitle(webview.id, e.args[0]);

      } else if (e.channel == 'setSubtitle') {
        $scope.setSubtitle(webview.id, e.args[0]);

      } else if (e.channel == 'setIcon') {
        $scope.setIcon(webview.id, e.args[0]);

      } else if (e.channel == 'setFavicon') {
        $scope.setFavicon(webview.id, e.args[0]);
      }
    });
  };

  return {
    link: function(scope, element, attrs) {
      $scope = scope;
      element.bind('dom-ready', function() {
        webview = this;
        $timeout(webviewReady);
      });
    },
  };
};

app.directive('webviewinit', ['$timeout', webviewInit]);

