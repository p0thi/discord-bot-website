import Vue from "vue";
import Vuetify, { VSnackbar, VBtn, VIcon } from "vuetify/lib";
import de from "vuetify/es5/locale/de";
import VuetifyConfirm from "vuetify-confirm";
import VuetifyToast from "vuetify-toast-snackbar";

// Vue.use(Vuetify);

Vue.use(VuetifyConfirm, {
  Vuetify,
  buttonTrueText: "Confirm",
  buttonFalseText: "Decline",
  color: "warning",
  icon: "mdi-alert",
  title: "Warnung",
  width: 350,
  property: "$confirm",
});

Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon,
  },
});

const vueObj = new Vuetify({
  lang: {
    locales: { de },
    current: "en",
  },
  theme: {
    themes: {
      light: {
        primary: "#f09400",
        secondary: "#00d142",
        accent: "#000000",
        error: "#de0000",
      },
    },
  },
});

export default vueObj;

Vue.use(VuetifyToast, {
  $vuetify: vueObj.framework,
  classes: ["snackbar"],
  timeout: 5000,
  vertical: true,
});
