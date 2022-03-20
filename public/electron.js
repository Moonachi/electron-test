const { app, BrowserWindow, ipcMain, dialog  } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const ProgressBar = require('electron-progressbar');
const axios = require("axios");
const { URLSearchParams } = require("url");

let mainWindow;
let progressBar;

function createWindow() {
  console.log("# __dirname", path.join(__dirname, "preload.js"))
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation:false,
      enableRemoteModule: true,
      devTools: isDev,
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.setResizable(true);
  mainWindow.on("closed", () => (mainWindow = null));
  mainWindow.focus();
}

ipcMain.on("app_version", event => {
  event.reply("app_version", { version: app.getVersion() });
})

ipcMain.on("get_data", (event, args) => {
  const { protocol, id, secret, ip, port } = args;
  const url = protocol + "://" + ip + ":" + port + "/oauth/token";
  const qs = "client_id=" + id + "&client_secret=" + secret + "&grant_type=client_credentials";
  log.info("url : ", url)

  axios.post(url, {
data
  },
  {  headers: {
    "Content-Type":"application/x-www-form-urlencoded"
  }})
  // event.reply("app_version", { version: app.getVersion() });
})

      
autoUpdater.autoDownload = false;

autoUpdater.on("checking-for-update", () => {
  log.info("업데이트 체크");
})

autoUpdater.on('update-available', () => {
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update available',
      message:
        'A new version of Project is available. Do you want to update now?',
      buttons: ['Update', 'Later'],
    })
    .then((result) => {
      const buttonIndex = result.response;

      if (buttonIndex === 0) autoUpdater.downloadUpdate();
    });
});

autoUpdater.on("update-not-available", () => {
  log.info("update-not-available");
})

autoUpdater.once('download-progress', (progressObj) => {
  progressBar = new ProgressBar({
    text: 'Downloading...',
    detail: 'Downloading...',
  });

  progressBar
    .on('completed', function () {
      console.info(`completed...`);
      progressBar.detail = 'Task completed. Exiting...';
    })
    .on('aborted', function () {
      console.info(`aborted...`);
    });
});

autoUpdater.on('update-downloaded', () => {
  progressBar.setCompleted();
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update ready',
      message: 'Install & restart now?',
      buttons: ['Restart', 'Later'],
    })
    .then((result) => {
      const buttonIndex = result.response;

      if (buttonIndex === 0) autoUpdater.quitAndInstall(false, true);
    });
});

app.on("ready", () => {
  createWindow();
  autoUpdater.checkForUpdates();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});