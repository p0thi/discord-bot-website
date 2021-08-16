import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import axios from "axios";
import AuthHandler from "../util/AuthHandler";
import router from "../router";

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer(state) {
    return {
      token: state.token,
      loginStatus: state.loginStatus,
      sortDirection: state.sortDirection,
      sortMethod: state.sortMethod,
      favouriteSoundsFirst: state.favouriteSoundsFirst,
      route: state.route,
      filterMethods: state.filterMethods,
    };
  },
});

const store = new Vuex.Store({
  plugins: [vuexLocal.plugin],
  state: {
    route: "/",
    loginStatus: "",
    token: "",
    sortDirection: 1,
    sortMethod: 0,
    favouriteSoundsFirst: true,
    filterMethods: [],
    user: {},
    guilds: [],
    sounds: {},
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    authStatus: (state) => state.loginStatus,
    token: (state) => state.token,
    user: (state) => state.user,
    guilds: (state) => state.guilds,
    sounds: (state) => state.sounds,
    getSortDirection: (state) => state.sortDirection,
    getSortMethod: (state) => state.sortMethod,
    getFavouriteSoundsFirst: (state) => state.favouriteSoundsFirst,
    getRoute: (state) => state.route,
    getFilterMethods: (state) => state.filterMethods,
  },
  mutations: {
    auth_request(state) {
      state.loginStatus = "auth";
    },
    login_request(state) {
      state.loginStatus = "login";
    },
    auth_success(state, token) {
      state.token = token;
      state.loginStatus = "success";
    },
    auth_error(state) {
      state.loginStatus = "error";
      state.token = "";
    },
    logout(state) {
      state.token = "";
      state.loginStatus = "logout";
      state.user = {};
    },
    guilds(state, guilds) {
      state.guilds = guilds;
    },
    setUser(state, user) {
      state.user = user;
    },
    setGuildSounds(state, payload) {
      Vue.set(state.sounds, payload.guildId, payload.sounds);
    },
    setFavouriteSoundsFirst(state, payload) {
      state.favouriteSoundsFirst = payload;
    },
    setSortDirection(state, payload) {
      state.sortDirection = payload;
    },
    setSortMethod(state, payload) {
      state.sortMethod = payload;
    },
    setRoute(state, payload) {
      state.route = payload;
    },
    setFilterMethods(state, payload) {
      state.filterMethods = payload;
    },
  },
  actions: {
    login({ commit, dispatch }) {
      return new Promise((resolve, reject) => {
        commit("auth_request");
        let authHandler = new AuthHandler();
        authHandler
          .auth()
          .then((code) => {
            commit("login_request");
            authHandler
              .login(code)
              .then((loginResp) => {
                let token = loginResp.data.token;
                // localStorage.setItem("token", token);
                axios.defaults.headers.common["Authorization"] = token;
                commit("auth_success", token);
                const redirect = router.history.current.query.redirect
                  ? decodeURIComponent(router.history.current.query.redirect)
                  : "/";
                console.log("redirecting", redirect);
                router.push(redirect);
                dispatch("fetchUser");
                resolve(loginResp);
              })
              .catch((err) => {
                commit("auth_error");
                // localStorage.removeItem("token");
                reject(err);
              });
          })
          .catch((err) => {
            commit("auth_error");
            // localStorage.removeItem("token");
            reject(err);
          });
      });
    },
    logout({ commit }) {
      return new Promise((resolve, reject) => {
        try {
          // localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
          router.push("/");
        } catch (e) {
          reject(e);
        }
        commit("logout");
        resolve();
      });
    },
    fetchSounds({ commit }, guildId) {
      return new Promise((resolve, reject) => {
        if (!guildId || typeof guildId !== "string") {
          reject(new Error("Property guildId not valid string"));
          return;
        }
        axios
          .get(
            `${process.env.VUE_APP_API_BASE_URL}/api/sounds/guildsounds/${guildId}`
          )
          .then((response) => {
            commit("setGuildSounds", { guildId, sounds: response.data });
            resolve(response.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    fetchGuilds({ commit }, source) {
      return new Promise((resolve, reject) => {
        if (source) {
          console.log("source", source);
        }
        axios
          .get(`${process.env.VUE_APP_API_BASE_URL}/api/guilds/all`)
          .then((resp) => {
            console.log(resp);
            commit("guilds", resp.data);
            resolve(resp.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    fetchUser({ commit }) {
      return new Promise((resolve, reject) => {
        console.log();
        axios
          .get(`${process.env.VUE_APP_API_BASE_URL}/api/user/self`)
          .then((resp) => {
            commit("setUser", resp.data);
            console.log("user fetched", resp.data);
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
  },
  modules: {},
});

if (store.getters.isLoggedIn) {
  axios.defaults.headers.common["Authorization"] = store.getters.token;
}

export default store;
