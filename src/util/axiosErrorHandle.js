import axios from "axios";
import store from "../store";

// const errorSound = new Audio('@/assets/error.mp3');

export default function setup(vue) {
  axios.interceptors.response.use(
    (response) => response,
    function (err) {
      switch (err.response.status) {
        case 401:
          store.dispatch("logout");
          vue.$toast.error("You are not logged in", {
            dismissable: true,
            queueable: true,
          });
          break;
        case 429: {
          let hint = err.response.data.message;
          vue.$toast.error(
            `<b>SPAMSCHUTZ:</b><br>You'll have to wait before you can send any more commands<br>${hint}`,
            {
              dismissable: true,
              queueable: false,
            }
          );
          const errorSound = new Audio(require("../assets/error.mp3"));
          errorSound.play();
          break;
        }
      }

      return Promise.reject(err);
    }
  );
}
