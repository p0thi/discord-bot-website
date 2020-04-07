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
            "Du wurdest durch einen Fehler automatisch abgemeldet"
          );
          break;
        case 429:
          vue.$toast.error(
            "Du musst warten, bevor du weitere Befehle senden kannst"
          );
          break;
        default:
          if (err.data && err.data.message) {
            vue.$toast.error(err.data.message);
          } else {
            vue.$toast.error("Es ist ein Fehler aufgetreten");
          }
      }

      return Promise.reject(err);
    }
  );
}
