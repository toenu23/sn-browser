var app = require('app');
var BrowserWindow = require('browser-window');
var Log = require('log');
var log = new Log();
var mainWindow = null;

app.on('ready', function() {

  var screen = require('screen');
  var size = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    icon: __dirname + '/ui/img/logo-supernet-white.png',
  });

  mainWindow.loadUrl('file://' + __dirname + '/ui/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

log.info('Application started ...');

