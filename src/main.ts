import { createApp } from 'vue'
import { router } from './app/router'
import App from './app/App.vue'
import './styles/base.css'

createApp(App).use(router).mount('#app')
