"use strict";

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
// import { autoUpdater } from "electron-updater";
const nodeUrl = require("url");
const store = require("electron-settings");
const path = require("path");
/*eslint-disable */
const icon = path.join(__static, "logo-round.png");
/*eslint-enable */
Menu.setApplicationMenu(null);

const isDevelopment = process.env.NODE_ENV !== "production";

app.on("browser-window-created", function(e, window) {
  window.setMenu(null);
});

ipcMain.on("get-hotkeys", (event, data) => {
  let result = {};
  const settings = store.get(`hotkeys.${data.id}`);
  if (settings) {
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
  listen(event, data);
  // console.log("add", data.command)
});

const listen = (event, sound) => {
  if (!sound || !sound.id) {
    return;
  }
  const settings = store.get(`hotkeys.${sound.id}`);
  console.log("try to listen to", settings);
  if (!settings) {
    return;
  }
  console.log("now listening to", settings.accelerator);
  globalShortcut.register(settings.accelerator, () => {
    console.log("hotkey detected:", settings.accelerator);
    event.sender.send(`shortcut-triggered-${sound.id}`, sound);
  });
};

const unlisten = (event, sound) => {
  const settings = store.get(`hotkeys.${sound.id}`);
  console.log("unlisten", settings);
  if (!settings) {
    return;
  }
  globalShortcut.unregister(settings.accelerator);
};

const sendHotkeyUpdate = (event, id, data) => {
  event.sender.send(`hotkey-updated-${id}`, data);
};

ipcMain.on("store-hotkey", (event, data) => {
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
    data.error =
      "Du brauchst mindestens einen modifier (Strg/Cmd, Alt, Shift...)";
    event.sender.send("store-hotkey-response-" + data.id, data);
    return;
  }
  if (keyCodes.size < 1) {
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
  } else {
    store.set("hotkeys." + data.id, {
      id: data.id,
      accelerator: shortcutString,
      keys: data.keys,
      names: data.names,
      localeNames: data.localeNames
    });
    listen(event, data);
    event.sender.send("store-hotkey-response-" + data.id, data);
    sendHotkeyUpdate(event, data.id, data.localeNames);
  }
});

ipcMain.on("delete-hotkey", (event, data) => {
  if (!data || !data.id) {
    event.sender.send("delete-hotkey-response", { error: "Hotkey not set." });
    return;
  }
  const settings = store.get(`hotkeys.${data.id}`);
  if (globalShortcut.isRegistered(settings.accelerator)) {
    unlisten(event, data);
  }
  store.delete(`hotkeys.${data.id}`);
  event.sender.send("delete-hotkey-response-" + data.id, data);
  sendHotkeyUpdate(event, data.id, undefined);
});

ipcMain.on("discord-oauth", auth);

let authWindow;
function auth(event, uri) {
  // const uri = 'https://discordapp.com/oauth2/authorize' +
  //   '?response_type=code&client_id=185542328218288128' +
  //   '&redirect_uri=http://localhost/callback&scope=email%20identify&state=baum';
  if (!authWindow) {
    authWindow = new BrowserWindow({
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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    center: true,
    icon,
    webPreferences: {
      nodeIntegration: true
    }
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
  const appTray = new Tray(icon);

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

  console.log(contextMenu);

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
  }
  createWindow();
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
