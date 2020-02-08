import Vue from 'vue';
// @ts-ignore
import App from './App';
// @ts-ignore
import store from '../store';
import Vuetify from 'vuetify' // path to vuetify export

import ja from '../locale/ja'
import en from '../locale/en'

// @ts-ignore
global.browser = require('webextension-polyfill');
// @ts-ignore
Vue.prototype.$browser = global.browser;

Vue.use(Vuetify);

/* eslint-disable no-new */
new Vue({
  vuetify: new Vuetify({
    lang: {
      locales: {ja, en},
      // @ts-ignore
      current: chrome.i18n.getUILanguage() == 'ja' ? 'ja' : 'en'    //'ja'
    }
  }),
// @ts-ignore
  store,
  render: h => h(App),
}).$mount('#app');
