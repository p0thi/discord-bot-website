"use strict";

/* global __static */
import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Menu,
  Tray
} from "electron";
import {
  createProtocol,
  installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";
import { autoUpdater } from "electron-updater";
const nodeUrl = require("url");
const Store = require("electron-store");
const path = require("path");
const icon = path.join(__static, "icon.png");
const gotTheLock = app.requestSingleInstanceLock();

const store = new Store({
  migrations: {
    "0.1.5": store => {
      store.delete("hotkeys");
    }
  }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      win.show();
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  // Create myWindow, load the rest of the app, etc...
  app.whenReady().then(() => {});
}

const isDevelopment = process.env.NODE_ENV !== "production";
let appTray;

ipcMain.on("restart-app", () => {
  autoUpdater.quitAndInstall(true, true);
});

ipcMain.on("download-update", () => {
  console.log("try update");
  try {
    autoUpdater.downloadUpdate();
  } catch (e) {
    console.log(e);
  }
});

ipcMain.on("get-hotkeys", (event, data) => {
  let result = {};
  if (store.has(`hotkeys.${data.guild}.${data.id}`)) {
    const settings = store.get(`hotkeys.${data.guild}.${data.id}`);
    result.hotkeys = settings.localeNames;
  }
  event.sender.send(`send-hotkeys-${data.id}`, result);
});

ipcMain.on("last-selected-guild", (event, data) => {
  if (!data) {
    return;
  }
  store.set("lastGuild", data);
});

ipcMain.on("get-last-selected-guild", event => {
  event.returnValue = store.get("lastGuild");
});

ipcMain.on("unlisten-all-sounds", () => {
  globalShortcut.unregisterAll();
});

ipcMain.on("listen-all-sounds", (event, sounds) => {
  for (const sound of sounds) {
    listen(event, sound);
  }
});

ipcMain.on("remove-sound-listener", (event, data) => {
  unlisten(event, data);
  // console.log("remove", data.command)
});

ipcMain.on("add-sound-listener", (event, data) => {
  const registered = listen(event, data);
  sendHotkeyUpdate(event, data.id, registered);
  // event.sender.send(`listening-sound-${data.id}`, registered);
});

const listen = (event, sound) => {
  if (!sound || !sound.id) {
    return false;
  }
  if (!store.has(`hotkeys.${sound.guild}.${sound.id}`)) {
    return false;
  }
  const settings = store.get(`hotkeys.${sound.guild}.${sound.id}`);

  console.log("try to listen to", settings);
  console.log("now listening to", settings.accelerator);
  globalShortcut.register(settings.accelerator, () => {
    console.log("hotkey detected:", settings.accelerator);
    event.sender.send(`shortcut-triggered-${sound.id}`, sound);
  });
  return settings.localeNames;
};

const unlisten = (event, sound) => {
  if (!store.has(`hotkeys.${sound.guild}.${sound.id}`)) {
    return;
  }
  const settings = store.get(`hotkeys.${sound.guild}.${sound.id}`);
  console.log("unlisten", settings);
  globalShortcut.unregister(settings.accelerator);
};

const sendHotkeyUpdate = (event, id, data) => {
  event.sender.send(`hotkey-updated-${id}`, data);
  event.sender.send(`listening-sound-${id}`, !!data);
};

ipcMain.on("store-hotkey", (event, data) => {
  console.log("BAUM");
  const modifiedReferenceSet = new Set([
    "Cmd",
    "Ctrl",
    "CmdOrCtrl",
    "Alt",
    "Option",
    "AltGr",
    "Shift",
    "Super"
  ]);
  const modifiers = new Set();
  const keyCodes = new Set();
  // if (data.automated) {
  //   const settings = store.get('hotkeys.' + data.id);
  //   if (settings) {
  //     console.log(settings);
  //     data.names = settings.names;
  //     data.keys = settings.keys;
  //   } else {
  //     return;
  //   }
  // }

  for (let i = 0; i < data.names.length; i++) {
    if (modifiedReferenceSet.has(data.names[i])) {
      modifiers.add(data.names[i]);
    } else {
      keyCodes.add(data.names[i]);
    }
  }
  if (modifiers.size < 1) {
    console.log("modifier error");
    data.error =
      "Du brauchst mindestens einen modifier (Strg/Cmd, Alt, Shift...)";
    event.sender.send("store-hotkey-response-" + data.id, data);
    return;
  }
  if (keyCodes.size < 1) {
    console.log("key error");
    data.error =
      "Du brauchst mindestens einen weitern Schlüssel (Buchstaben, Zahlen...).";
    event.sender.send("store-hotkey-response-" + data.id, data);
    return;
  }

  const shortcutString =
    Array.from(modifiers).join("+") + "+" + Array.from(keyCodes).join("+");
  if (globalShortcut.isRegistered(shortcutString)) {
    data.error = "Dieses Tastenkürzel wird bereits verwendet";
    event.sender.send("store-hotkey-response-" + data.id, data);
    return;
  }

  const allGuildHotkeys = store.get(`hotkeys.${data.guild}`);
  if (allGuildHotkeys) {
    console.log("chekcing intersections");
    for (const id in allGuildHotkeys) {
      const hotkey = allGuildHotkeys[id];

      let counter = 0;
      for (const key of hotkey.keys) {
        if (data.keys.includes(key)) {
          counter++;
        }
      }

      if (counter >= hotkey.keys.length || counter >= data.keys.length) {
        console.log("intersection error");
        data.error =
          "Dieses Tastenkürzel überschneidet sich (Teilweise) mit einem anderen.";
        event.sender.send("store-hotkey-response-" + data.id, data);
        return;
      }
    }
  }

  store.set(`hotkeys.${data.guild}.${data.id}`, {
    id: data.id,
    guild: data.guild,
    accelerator: shortcutString,
    keys: data.keys,
    names: data.names,
    localeNames: data.localeNames
  });
  listen(event, data);
  event.sender.send("store-hotkey-response-" + data.id, data);
  sendHotkeyUpdate(event, data.id, data.localeNames);
});

ipcMain.on("delete-hotkey", (event, data) => {
  if (!data || !data.id) {
    event.sender.send("delete-hotkey-response", { error: "Hotkey not set." });
    return;
  }
  const settings = store.get(`hotkeys.${data.guild}.${data.id}`);
  if (globalShortcut.isRegistered(settings.accelerator)) {
    unlisten(event, data);
  }
  store.delete(`hotkeys.${data.guild}.${data.id}`);
  event.sender.send("delete-hotkey-response-" + data.id, data);
  sendHotkeyUpdate(event, data.id, undefined);
});

ipcMain.on("discord-oauth", auth);

let authWindow;
function auth(event, uri) {
  // const uri = 'https://discord.com/oauth2/authorize' +
  //   '?response_type=code&client_id=185542328218288128' +
  //   '&redirect_uri=http://localhost/callback&scope=email%20identify&state=baum';
  if (!authWindow) {
    console.log("url", uri);
    authWindow = new BrowserWindow({
      icon,
      width: 500,
      height: 800,
      show: false,
      center: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      fullscreenable: false,
      webPreferences: {
        nodeIntegration: false,
        webSecurity: false
      }
    });

    authWindow.once("closed", () => {
      event.sender.send("code-error");
      authWindow = null;
    });
  }
  if (authWindow.webContents.getURL() !== uri) {
    authWindow.webContents.loadURL(uri);
  }
  authWindow.once("ready-to-show", () => {
    authWindow.show();
  });

  function onCallback(callUrl) {
    if (callUrl.startsWith("http://localhost/api/auth/callback")) {
      setImmediate(() => {
        authWindow.close();
      });
    } else {
      return;
    }
    const urlParts = nodeUrl.parse(callUrl, true);
    const query = urlParts.query;
    const code = query.code;
    const error = query.error;

    if (error !== undefined) {
      console.log("Error occurred.", error);
      event.sender.send("code-error");
    } else if (code) {
      event.sender.send("code-received", code);
    }
  }

  authWindow.webContents.on("will-navigate", (event, targetUrl) => {
    console.log("authWindow will navigate.");
    console.log("target url: " + targetUrl);
    onCallback(targetUrl);
  });
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    icon,
    title: "Pothi-Bot Manager",
    width: 1200,
    height: 800,
    center: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.on("page-title-updated", e => {
    e.preventDefault();
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  console.log("icon", icon);
  if (!appTray) {
    appTray = new Tray(icon);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Anzeigen",
      click: function() {
        // console.log('showing window')
        console.log("is visible before", win.isVisible());
        win.show();
        win.restore();
        win.focus();
        console.log("is visible after", win.isVisible());
      }
    },
    {
      label: "Schließen",
      click: function() {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  appTray.setContextMenu(contextMenu);

  win.on("closed", () => {
    win = null;
  });

  win.on("show", () => {
    console.log("show event triggered");
  });

  win.on("minimize", event => {
    event.preventDefault();
    win.hide();
  });

  // win.on('close', event => {
  //   if (!app.isQuiting) {
  //     event.preventDefault();
  //     win.hide();
  //   }
  //   return false;
  // })
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools();
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  } else {
    Menu.setApplicationMenu(null);
  }

  createWindow();
  autoUpdater.checkForUpdates();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

try {
  autoUpdater.autoDownload = false;
  autoUpdater.on("checking-for-update", () => {
    console.log("checking for updates", win);
    win.webContents.send("checking-for-update");
  });
  autoUpdater.on("update-available", () => {
    console.log("update available"), win;
    win.webContents.send("update-available");
  });
  autoUpdater.on("update-not-available", () => {
    console.log("no update available", win);
    win.webContents.send("update-not-available");

    // mainWindow.webContents.send('update', {message: 'update'});
    // mainWindow.webContents.send('update', {message: 'progress', progress: {
    //     percent: 50,
    //     bytesPerSecond: 2000000
    //   }});
  });
  autoUpdater.on("error", err => {
    console.log("update error");
    console.error(err);
    win.webContents.send("update-error");
  });
  autoUpdater.on("download-progress", progressObj => {
    console.log("update progress: " + progressObj.percent);
    win.webContents.send("update-download-progress", progressObj);
  });
  autoUpdater.on("update-downloaded", () => {
    // HACK(mc, 2019-09-10): work around https://github.com/electron-userland/electron-builder/issues/4046
    if (process.env.DESKTOPINTEGRATION === "AppImageLauncher") {
      // remap temporary running AppImage to actual source
      // THIS IS PROBABLY SUPER BRITTLE AND MAKES ME WANT TO STOP USING APPIMAGE
      autoUpdater.logger.info("rewriting $APPIMAGE", {
        oldValue: process.env.APPIMAGE,
        newValue: process.env.ARGV0
      });
      process.env.APPIMAGE = process.env.ARGV0;
    } else {
      autoUpdater.logger.info("Not running in AppImageLauncher");
    }
    console.log("update downloaded");
    win.webContents.send("update-downloaded");
  });
} catch (e) {
  // Catch Error
  // throw e;
}
