import Vue from "vue";
import VueRouter from "vue-router";

import store from "../store";

import Home from "../views/Home";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/guilds",
    name: "Discord Server",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Guilds.vue"),
    beforeEnter: requireAuth
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue")
  }
];

const router = new VueRouter({
  routes
});

function requireAuth(to, from, next) {
  if (store.getters.isLoggedIn) {
    next();
  } else {
    next("/login");
  }
}

export default router;
