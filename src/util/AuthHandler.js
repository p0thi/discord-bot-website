import axios from "axios";
let ipcRenderer;
if (process.env.VUE_APP_ELECTRON_ENV) {
  const electron = require("electron");
  ipcRenderer = electron.ipcRenderer;
}

// const CLIENT_ID = process.env.VUE_APP_CLIENT_ID;
const BASE_DISCORD_URL = "https://discord.com/oauth2/authorize";
// const REDIRECT_URL = process.env.VUE_APP_ELECTRON_ENV
//   ? "http://localhost/api/auth/callback"
//   : `${process.env.VUE_APP_API_BASE_URL}/api/auth/callback`;
// const URL = `${BASE_URL}?client_id=${CLIENT_ID}&scope=identify+guilds&response_type=code&redirect_uri=${REDIRECT_URL}`;
const EVENT_ORIGIN = document.location.origin;

export default class AuthHandler {
  constructor(client_id, redirect_url) {
    this.client_id = client_id;
    this.redirect_url = redirect_url;
    this.base_url =
      process.env.VUE_APP_API_BASE_URL ||
      `${window.location.protocol}//${window.location.host}`;
    this.url = `${BASE_DISCORD_URL}?client_id=${client_id}&scope=identify+guilds&response_type=code&redirect_uri=${redirect_url}`;

    console.log("client_id", client_id);
    console.log("redirect_url", redirect_url);
    console.log("base_url", this.base_url);
    console.log("url", this.url);
  }
  auth(name = "_blank") {
    return new Promise((resolve, reject) => {
      if (process.env.VUE_APP_ELECTRON_ENV) {
        /// NODE ENV
        ipcRenderer.send("discord-oauth", this.url);
        ipcRenderer.once("code-received", (event, code) => {
          resolve(code);
        });
        ipcRenderer.once("code-error", () => {
          reject("code error");
        });
      } else {
        // WEBSITE ENV
        const _handleCode = (event) => {
          if (event.type !== "message") {
            return;
          }

          if (event.origin !== EVENT_ORIGIN) {
            // reject("Wrong origin");
            // return;
          }

          const { data } = event;

          if (!data) {
            reject("No data received");
            return;
          }

          if (data.source === "callback") {
            resolve(data.code);
          }
        };
        window.removeEventListener("message", this.listener);

        const strWindowFeatures =
          "toolbar=no, menubar=no, width=500, height=800, top=100, left=100";

        if (!this.windowObjectReference || this.windowObjectReference.closed) {
          this.windowObjectReference = window.open(
            this.url,
            name,
            strWindowFeatures
          );
        } else if (this.previousUrl !== this.url) {
          this.windowObjectReference = window.open(
            this.url,
            name,
            strWindowFeatures
          );
          this.windowObjectReference.focus();
        } else {
          this.windowObjectReference.focus();
        }

        if (this.timer) {
          clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
          if (this.windowObjectReference.closed) {
            reject("Window closed");
            clearInterval(this.timer);
          }
        }, 2000);

        window.addEventListener("message", _handleCode, false);

        this.previousUrl = this.url;
        this.listener = _handleCode;
      }
    });
  }

  login(code) {
    console.log("code received:", `#${code}#`);
    return new Promise((resolve, reject) => {
      console.log("redirect:", this.redirect_url);
      axios
        .post(`${this.base_url}/api/auth/login`, {
          code,
          redirect: this.redirect_url,
        })
        .then((response) => {
          console.log("response", response);
          resolve(response);
        })
        .catch(reject);
    });
  }
}
