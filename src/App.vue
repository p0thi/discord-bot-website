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
        <h1 :class="{ title: $vuetify.breakpoint.smAndDown }">Pothi-Bot</h1>
      </div>

      <v-spacer></v-spacer>
      <!-- <p>{{size}}</p> -->

      <span v-if="isLoggedIn">
        <v-sheet class="pa-2 mt-2">
          <v-avatar size="35" class="mr-3">
            <v-img :src="user.displayAvatarURL"></v-img>
          </v-avatar>
          <span v-if="$vuetify.breakpoint.smAndUp" class="title">{{
            user.username
          }}</span>
          <span v-if="$vuetify.breakpoint.smAndUp" class="body-1"
            >#{{ user.discriminator }}</span
          >
          <v-divider
            v-if="$vuetify.breakpoint.smAndUp"
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-btn @click="logout" text>
            <span class="mr-2">Logout</span>
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </v-sheet>
      </span>

      <v-btn v-else @click="login" text>
        <span class="mr-2">Login mit discord</span>
        <v-progress-circular
          :size="30"
          :width="3"
          indeterminate
          v-if="authStatus === 'auth'"
        ></v-progress-circular>
        <v-icon v-else>mdi-discord</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs align-with-title>
          <v-tab to="/">Home</v-tab>
          <v-tab to="/guilds">Meine Discord Server</v-tab>
          <!-- <v-tab v-if="isLoggedIn">Einstellungen</v-tab> -->
        </v-tabs>
      </template>
    </v-app-bar>

    <v-content>
      <v-container :fluid="$vuetify.breakpoint.mdAndDown">
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "App",
  created() {
    this.fetchUser();
  },
  components: {},
  computed: {
    ...mapGetters(["isLoggedIn", "authStatus", "user"]),
    size() {
      return this.$vuetify.breakpoint.name;
    }
  },
  methods: {
    ...mapActions(["login", "logout", "fetchUser"])
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

@media (min-width: 1264px) {
  .container {
    max-width: 1250px !important;
  }
}

@media (min-width: 960px) {
  .container {
    max-width: 950px;
  }
}

.round-img {
  border-radius: 50%;
}
.snackbar {
  .v-snack__wrapper {
    .v-snack__content {
      .vts__message {
        font-size: 1.25rem;
      }
    }
  }
}
</style>
