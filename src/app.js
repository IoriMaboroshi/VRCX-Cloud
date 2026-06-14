import { VueQueryPlugin } from '@tanstack/vue-query';
import { createApp } from 'vue';

import {
    i18n,
    initComponents,
    initPlugins,
    initUiPlugins,
    initRouter,
    initSentry
} from './plugins';
import { initPiniaPlugins, pinia } from './stores';
import configRepository from './services/config';
import { queryClient } from './queries';

import App from './App.vue';

await initPlugins();

// #region | Hey look it's most of VRCX!

const app = createApp(App);

app.use(pinia).use(i18n).use(VueQueryPlugin, { queryClient });
try {
    await initPiniaPlugins();
} catch (e) {
    console.error('initPiniaPlugins:', e);
}
try {
    await configRepository.init();
} catch (e) {
    console.error('configRepo:', e);
}
try {
    await initUiPlugins();
} catch (e) {
    console.error('initUi:', e);
}
initComponents(app);
initRouter(app);
await initSentry(app);

console.log('[VRCX] Mounting app...');
app.mount('#root');
console.log('[VRCX] Mounted successfully');
