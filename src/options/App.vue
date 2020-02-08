<template>
  <v-app id="inspire">
    <v-app-bar app color="indigo" dark>
      <v-toolbar-title>{{$vuetify.lang.t('$vuetify.ab.title')}}</v-toolbar-title>
    </v-app-bar>
    <v-content>
      <v-container class="fill-height" fluid>
        <component v-bind:is="guide"></component>
        <v-row align="center" justify="center">
          <v-card tile>
            <v-col cols="12" sm="12">
              <v-form ref="form" v-model="validForm" class="d-flex pa-2 justify-center flex-wrap">
                <v-card-text>{{$vuetify.lang.t('$vuetify.ab.bmNumber')}}{{ progress }}
                </v-card-text>
                <v-text-field
                        class="ma-2 align-self-center"
                        v-model="agingDay"
                        v-bind:label="$vuetify.lang.t('$vuetify.ab.thresholdDay')"
                        v-bind:placeholder="$vuetify.lang.t('$vuetify.ab.dayNumber')"
                        :rules="[rules.required, rules.isInteger]"
                        :disabled="textDisabled"
                        @change="inputChange"
                ></v-text-field>
                <v-text-field
                        class="ma-2 align-self-center"
                        v-model="viewCountNotAging"
                        v-bind:label="$vuetify.lang.t('$vuetify.ab.exceptCountNumber')"
                        v-bind:placeholder="$vuetify.lang.t('$vuetify.ab.countNumber')"
                        :rules="[rules.required, rules.isInteger]"
                        :disabled="textDisabled"
                        @change="inputChange"
                ></v-text-field>
                <v-btn class="pa-2 ma-2 align-self-center" :disabled="extractButtonDisabled" large
                       @click="clickSearchAgedBookmark">
                  {{ extractButtonLabel }}
                </v-btn>
                <v-dialog v-model="dialog" persistent max-width="420">
                  <template v-slot:activator="{ on }">
                    <v-btn v-bind:disabled="moveButtonDisabled || selected.length==0" class="pa-2 ma-2 align-self-center" large v-on="on">
                      {{$vuetify.lang.t('$vuetify.ab.moveButton')}}
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="headline">{{$vuetify.lang.t('$vuetify.ab.confirmMove')}}</v-card-title>
                    <v-card-text>{{$vuetify.lang.t('$vuetify.ab.confirmBody')}}</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text @click="dialog = false">{{$vuetify.lang.t('$vuetify.ab.cancel')}}</v-btn>
                      <v-btn text @click="moveBookmarks">{{$vuetify.lang.t('$vuetify.ab.doMove')}}</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-form>
              <v-form class="d-flex pa-2 justify-start flex-wrap">
                <v-simple-checkbox v-model="selectAll" class="mx-2"></v-simple-checkbox>
                {{$vuetify.lang.t('$vuetify.ab.selectAll')}}
                <v-simple-checkbox v-model="copyOnly" class="mx-2"></v-simple-checkbox>
                {{$vuetify.lang.t('$vuetify.ab.copyOnly')}}
              </v-form>
            </v-col>
          </v-card>
          <v-col align-self="center" cols="12">
            <v-data-table v-model="selected" :headers="headers" :items="resultBookmark" :items-per-page="itemPerPage"
                          item-key="id" show-select :loading="loading">
              <template v-slot:default></template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2019 mfuku </span>&nbsp;<span><a class="white--text" href="https://akibakokoubou.jp/">https://akibakokoubou.jp/</a></span
    >&nbsp;
      <span class="white--text"><a class="white--text" href="https://github.com/mfukushim/aging-bookmark">https://github.com/mfukushim/aging-bookmark</a></span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
  import {Component, Vue, Watch} from 'vue-property-decorator';
  import {BookmarkUtil} from '../service/BookmarkUtil';

  // @ts-ignore
  import Chrome = require('chrome');
  import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
  import HistoryItem = chrome.history.HistoryItem;
  import GuideJa from "./guide/GuideJa.vue";
  import GuideEn from "./guide/GuideEn.vue";


  class BookmarkInfo { //implements IBookmarkInfo
    constructor(id: string, bookmark: BookmarkTreeNode, history: HistoryItem | null, path: string, time: Date) {
      this._bookmark = bookmark;
      this.id = id;
      this.history = history;
      this._path = path;
      this._time = time;
    }

    get time(): Date {
      return this._time;
    }

    set time(value: Date) {
      this._time = value;
    }

    get path(): string {
      return this._path;
    }

    set path(value: string) {
      this._path = value;
    }

    get bookmark(): BookmarkTreeNode {
      return this._bookmark;
    }

    set bookmark(value: BookmarkTreeNode) {
      this._bookmark = value;
    }

    get url() {
      if (this._bookmark.url) {
        if (this._bookmark.url.length > 45) {
          return this._bookmark.url.substring(0, 30) + ' ... ' + this._bookmark.url.substring(this._bookmark.url.length - 10, this._bookmark.url.length);
        } else if (this._bookmark.url.length > 30) {
          return this._bookmark.url.substring(0, 30) + ' ... ';
        }
        return this._bookmark.url;
      }
      return '';
    }

    get viewCount() {
      if (this.history) {
        return this.history.visitCount;
      }
      return '-';
    }

    get lastViewTime() {
      if (this._time && this._time.getTime() != 0) {
        return this._time.toDateString();
      }
      return '-';
    }

    get lastVisitTick(): number {
      if (this._time && this._time.getTime() != 0) {
        return this._time.getTime();
      }
      return 0;
    }

    get visitCountNum(): number {
      if (this.history) {
        return this.history.visitCount || 0;
      }
      return 0;
    }

    id: string;
    private _bookmark: BookmarkTreeNode;
    history: HistoryItem | null = null;
    private _path: string;
    private _time: Date;
  }

  @Component
  ({
    components: {
      'guide': GuideJa,
      'guideE': GuideEn
    }
  })
  export default class Index extends Vue {
    /** data */
    private progress: string = '0/0';
    private progressCount = 0;
    private selectAll = false;
    private copyOnly = false;
    protected resultBookmark: BookmarkInfo[] = [];
    private selected: BookmarkInfo[] = [];
    private guide = (this.$vuetify.lang.current == 'ja') ? GuideJa : GuideEn;
    protected viewCountNotAging = 5;
    private agingDay = 100;
    protected selectDefaultViewCountNotAging = ['0', '3', '5', '10'];
    // protected datePicker = '';
    // protected items = [];
    protected extractButtonDisabled = false;
    private moveButtonDisabled = false;
    private textDisabled = false;
    private validForm = true;
    protected extractButtonLabel = this.$vuetify.lang.t('$vuetify.ab.pickBookmarks');
    protected extractRunning = false;
    private headers = [
      {
        text: this.$vuetify.lang.t('$vuetify.ab.bmName'),
        align: 'leftTitle',
        sortable: true,
        value: 'bookmark.title',
        width: 3,
      },
      {
        text: 'URL',
        align: 'left',
        sortable: true,
        value: 'url',
        width: 3,
      },
      {
        text: this.$vuetify.lang.t('$vuetify.ab.folderPath'),
        align: 'left',
        sortable: true,
        value: 'path',
        width: 3,
      },
      {
        text: this.$vuetify.lang.t('$vuetify.ab.visitCount'),
        align: 'left',
        sortable: true,
        value: 'viewCount',
        width: 1,
      },
      {
        text: this.$vuetify.lang.t('$vuetify.ab.lastOpenDate'),
        align: 'left',
        sortable: true,
        value: 'lastViewTime',
        width: 2,
      },
    ];
    private itemPerPage = 15;
    private loading = false;
    private dialog = false;

    private rules = {
      required: (value: any) => {
        return !!value || this.$vuetify.lang.t('$vuetify.ab.validateInput');
      },
      isInteger: (value: any) => {
        if (!new RegExp('^[0-9]+$').test(value)) {
          return this.$vuetify.lang.t('$vuetify.ab.validateNumber');
        }
        let v = Number.parseInt(value);
        return v > 0 || this.$vuetify.lang.t('$vuetify.ab.validatePlus');
      },
    };

    @Watch('selectAll')
    private selectAllItem() {
      if (this.selectAll) {
        this.selected = this.resultBookmark;
      } else {
        this.selected = [];
      }
    }

    /**
     * ボタン状態
     */
    private inputChange() {
      this.extractButtonDisabled = !(this.agingDay > 0 && this.viewCountNotAging > 0 && !this.extractRunning && this.validForm);
    }

    /**
     * 実行中状態
     */
    private setRunning(running: boolean) {
      if (running) {
        this.extractButtonLabel = this.$vuetify.lang.t('$vuetify.ab.stop');
        this.moveButtonDisabled = true;
        this.textDisabled = true;
        this.loading = true;
      } else {
        this.extractButtonLabel = this.$vuetify.lang.t('$vuetify.ab.pickBookmarks');
        this.moveButtonDisabled = false;
        this.textDisabled = false;
        this.loading = false;
      }
      // this.selectAll = false; //  とりあえずどちらでもリセットにする
      this.extractRunning = running;
    }

    /** method **/

    /**
     * 選択したブックマークをAgingBookmarkエリアに移動する
     */
    private async moveBookmarks() {
      this.moveButtonDisabled = true;
      this.dialog = false;
      const agingRoot = await BookmarkUtil.makeAgingFolderIfNot();
      await this.moveAgingBookmarks(agingRoot.id, this.selected, this.copyOnly);
      this.resultBookmark = this.resultBookmark.filter(value => !this.selected.find(value1 => value == value1));
      this.selected = [];
      this.moveButtonDisabled = false;
      this.selectAll = false;
    }

    /**
     * 条件に合致するブックマークを探索して、取得する
     */
    private clickSearchAgedBookmark() {
      if (this.extractRunning) {
        //  動作→停止
        this.setRunning(false);
      } else {
        this.setRunning(true);
        //  停止→動作
        this.searchAgedBookmarks(); //  非同期即戻り
      }
    }

    /**
     * エージング対象ブックマークを探索する
     */
    private async searchAgedBookmarks() {
      //  もし存在しなければ移動させる基のブックマークを作る
      await BookmarkUtil.getAgingFolder();
      //  非同期で書けるはずだが一旦typescriptでの非同期flatは待つ
      this.progressCount = 0;
      this.resultBookmark = [];
      //  検索基点時刻を準備
      let timeTh = new Date().getTime() - this.agingDay * 24 * 60 * 60 * 1000;
      chrome.bookmarks.getChildren('1', async (bookmarkList: BookmarkTreeNode[]) => {
        //  ブックマークツリーから付加情報付きのすべてのブックマークを抽出する
        let bookmarkTime: (BookmarkInfo | null)[] = await this.pickAllBookmarkInfoFromTree(bookmarkList);
        const needToMoves = bookmarkTime.flatMap(value =>
            value && timeTh > value.lastVisitTick && value.visitCountNum < this.viewCountNotAging ? value : []
        );
        this.resultBookmark = await Promise.all(
            needToMoves.map(async value => {
              let folderList = await BookmarkUtil.getFolderLinks(value.bookmark);
              value.path = folderList.map((folder: BookmarkTreeNode) => folder.title).join('/');
              return value;
            })
        );
        this.setRunning(false);
        this.selectAll = false;
      });
    }

    /**
     * ブックマークの移動
     */
    private async moveAgingBookmarks(rootId: string, needToMoves: BookmarkInfo[], copyOnly: boolean) {
      for (const originBookmark of needToMoves) {
        //  移動するブックマークのフォルダー階層を取得
        let folderList = await BookmarkUtil.getFolderLinks(originBookmark.bookmark);
        //  エージング用のフォルダー階層を作る(もし存在しなければ)
        let targetParent = await BookmarkUtil.makeFolderLinks(rootId, folderList); //  ブックマークバーなどの第一階層フォルダは除去する
        if (targetParent != null && targetParent.parentId) {
          //  フォルダが存在すれば同じブックマークが存在しないか再確認して存在しなければ新規にブックマークをコピー生成する
          let child = await BookmarkUtil.getChild(targetParent.id);
          let sameInTarget = child.find((value: BookmarkTreeNode) => originBookmark.bookmark.url == value.url && originBookmark.bookmark.title == value.title);
          if (copyOnly) {
            //  コピー
            if (!sameInTarget) {
              await BookmarkUtil.create({
                parentId: targetParent.id,
                title: originBookmark.bookmark.title,
                url: originBookmark.bookmark.url,
              });
            }
          } else {
            //  ブックマーク移動
            //  移動の場合は、完全に同じurlで同じタイトルのものは削除する moveにして履歴を生かしたほうがよいし完全に同じブックマークが複数あるのは面倒すぎる
            if (sameInTarget) await BookmarkUtil.remove(sameInTarget.id);
            await BookmarkUtil.move(originBookmark.id, {parentId: targetParent.id});
            //  移動の結果としてフォルダ内がなくなればフォルダも削除する
            if (originBookmark.bookmark.parentId) {
              await this.removeFolder(originBookmark.bookmark.parentId, folderList, folderList.length - 1);
            }
          }
        }
      }
    }

    private async removeFolder(id: string, folderList: BookmarkTreeNode[], pos: number) {
      if (!folderList[pos].unmodifiable) {
        const childCheck = await BookmarkUtil.getChild(id);
        if (childCheck.length == 0) await BookmarkUtil.remove(id);
        if (pos > 0) {
          this.removeFolder(folderList[pos - 1].id, folderList, pos - 1);
        }
      }
    }

    /**
     * ツリー上の全ブックマークを付加情報付きで取り出す
     * ただし Aging Bookmarks自身は除去する
     */
    private async pickAllBookmarkInfoFromTree(bookmarkList: BookmarkTreeNode[]): Promise<(BookmarkInfo | null)[]> {
      let chromeBookmarks = (await BookmarkUtil.pickupBookmarkItems(bookmarkList)); //.slice(0, 100)
      this.progressCount = 0;
      this.progress = '0/' + chromeBookmarks.length.toString();
      let buf: (BookmarkInfo | null)[] = [];
      for (const value of chromeBookmarks) {
        if (!this.extractRunning) {
          return buf;
        }
        if (value.url) {
          let historyList: HistoryItem[] = await BookmarkUtil.searchHistory(value.url); //value.url
          let historyItems = historyList.sort((a, b) => {
            return (a.lastVisitTime || 0) - (b.lastVisitTime || 0);
          });
          this.showProgress(chromeBookmarks);
          //  履歴が得られない項目は履歴の削除を行ったケースなどだから、削除候補には入れるべき
          const b = new BookmarkInfo(
              value.id,
              value,
              historyItems.length > 0 ? historyItems[0] : null,
              '',
              new Date(historyItems.length > 0 ? <number>historyItems[0].lastVisitTime : 0)
          );
          buf.push(b);
        }
      }
      return buf;
    }

    private showProgress(chromeBookmarks: BookmarkTreeNode[]) {
      this.progressCount++;
      this.progress = `${this.progressCount.toString()}/${chromeBookmarks.length.toString()}`;
    }

    /*
        private async searchHistory(url: string): Promise<HistoryItem[]> {
          return new Promise<HistoryItem[]>(resolve => {
            let query = {text: url, startTime: 0};
            chrome.history.search(query, (results: HistoryItem[]) => {
              resolve(results);
            });
          });
        }
    */
  }
</script>

<style lang="scss" scoped>
  /*p {*/
  /*    font-size: 20px;*/
  /*}*/

  /*pre {*/
  /*    font-size: 20px;*/
  /*}*/
</style>
