import Vue from 'vue';
// @ts-ignore
import App from './App';
// @ts-ignore
import store from '../store';
// @ts-ignore
import router from './router';
import Vuetify from 'vuetify'; // path to vuetify export
// import './plugins/vuetify';
import colors from 'vuetify/lib/util/colors';
import ja from 'vuetify/src/locale/ja';
// @ts-ignore
global.browser = require('webextension-polyfill');
// @ts-ignore
Vue.prototype.$browser = global.browser;
Vue.use(Vuetify);
/* eslint-disable no-new */
new Vue({
    // el: '#app',
    // @ts-ignore
    //     Vuetify,
    vuetify: new Vuetify({
        theme: {
            dark: false,
            themes: {
                light: {
                    primary: colors.red.darken1,
                    secondary: colors.red.lighten4,
                    accent: colors.indigo.base,
                },
            },
        },
        lang: {
            locales: { ja },
            current: 'ja'
        }
    }),
    // @ts-ignore
    store,
    router,
    render: h => h(App),
}).$mount('#app');
//# sourceMappingURL=popup.js.map