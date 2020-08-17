import Vue from "vue";
import VueRouter from "vue-router";

import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Welcome from "../components/Welcome.vue";
import Users from "../components/user/Users.vue";
import Rights from "../components/power/Rights.vue";
import Roles from "../components/power/Roles.vue";
import Cate from "../components/goods/Cate.vue";
import Params from "../components/goods/Params.vue";
import List from "../components/goods/List.vue";
import Add from "../components/goods/Add.vue";
import Order from "../components/order/Order.vue";
Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  {
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      { path: "/welcome", component: Welcome },
      { path: "/users", component: Users },
      { path: "/rights", component: Rights },
      { path: "/roles", component: Roles },
      { path: "/categories", component: Cate },
      { path: "/params", component: Params },
      { path: "/goods", component: List },
      { path: "/goods/add", component: Add },
      { path: "/orders", component: Order },
    ],
  },
];

const router = new VueRouter({
  routes,
});

//全局的导航守卫
router.beforeEach((to, from, next) => {
  /**
   * to:将要访问的路径
   * from:从哪个路径跳转而来
   * next:无参数---放行 有参数---强制跳转
   */
  if (to.path === "/login") return next();
  const token = window.sessionStorage.getItem("token");
  if (!token) return next("/login");
  next();
});

export default router;
