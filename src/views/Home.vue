<template>
  <div>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="display-1 text-center">
            <span class="mr-5">Bot jetzt zu discord Server hinzufügen</span>
            <v-btn
              href="https://discordapp.com/oauth2/authorize?client_id=185547264838598656&scope=bot&permissions=36830272"
              target="_blank"
              large
              color="primary"
            >
              <v-icon>mdi-discord</v-icon>
              <span class="mx-2">Hinzufügen</span>
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Befehle im Server-Chat</v-card-title>
          <v-card-text>
            Vor jedem Befehl im Server Chat muss ein Kommando-Symbol stehen.
            Normalerseise ist dies ein
            <b>!</b> (Ausrufungszeichen). <br />Es kann aber möglichwesiese in
            manchen Servern geändert worden sein.<br />
            <router-link to="/guilds">Hier</router-link> kannst du nachsehen,
            welches Kommando-Symbol für deinen Server eingestellt ist <br />Zur
            besserern Darstellung wird hier der Standard dargestellt
          </v-card-text>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!&lt;sound&gt;</v-list-item-title>
              <v-list-item-subtitle>
                Lässt mich den &lt;sound&gt; spielen. Alle sounds können mit
                !commands eingesehen werden.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!random</v-list-item-title>
              <v-list-item-subtitle>
                Lässt mich einen zufälligen Sound abspielen.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!joke</v-list-item-title>
              <v-list-item-subtitle>
                Lässt mich dir einen zufälligen Witz senden.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!gif &lt;begriff&gt;</v-list-item-title>
              <v-list-item-subtitle>
                Lässt mich ein GIF senden, dass ich für &lt;begriff&gt; finde.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!commands</v-list-item-title>
              <v-list-item-subtitle>
                Lässt mich alle Sound-Befehle anzeigen, die auf diesem Server
                verfügbar sind.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!download &lt;sound&gt;</v-list-item-title>
              <v-list-item-subtitle>
                Lässt mich die Audiodatei von &lt;sound&gt; senden.
                &lt;sound&gt; ist ein Soundbefehl ohne das Kommando-Symbol (z.B.
                !)
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>!help</v-list-item-title>
              <v-list-item-subtitle
                >Zeigt dir weitere Hilfe an.</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title>Befehle per DM an den Bot</v-card-title>
          <v-card-text>
            Jeder dieser Befehle löst eine Aktion beim Bot aus. Der Bot teilt
            dir dann genau mit, was du machen musst
            <br />Wer lesen kann ist klar im Vorteil 😉
          </v-card-text>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>upload</v-list-item-title>
              <v-list-item-subtitle>
                Damit startest du den Prozess, um einen neuen Sound-Befehl für
                einen Server zu erstellen. Folge einfach den Anweisungen.
                <br />Du kannst auch direkt eine audio Datei an mich senden, um
                diesen Aktion zu starten
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>remove</v-list-item-title>
              <v-list-item-subtitle>
                Damit startest du den Prozess, um einen deiner Soundbefehle von
                einem Server endgültig zu löschen.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>joinsound</v-list-item-title>
              <v-list-item-subtitle>
                Damit startest du den Prozess, um für einen Server einen
                Join-Sound fürr dich einzustellen.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>joinsounddelete</v-list-item-title>
              <v-list-item-subtitle>
                Damit startest du den Prozess, um für einen Server den
                Join-Sound auszuschalten.
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>help</v-list-item-title>
              <v-list-item-subtitle
                >Zeigt dir weitere Hilfe an.</v-list-item-subtitle
              >
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
  }
};
</script>
