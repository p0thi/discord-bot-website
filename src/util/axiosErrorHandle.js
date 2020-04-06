import axios from "axios";
import store from "../store";

export default function setup() {
  axios.interceptors.response.use(
    response => response,
    function(err) {
      if (err.response.status === 401) {
        store.dispatch("logout");
      }
      return Promise.reject(err);
    }
  );
}
