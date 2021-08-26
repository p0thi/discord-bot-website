<template>
  <div>
    <v-row>
      <v-col v-if="isWebsite" md="6">
        <v-card>
          <v-card-title class="title">
            <span class="mr-5">Add the bot now to a discord server</span>
            <v-btn
              @click="navigateToAddBot"
              target="_blank"
              large
              color="primary"
            >
              <v-icon>mdi-discord</v-icon>
              <span class="mx-2"
                ><span v-if="$vuetify.breakpoint.smAndUp"> </span>Add</span
              >to my server
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </v-card-title>
        </v-card>
      </v-col>
      <v-col v-if="isWebsite" md="6">
        <v-card>
          <v-card-title class="title">
            <span>Download desktop software with hotkey function now</span>
            <v-btn
              href="https://github.com/p0thi/discord-bot-website/releases/latest"
              target="_blank"
              large
              color="secondary"
            >
              <v-icon>mdi-download-outline</v-icon>
              <span class="mx-2">Download software</span>
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col lg="8">
        <v-card>
          <v-card-title>Chat commands</v-card-title>
          <v-card-text>
            This are all commands the bot has to offer with a description.<br />
            Every command has to start with a <b>/</b>. When you type that, it
            will help you find the command by auto completing what you are
            typing. Some of the type STRING parameters have predefined values,
            that you can pick from. E.g. <b>/group delete &lt;group&gt;</b> will
            provide you all groups, that currently exist.
            <br />
            <br />
            Instead of using <b>/play &lt;sound&gt;</b> you can use
            <b>!&lt;sound&gt;</b> and instead of using <b>/commands</b> you can
            use <b>!commands</b>, where <b>!</b> is the command prefix of the
            server. <router-link to="/guilds">Here</router-link> You can find,
            which command prefix is used in your server. <br />

            <h2>Global slash commands</h2>
            <div
              v-for="command in commandsDescriptions.globalSlashCommands"
              class="py-3"
              :key="command.name"
            >
              <h3 class="mb-2">
                <span>/{{ command.name }}</span
                ><span v-if="command.description" class="ml-5 font-weight-light"
                  >({{ command.description }})</span
                >
                <span
                  v-if="command.permission"
                  class="ml-5 font-weight-light"
                  >{{ "Requires permission: " + command.permission }}</span
                >
              </h3>
              <command-viewer
                v-for="option in command.options"
                :key="option.name"
                :item="option"
              ></command-viewer>
            </div>
            <h4
              class="text-center"
              v-if="
                !commandsDescriptions.globalSlashCommands ||
                commandsDescriptions.globalSlashCommands.length === 0
              "
            >
              - None -
            </h4>
            <h2>Server slash commands</h2>
            <div
              v-for="command in commandsDescriptions.slashCommands"
              class="py-3"
              :key="command.name"
            >
              <h3 class="mb-2">
                <span>/{{ command.name }}</span
                ><span v-if="command.description" class="ml-5 font-weight-light"
                  >({{ command.description }})</span
                >
                <span class="ml-5 font-weight-light">{{
                  command.permission
                    ? "Requires permission: " + command.permission
                    : ""
                }}</span>
              </h3>
              <command-viewer
                v-for="option in command.options"
                :key="option.name"
                :item="option"
              ></command-viewer>
            </div>
            <h4
              class="text-center"
              v-if="
                !commandsDescriptions.slashCommands ||
                commandsDescriptions.slashCommands.length === 0
              "
            >
              - None -
            </h4>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col lg="4">
        <v-card>
          <v-card-title>Context menu commands</v-card-title>
          <v-card-text>
            Context menu commands can be triggered by right clicking on a user
            or a message and selecting the command in the sub-menu
            <b>"Apps"</b>.
            <h2>User contex menu commands</h2>
            <div
              v-for="command in commandsDescriptions.contextMenuCommands"
              class="py-3"
              :key="command.name"
            >
              <h3 class="mb-2">
                <span>{{ command.name }}</span
                ><span v-if="command.description" class="ml-5 font-weight-light"
                  >({{ command.description }})</span
                >
                <span
                  v-if="command.permission"
                  class="ml-5 font-weight-light"
                  >{{ "Requires permission: " + command.permission }}</span
                >
              </h3>
              <command-viewer
                v-for="option in command.options"
                :key="option.name"
                :item="option"
              ></command-viewer>
            </div>
            <h4
              class="text-center"
              v-if="
                !commandsDescriptions.contextMenuCommands ||
                commandsDescriptions.contextMenuCommands.length === 0
              "
            >
              - None -
            </h4>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import CommandViewer from "../components/CommandViewer";

export default {
  components: { "command-viewer": CommandViewer },
  methods: {
    ...mapActions(["fetchGuilds"]),
    navigateToAddBot() {
      const currentClientDetails = this.getApiParameters;

      console.log(currentClientDetails);

      if (!currentClientDetails || !currentClientDetails.client_id) {
        this.$toast.error(
          `Could not get the required information of the bot. Please try again later or refresh the page.`,
          {
            dismissable: true,
          }
        );
        return;
      }
      window
        .open(
          `https://discord.com/api/oauth2/authorize?client_id=${currentClientDetails.client_id}&permissions=36510493760&redirect_uri=http%3A%2F%2Flocalhost&scope=applications.commands%20bot`,
          "_blank"
        )
        .focus();
    },
  },
  computed: {
    ...mapGetters(["getApiParameters", "commandsDescriptions"]),
  },
  data() {
    return {
      isWebsite: !process.env.VUE_APP_ELECTRON_ENV,
    };
  },
};
</script>
<style scoped lang="scss">
.command-block {
  display: flex;
}
h2 {
  margin-top: 1.5em;
  margin-bottom: 0.2em;
}
</style>
