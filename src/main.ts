import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/theme-chalk/index.css'; // 引入 ElementPlus 组件样式
import './assets/main.css';

import '@common//iconfont/iconfont.css';
import '@common/iconfont/iconfont.js';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
