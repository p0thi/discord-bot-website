import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
// import VuetifyToast from "vuetify-toast-snackbar"

import interceptorsSetup from "./util/axiosErrorHandle";

Vue.config.productionTip = false;

interceptorsSetup();

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
