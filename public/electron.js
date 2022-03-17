const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const ProgressBar = require("electron-progressbar")

let mainWindow;
let progressBar;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: isDev
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


autoUpdater.on("checking-for-update", () => {
  log.info("업데이트 확인 중...");
});
autoUpdater.on("update-available", info => {
  log.info("업데이트가 가능합니다.", info);
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

autoUpdater.on("update-not-available", info => {
  log.info("현재 최신버전입니다.", info);
});
autoUpdater.on("error", err => {
  log.info("에러가 발생하였습니다. 에러내용 : " + err);
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