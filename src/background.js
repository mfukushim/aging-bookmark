// import store from './store';
global.browser = require('webextension-polyfill');

chrome.browserAction.onClicked.addListener(tab => open("options/options.html"));
