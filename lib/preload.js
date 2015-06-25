var ipc = require('ipc');
var url = require('url');
var querystring = require('querystring');
var defaults = require('../config.json');

var base64ToHex = function(str) {
  return new Buffer(str, 'base64').toString('hex');
};

var hexToBase64 = function(str) {
  return new Buffer(str, 'hex').toString('base64');
};

global.App = function(options) {

  if (!options) {
    options = {};
  }

  var app = {
    config: defaults,
/*    {
      supernet: {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: 7777,
      },
      nxt: {
        ssl: false,
        protocol: 'http',
        hostname: '127.0.0.1',
        port: 7876,
      },
    },*/
  };

  for (var k in options) {
    if (typeof options[k] !== 'object') {
      app.config[k] = options[k];
      continue;
    }
    for (var i in options[k]) {
      if (!app.config[k]) {
        var isArray = options[k] instanceof Array;
        app.config[k] = isArray
          ? []
          : {};
      }
      app.config[k][i] = options[k][i];
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

    var apiUrl = app.config.supernet;
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
      useSsl = app.config.nxt.ssl;
    }
    var path = useSsl
      ? 'nxts'
      : 'nxt';
    app.request(query, path, callback);
  };

  app.getTaggedDataAsUri = function(txid, callback) {
    var query = {
      requestType: 'getTaggedData',
      transaction: txid,
    };
    app.nxt(query, function(err, resp) {
      if (err) {
        callback(err);
        return;
      }
      if (!resp.type.match(/^[-\w+]+\/[-\w+]+$/)) {
        callback(new Error('Invalid mime-type'));
        return;
      }
      try {
        var base64Data = hexToBase64(resp.data);
      } catch(e) {
        callback(e);
        return;
      }
      var uri = 'data:' + resp.type + ';base64,' + base64Data;
      callback(null, uri);
    });
  };

  app.getNxtClientUrl = function() {
    var nxtUrl = app.config.nxt;
    nxtUrl.pathname = 'index.html';
    return url.format(nxtUrl);
  };

  return app;
};

