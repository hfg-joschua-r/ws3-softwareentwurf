import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vue from "vue"
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@/plugins/font-awesome.js"; 

createApp(App).use(store).use(router).component("font-awesome-icon", FontAwesomeIcon).mount('#app')

