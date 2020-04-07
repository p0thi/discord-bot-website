import axios from "axios";
import store from "../store";

export default function setup(vue) {
  axios.interceptors.response.use(
    response => response,
    function(err) {
      switch (err.response.status) {
        case 401:
          store.dispatch("logout");
          vue.$toast.error(
            "Du wurdest durch einen Fehler automatisch abgemeldet",
            {
              dismissable: true,
              queueable: true
            }
          );
          break;
        case 429:
          vue.$toast.error(
            "Du musst warten, bevor du weitere Befehle senden kannst",
            {
              dismissable: true,
              queueable: true
            }
          );
          break;
      }

      return Promise.reject(err);
    }
  );
}
