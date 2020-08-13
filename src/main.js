import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import "./plugins/element.js";

//全局样式
import "./assets/css/global.css";
import TreeTable from "vue-table-with-tree-grid";
Vue.config.productionTip = false;

Vue.component("tree-table", TreeTable);
//配置axios
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
Vue.prototype.$http = axios;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
