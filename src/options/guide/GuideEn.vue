<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="12">
      <p class=".subtitle-1" style="margin: 1em 0 1em 0">Bookmarked for later reading. But I didn't see it much, and eventually became full of bookmarks.</p>
      <p class=".subtitle-1" style="margin: 1em 0 1em 0">It is a tool to move rarely used bookmarks to another place for you.</p>
      <p class=".body-2" style="margin: 1em 0 1em 0">
        1. We recommend exporting your bookmarks and backing them up just in case. If you move a lot of bookmarks, the menu layout may change badly.
      </p>
      <div class="text-center">
        <v-btn v-on:click="openBookmarkManager">Open Bookmark Manager</v-btn>
        ("Export bookmarks" is in the upper right corner)
      </div>
      <p>If you are sharing your bookmarks with multiple devices, consider temporarily turning off bookmark and history synchronization.</p>
      <div class="text-center">
        <v-btn v-on:click="openSetting">Open sync settings</v-btn>
        (Setting > Sync and Google services > Sync > Bookmarks, History)
      </div>
      <p class=".body-2" style="margin: 1em 0 1em 0">
        2. Enter the number of days to extract unused bookmarks. Extract unused bookmarks from the specified number of days.
      </p>
      <p class=".body-2" style="margin: 1em 0 1em 0">
        3. Enter the number of extraction exclusions. Exclude bookmarks that have been used more than a certain number of times, even if they have not been used for a long time.
      </p>
      <p class=".body-2" style="margin: 1em 0 1em 0">4. Press the extract button. It takes a little time. Press the button again to stop extraction.</p>
      <p class=".body-2" style="margin: 1em 0 1em 0">
        5. Consider whether to move the extracted bookmark, and check the bookmark to be moved. You can select them all at once.
      </p>
      <p class=".body-2" style="margin: 1em 0 1em 0">
        6. Press the move button. Then "Aging Bookmark" is made in the menu bar. Unused bookmarks will be moved there. You can't undo it, so please fine-tune your bookmarks with
        the bookmark manager. If you don't like it, import the exported bookmark and put it back.
      </p>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// @ts-ignore
import Chrome = require('chrome');

export default Vue.extend({
  name: 'GuideEn',

  data: () => ({}),
  methods: {
    openBookmarkManager() {
      chrome.tabs.create({ url: 'chrome://bookmarks/' });
    },
    openSetting() {
      chrome.tabs.create({ url: 'chrome://settings/syncSetup/advanced' });
    },
  },
});
</script>

<style scoped></style>
