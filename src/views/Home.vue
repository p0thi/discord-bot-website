<template>
  <div>
    <v-row>
      <v-col v-if="isWebsite" md="6">
        <v-card>
          <v-card-title class="title">
            <span class="mr-5">Add the bot now to a discord server</span>
            <v-btn
              href="https://discord.com/oauth2/authorize?client_id=185547264838598656&scope=bot&permissions=36830272"
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
            <span
              >Download desktop software with hotkey function now
              <br />(Currently only german keyboard layout!)</span
            >
            <v-btn
              href="https://github.com/p0thi/discord-bot-website/releases"
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
      <v-col lg="6">
        <v-card>
          <v-card-title>Commands in Server-Chat</v-card-title>
          <v-card-text>
            You have to add a command prefix at the beginning of every ocmmand.
            Normaly it is <b>!</b> (Exclamation mark). <br />
            But maybe it got changed for some servers.<br />

            <router-link to="/guilds">Here</router-link> You can find, which
            command prefix is used in your server. <br />
            For the sake of clarity, the standard is shown here.
          </v-card-text>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!&lt;sound&gt;</v-list-item-title>
              <v-list-item-subtitle>
                Makes me play the &lt;sound&gt;. You can see all commands by
                sending !commands
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!random</v-list-item-title>
              <v-list-item-subtitle>
                Makes me play a random sound.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!commands</v-list-item-title>
              <v-list-item-subtitle>
                Makes me show all sound commands, that are available on the
                server
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!download &lt;sound&gt;</v-list-item-title>
              <v-list-item-subtitle>
                Makes me send you the audiofile of &lt;sound&gt;. &lt;sound&gt;
                is a sound command wihtout the command prefix (e.g. !)
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!help</v-list-item-title>
              <v-list-item-subtitle>Provides help.</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col lg="6">
        <v-card>
          <v-card-title>Commands via DM to the bot</v-card-title>
          <v-card-text>
            Each of these commands triggers an action of the bot. Jeder dieser
            Befehle löst eine Aktion beim Bot aus. The bot will then tell you
            exactly what to do.
            <br />Who can read has a clear advantage 😉
          </v-card-text>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>upload</v-list-item-title>
              <v-list-item-subtitle>
                This will start the process of creating a new sound command for
                a server. Just follow the instructions.
                <br />You can also send me an audio file directly to start this
                action
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>remove</v-list-item-title>
              <v-list-item-subtitle>
                This starts the process of permanently deleting one of your
                sound commands from a server.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>joinsound</v-list-item-title>
              <v-list-item-subtitle>
                This starts the process of setting up a join sound for you on a
                server.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>joinsounddelete</v-list-item-title>
              <v-list-item-subtitle>
                This starts the process of disabling the join sound for a
                server.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>help</v-list-item-title>
              <v-list-item-subtitle>Provides help.</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import { mapActions } from "vuex";

export default {
  methods: {
    ...mapActions(["fetchGuilds"])
  },
  data() {
    return {
      isWebsite: !process.env.VUE_APP_ELECTRON_ENV
    };
  }
};
</script>
<style lang="scss"></style>
