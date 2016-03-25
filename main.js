if(require('electron-squirrel-startup')) return;

'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const ipcMain = electron.ipcMain;
// dialog
const dialog = electron.dialog;


let fse = require('fs-extra');
let path = require('path');
let fs = require('fs');

let dataPath = app.getPath('appData');
let appPath = path.join(dataPath, 'iChronic');
let exportPath = path.join(appPath, 'exports');
let configFile = path.join(appPath, 'config.json');

fse.ensureDirSync(appPath);

fs.access(configFile, fs.W_OK && fs.R_OK, (err) => {
  if (err) {
    let defaultConfig = {
      hosxp: {
        host: '127.0.0.1',
        database: 'hos',
        port: 3306,
        user: 'sa',
        password: '123456'
      },

      url: 'http://localhost:3000',
      key: 'aaf891ddefffa0914b4d17e701cf5bd493ec2504'
    };

    fse.writeJsonSync(configFile, defaultConfig);

  }
});

ipcMain.on('get-config-file', function(event, arg) {
  event.returnValue = configFile;
});

ipcMain.on('open-folder', function(event, arg) {

    // let folder = dialog.showOpenDialog({
    //   properties: [ 'openDirectory']
    // });
    // if (folder) event.returnValue = folder;
    // else event.returnValue = null;
  });

ipcMain.on('get-export-path', function (event) {
  event.returnValue = exportPath;
});

ipcMain.on('get-temp-path', function (event) {
  event.returnValue = app.getPath('temp');
});

ipcMain.on('close-program', function (event) {
  app.quit();
});

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    title: 'ระบบจัดการข้อมูลผู้ป่วยโรคเรื้อรัง',
    icon: './icon/health.png'
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.maximize();
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
