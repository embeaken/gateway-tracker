import { datadogRum } from '@datadog/browser-rum'

import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

datadogRum.init({
    applicationId: 'dbadf460-c909-44e2-ae00-f89f8395ee1a',
    clientToken: 'pub10c57c6446818cbb642286a0e639eb93',
    site: 'datadoghq.com',
    service: 'gateway-tracker',
    env: 'prod',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackBfcacheViews: true,
    defaultPrivacyLevel: 'mask-user-input',
});

createApp(App).mount('#app')
