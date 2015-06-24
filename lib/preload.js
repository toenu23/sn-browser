var ipc = require('ipc');
var url = require('url');
var querystring = require('querystring');

global.App = function(options) {

  if (!options) {
    options = {};
  }

  var app = {
    supernet: {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: 7777,
    },
  };

  for (var k in options) {
    if (typeof options[k] !== 'object') {
      app[k] = options[k];
      continue;
    }
    for (var i in options[k]) {
      if (!app[k]) {
        var isArray = options[k] instanceof Array;
        app[k] = isArray
          ? []
          : {};
      }
      app[k][i] = options[k][i];
    }
  }

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

  app.request = function(query, path, callback) {

    if (typeof path === 'function') {
      callback = path;
      path = 'api';
    }

    var apiUrl = app.supernet;
    apiUrl.pathname = path;
    var urlString = url.format(apiUrl);

    var xhr = new XMLHttpRequest();
    var params = '?' + querystring.stringify(query);
    urlString += params;
    xhr.open('GET', urlString, true);

    xhr.onreadystatechange = function() {
      if (xhr.status !== 200) {
        callback('Connection Error');
        return;
      }
      if (xhr.readyState == 4) {
        var error;
        try {
          data = JSON.parse(xhr.responseText);
          error = data.errorDescription
            ? data.errorDescription
            : null;
        } catch (e) {
          error = e.message;
        }
        callback(error, data);
      }
    };
    xhr.send();
  };

  app.nxt = function(query, useSsl, callback) {
    if (typeof useSsl === 'function') {
      callback = useSsl;
      useSsl = false;
    }
    var path = useSsl
      ? 'nxts'
      : 'nxt';
    app.request(query, path, callback);
  };

  return app;
};

