import axios from "axios";

const CLIENT_ID = "234278013225795585";
const BASE_URL = "https://discordapp.com/api/oauth2/authorize";
const REDIRECT_URL = `${document.location.origin}/api/auth/callback`;
const URL = `${BASE_URL}?client_id=${CLIENT_ID}&scope=identify+guilds&response_type=code&redirect_uri=${encodeURIComponent(
  REDIRECT_URL
)}`;
const EVENT_ORIGIN = document.location.origin;

export default class AuthHandler {
  auth(name = "_blank") {
    return new Promise((resolve, reject) => {
      const _handleCode = event => {
        if (event.type !== "message") {
          return;
        }

        if (event.origin !== EVENT_ORIGIN) {
          reject("Wrong origin");
          return;
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
        this.windowObjectReference = window.open(URL, name, strWindowFeatures);
      } else if (this.previousUrl !== URL) {
        this.windowObjectReference = window.open(URL, name, strWindowFeatures);
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

      this.previousUrl = URL;
      this.listener = _handleCode;
    });
  }

  login(code) {
    return new Promise((resolve, reject) => {
      axios
        .post("/api/auth/login", { code })
        .then(response => {
          console.log("response", response);
          resolve(response);
        })
        .catch(reject);
    });
  }
}
