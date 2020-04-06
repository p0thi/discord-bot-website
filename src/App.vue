<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2 round-img elevation-2"
          contain
          src="@/assets/logo.png"
          transition="scale-transition"
          width="40"
        />
        <h1>Pothi-Bot</h1>
      </div>

      <v-spacer></v-spacer>

      <v-btn v-if="isLoggedIn" @click="logout" text>
        <span class="mr-2">Logout</span>
        <v-icon>mdi-logout</v-icon>
      </v-btn>
      <v-btn
        v-else
        @click="login"
        :loading="authStatus === 'auth' || authStatus === 'login'"
        text
      >
        <span class="mr-2">Login mit discord</span>
        <v-icon>mdi-discord</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs align-with-title>
          <v-tab to="/">Home</v-tab>
          <v-tab to="/guilds">Discord Server</v-tab>
          <!-- <v-tab v-if="isLoggedIn">Einstellungen</v-tab> -->
        </v-tabs>
      </template>
    </v-app-bar>

    <v-content>
      <v-container>
        <router-view> </router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "App",

  components: {},
  computed: {
    ...mapGetters(["isLoggedIn", "authStatus"])
  },
  methods: {
    ...mapActions(["login", "logout"])
  },
  data: () => ({
    //
  })
};
</script>
<style lang="scss">
#app {
  background-color: #f5f5f5;
}
.round-img {
  border-radius: 50%;
}
</style>
