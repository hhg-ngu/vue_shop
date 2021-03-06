import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import "./plugins/element.js";
//富文本编辑器
import VueQuillEditor from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

//导入nprogress(顶部的进度条)
import Nprogress from "nprogress";
import "nprogress/nprogress.css";

//全局样式
import "./assets/css/global.css";
import TreeTable from "vue-table-with-tree-grid";
Vue.config.productionTip = false;

//树形表
Vue.component("tree-table", TreeTable);

//注册富文本编辑器
Vue.use(VueQuillEditor);
//配置axios
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
axios.interceptors.request.use((config) => {
  Nprogress.start();
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
axios.interceptors.response.use((config) => {
  Nprogress.done();
  return config;
});
Vue.prototype.$http = axios;
Vue.filter("dataFormat", (val) => {
  const dt = new Date(val);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + "").padStart(2, "0");
  const d = (dt.getDate() + "").padStart(2, "0");
  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
