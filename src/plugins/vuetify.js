import Vue from "vue";
import Vuetify from "vuetify/lib";
import de from "vuetify/es5/locale/de";
import VuetifyConfirm from "vuetify-confirm";

Vue.use(Vuetify);

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
