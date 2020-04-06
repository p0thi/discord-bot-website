<template>
  <v-row>
    <v-col>
      <v-row style="height: 60vh" align="center" justify="center">
        <v-card>
          <v-card-title>Du musst dich dafür einloggen</v-card-title>
          <v-card-text>
            <v-btn
              @click="login"
              :loading="authStatus === 'auth' || authStatus === 'login'"
              color="primary"
            >
              <span class="mr-2">Login mit discord</span>
              <v-icon>mdi-discord</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
export default {
  methods: {
    ...mapActions(["login", "logout"])
  },
  computed: {
    ...mapGetters(["isLoggedIn", "authStatus"])
  }
};
</script>
