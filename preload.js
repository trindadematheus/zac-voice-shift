const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  getPlayerData: async () => await ipcRenderer.invoke("get-player-data"),
});
