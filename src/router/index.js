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
    const redirect = encodeURIComponent(to.fullPath);
    console.log("redirect", redirect);
    next(`/login?redirect=${redirect}`);
  }
}

let firstCall = true;
const waitForStorageToBeReady = async (to, from, next) => {
  await store.restored;
  console.log(from.fullPath, to.fullPath, firstCall);

  if (firstCall) {
    firstCall = false;
    const route = store.getters.getRoute || "/";
    console.log(route);
    if (to.fullPath === route || to.fullPath === "/") next(route);
    else next();
  } else {
    store.commit("setRoute", to.fullPath);
    next();
  }
};
router.beforeEach(waitForStorageToBeReady);

export default router;
