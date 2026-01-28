import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// 引入DevUI和MateChat组件库
import DevUI from 'vue-devui'
import 'vue-devui/style.css'
import MateChat from '@matechat/core'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(DevUI)
app.use(MateChat)
app.mount('#app')
