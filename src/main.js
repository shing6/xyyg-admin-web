import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store/index';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';    // 默认主题
//import '../static/css/theme-green/index.css';       // 浅绿色主题
import '../static/css/icon.css';
import './components/common/directives';
import global_ from './components/Global'//引用文件
import "babel-polyfill";
import './icons' // icon
import Viewer from 'v-viewer'//图片放大插件
import 'viewerjs/dist/viewer.css'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import Print from 'vue-print-nb'//引入打印插件
import VueQuillEditor from 'vue-quill-editor' //引入富文本框
Vue.use(VueQuillEditor);
Vue.use(Print);  //注册
Vue.use(ElementUI, { size: 'small' });

Vue.use(Viewer);

Viewer.setDefaults({

  Options: { "inline": true, "button": true, "navbar": true, "title": true, "toolbar": true, "tooltip": true, "movable": true, "zoomable": true, "rotatable": true, "scalable": true, "transition": true, "fullscreen": true, "keyboard": true, "url": "data-source" }

});

Vue.prototype.$axios = axios;
Vue.prototype.GLOBAL = global_//定义全局服务器地址
Vue.prototype.$baseUrl = process.env.BASE_API;//定义全局api
Vue.prototype.$FileSaver=FileSaver
Vue.prototype.$XLSX=XLSX

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  if(!token && to.path !== '/login'){
    next('/login');
  }else if(to.meta.permission){
    // 如果是管理员权限则可进入
    role=== '3' ? next() : next('/403');
  }else{
    // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
    if(navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/work/editWork'){
      Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
        confirmButtonText: '确定'
      });
    }else{
      next();
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');