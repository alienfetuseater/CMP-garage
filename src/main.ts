import './assets/base.css'
import './assets/dark-theme.css'
import './assets/vscode-ui.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { applyVisualTheme, readVisualTheme } from '@/services/ui/visualTheme'

applyVisualTheme(readVisualTheme())

const app = createApp(App)

app.use(createPinia())
app.use(router)

await router.isReady()
app.mount('#app')
