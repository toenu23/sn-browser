module.exports = function(cb) {

  var fs = require('fs');
  var async = require('async');
  var apps = [];
  var baseDir = __dirname + '/../../';

  /*
   * Get available apps
   */
  var getApps = function(callback) {

    var nextFunc;
    var currentKey;
    var directoryContents = [];

    // Stat each file/dir
    var statListItem = function(key, i, next) {
      nextFunc = next;
      currentKey = key;
      fs.stat(baseDir + directoryContents[key], processListItem);
    };

    // Try to load as a app, if it's a directory
    var processListItem = function(err, stats) {
      if (err) {
        nextFunc();
          console.log(err);
        return;
      }
      if (!stats.isDirectory()) {
        nextFunc();
        return;
      }
      loadApp(directoryContents[currentKey], nextFunc);
    };

    var processingDone = function(err) {
      if (err) {
          console.log(err);
        return;
      }
      callback();
    };

    // Directory listing
    fs.readdir(baseDir, function(err, list) {
      if (err) {
          console.log('Error reading apps directory');
          console.log(err);
        return;
      }
      directoryContents = list;
      var keys = Object.keys(directoryContents);
      async.forEachOfSeries(keys, statListItem, processingDone);
    });
  };

  /*
   * Try to load app
   */
  var loadApp = function(dir, callback) {

    var hasIndexFile = function(exists) {
      if (!exists) {
        callback();
        return console.log(
          'App ' + dir + ' is missing index.html file'
        );
      }
      fs.exists(baseDir + dir + '/manifest.json', hasManifestFile);
    };

    var hasManifestFile = function(exists) {
      if (!exists) {
        callback();
        return console.log(
          'App ' + dir + ' is missing manifest.json'
        );
      }
      fs.readFile(baseDir + dir + '/manifest.json', 'utf8', processManifest);
    };

    var processManifest = function(err, data) {
      if (err) {
        callback();
        return   console.log(err);
      }
      try {
        data = JSON.parse(data);
      } catch (e) {
        callback();
        return   console.log(e.message);
      }
      if (data.active && dir !== 'home' && dir  !== 'apps') {
        data.id = dir;
        apps.push(data);
        callback();
        return;
      }
      callback();
    };

    fs.exists(baseDir + dir + '/index.html', hasIndexFile);
  };

  getApps(function() {
    cb(apps);
  });
};

