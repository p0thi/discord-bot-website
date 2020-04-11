import Vue from "vue";
import Vuetify, { VSnackbar, VBtn, VIcon } from "vuetify/lib";
import de from "vuetify/es5/locale/de";
import VuetifyConfirm from "vuetify-confirm";
import VuetifyToast from "vuetify-toast-snackbar";

// Vue.use(Vuetify);

Vue.use(VuetifyConfirm, {
  Vuetify,
  buttonTrueText: "Annehmen",
  buttonFalseText: "Ablehnen",
  color: "warning",
  icon: "mdi-alert",
  title: "Warnung",
  width: 350,
  property: "$confirm"
});

Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon
  }
});

Vue.use(VuetifyToast, {
  classes: ["snackbar"],
  timeout: 5000,
  vertical: true
});

export default new Vuetify({
  lang: {
    locales: { de },
    current: "de"
  },
  theme: {
    themes: {
      light: {
        primary: "#f09400",
        secondary: "#00d142",
        accent: "#000000",
        error: "#de0000"
      }
    }
  }
});
