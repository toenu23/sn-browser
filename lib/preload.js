var ipc = require('ipc');

global.App = function() {

  var app = {};

  app.ready = function(callback) {
    app.readyCallback = callback;
  };

  ipc.on('appReady', function() {
    if (typeof app.readyCallback === 'function') {
      app.readyCallback();
    }
  });

  app.setTitle = function(text) {
    if (typeof text === 'string') {
      ipc.sendToHost('setTitle', text);
    }
  };

  app.setSubtitle = function(text) {
    if (typeof text === 'string') {
      ipc.sendToHost('setSubtitle', text);
    }
  };

  app.setIcon = function(icon) {
    if (typeof icon === 'string') {
      ipc.sendToHost('setIcon', icon);
    }
  };

  app.setFavicon = function(url) {
    if (typeof url === 'string') {
      ipc.sendToHost('setFavicon', url);
    }
  };

  app.launch = function(app) {
    if (typeof app === 'string' || typeof app === 'object') {
      ipc.sendToHost('appLaunch', app);
    }
  };

  return app;

};

