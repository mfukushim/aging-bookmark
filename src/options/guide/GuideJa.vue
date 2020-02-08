<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="12">
      <p class=".subtitle-1" style="margin: 1em 0 1em 0">後で読もうと思ってブックマークに入れたけど、あまり見なくてそのうちブックマークだらけになってしまった。</p>
      <p class=".subtitle-1" style="margin: 1em 0 1em 0">そういう人のためにあまり使わないブックマークを別のところにまとめて移動させるツールです。</p>
      <p class=".body-2" style="margin: 1em 0 1em 0">
        1. まず念のためブックマークをエクスポートしてバックアップをすることをお勧めします。移動させるブックマーク数によっては大きくメニュー配置が変わることがあるからです。
      </p>
      <div class="text-center">
        <v-btn v-on:click="openBookmarkManager">ブックマークマネージャーを開く</v-btn>
        (右上に「ブックマークをエクスポート」があります)
      </div>
      <p>複数機器でブックマークを共有している場合は一時的にブックマークと履歴の同期をオフすることも検討してください。</p>
      <div class="text-center">
        <v-btn v-on:click="openSetting">同期の設定を開く</v-btn>
        (設定 > 同期とGoogleサービス > 同期の管理 > ブックマーク, 履歴)
      </div>
      <p class=".body-2" style="margin: 1em 0 1em 0">
        2. どれくらい使わないブックマークを抽出するか日数を入れてください。この日数以上前に使っていないブックマークを抽出します。
      </p>
      <p class=".body-2" style="margin: 1em 0 1em 0">3. 抽出除外回数を入れてください。長く使っていなくても、一定回数以上使ったことのあるブックマークは除外します。</p>
      <p class=".body-2" style="margin: 1em 0 1em 0">4. 抽出ボタンを押してください。少々時間がかかります。ボタンをもう一回押すと抽出停止することが出来ます。</p>
      <p class=".body-2" style="margin: 1em 0 1em 0">
        5. 抽出したブックマークを移動させるか検討して、移動させるブックマークにチェックを付けます。一括で選ぶこともできます。
      </p>
      <p class=".body-2" style="margin: 1em 0 1em 0">
        6. 移動ボタンを押すとメニューバーにAging Bookmark
        という項目を作って、そこに普段使わないブックマークを移動させます。取消はできませんのでブックマークマネージャーでブックマークを微調整してください。気に入らなかったらエクスポートしたブックマークをインポートして元に戻します。
      </p>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// @ts-ignore
import Chrome = require('chrome');

export default Vue.extend({
  name: 'GuideJa',

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
