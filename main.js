var app = require('app');
var ipc = require('ipc');
var BrowserWindow = require('browser-window');
var Log = require('log');
var log = new Log();
var mainWindow = null;
var baseUrl = 'file://' + __dirname + '/ui/';

app.on('ready', function() {

  var screen = require('screen');
  var size = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
//    width: 400,
//    height: 400,
    icon: __dirname + '/ui/img/logo.png',
  });

  //mainWindow.loadUrl(baseUrl + 'start.html');
  mainWindow.loadUrl(baseUrl + 'index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  ipc.on('appConnect', function(args) {
    console.log(args);
    mainWindow.close();
    mainWindow = null;
    mainWindow = new BrowserWindow({
      width: size.width,
      height: size.height,
      icon: __dirname + '/ui/img/logo.png',
    });
    mainWindow.loadUrl(baseUrl + 'index.html');
  });

});

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

log.info('Application started ...');

