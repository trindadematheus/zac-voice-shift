const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios").default;
const https = require("https");
const path = require("path");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      devTools: true,
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile("index.html");
}

app.on("ready", () => {
  createWindow();
  ipcMain.handle("get-player-data", async () => {
    const response = await axios.get(
      "https://127.0.0.1:2999/liveclientdata/activeplayer",
      {
        httpsAgent: httpsAgent,
      }
    );

    return JSON.stringify(response.data);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
