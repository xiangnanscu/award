import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import * as bootstrap from 'bootstrap'
import App from './App.vue'
import VueResizeText from "vue3-resize-text"


const app = createApp(App)
app.directive('ResizeText', VueResizeText.ResizeText);
app.mount('#app')