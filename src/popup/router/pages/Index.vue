<template>
  <v-container fluid>
    <v-row class="v-color-picker:purple darken-2 text-center">
      <v-col cols="12" sm="6">
        <v-label color="">ブックマークエージング</v-label>
        <p>{{ progress }}</p>
      </v-col>
      <!--
            <v-col cols="8" sm="6">
                <v-text-field
                        v-model="viewCountNotAging"
                        label="エージング除外表示回数"
                        placeholder="回数"
                ></v-text-field>
            </v-col>
            <div>
                <v-date-picker header-color="" dark="dark" v-model="datePicker"></v-date-picker>
            </div>
            <v-col align="center" align-self="center" cols="12">
                <v-btn large @click="ok">ブックマークエージング移動</v-btn>
            </v-col>
-->
      <v-col align="center" align-self="center" cols="12">
        <v-btn large @click="testButton">テストボタン</v-btn>
      </v-col>
      <v-col cols="12" sm="6">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Title</th>
                <th class="text-left">Last access</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in bookmarkOutList">
                <td>{{ item.title }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

// @ts-ignore
import Chrome = require('chrome');
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import HistoryQuery = chrome.history.HistoryQuery;
import HistoryItem = chrome.history.HistoryItem;
import { BookmarkUtil } from '../../../service/BookmarkUtil';

@Component
export default class Index extends Vue {
  /** data */
  private label: string = '12';
  private progress: string = '';
  protected resultBookmark: BookmarkTreeNode[] = [];

  protected viewCountNotAging = '5';
  protected selectDefaultViewCountNotAging = ['0', '3', '5', '10'];
  protected datePicker = '';
  protected select = [];
  protected items = [];
  private count = 0;

  // private resultBookmark: BookmarkTreeNode[] = [];

  /** method **/

  private async testButton() {
    chrome.tabs.create({ url: 'options/options.html' });
    /*
                        chrome.runtime.openOptionsPage(() => {

                        });
            */
  }

  private async ok() {
    //  もし存在しなければ移動させる基のブックマークを作る
    console.log(this.datePicker);
    const agingRoot = await BookmarkUtil.makeAgingFolderIfNot();
    //  非同期で書けるはずだが一旦typescriptでの非同期flatは待つ
    chrome.bookmarks.getChildren('0', async (bookmarkList: BookmarkTreeNode[]) => {
      let chromeBookmarks = (await this.flatTitle2(bookmarkList)).slice(0, 100);
      this.progress = '0/' + chromeBookmarks.length.toString();
      let bookmarkTime = await Promise.all(
        chromeBookmarks.map(async (value, index) => {
          if (value.url) {
            let historyList = await this.searchHistory(value.url); //value.url
            let historyItems = historyList.sort((a, b) => {
              return (a.lastVisitTime || 0) - (b.lastVisitTime || 0);
            });
            this.showProgress(chromeBookmarks);
            if (historyItems.length > 0 && historyItems[0]) {
              return {
                bookmark: value,
                history: historyItems[0],
                time: <number>historyItems[0].lastVisitTime,
              };
            }
            return null;
          }
          return null;
        })
      );
      const timeTh = 31557600 * 1000 * 1000;
      const needToMoves = bookmarkTime.filter(value => {
        if (value) {
          return value.time != null && value.time < timeTh;
        } else {
          return false;
        }
      });
      const moveBookmarks = needToMoves.flatMap(value => {
        return value ? value.bookmark : null;
      }); //.join(",");
      //  ここでは生成を非同期にすると作られる前にチェックされるので多重生成される。。。
      //  考え方としては非同期として作るしかない
      //  同じ木要素の重複を削除して非同期にする手もあるが、木の中間部から複数生成する場合にはやはり重複するだろう
      //  ここは生成単位毎に同期にしたほうが無難。。。
      for (const moveBookmark of moveBookmarks) {
        if (moveBookmark) {
          this.resultBookmark.push(moveBookmark);
          //  移動対象のフォルダー階層を取得
          let folderList = await BookmarkUtil.getFolderLinks(moveBookmark);
          // console.log(folderList.map((value1: BookmarkTreeNode) => {
          //     return value1.title;
          // }).join(":"));
          // folderList.map((value1:BookmarkTreeNode) => console.log(value1));

          //  エージング用のフォルダー階層を作る
          let result = await BookmarkUtil.makeFolderLinks(agingRoot.id, folderList.slice(2));
          if (result != null && result.parentId) {
            let child = await BookmarkUtil.getChild(result.id);
            let find = child.find((value: BookmarkTreeNode) => {
              return moveBookmark.url == value.url;
            });
            if (!find) {
              await BookmarkUtil.create({
                parentId: result.id,
                title: moveBookmark.title,
                url: moveBookmark.url,
              });
            }
          }
        }
      }
      /*                out.map(async value => {

                                    if (value) {
                                        this.resultBookmark.push(value);
                                        // console.log(value);
                                        // const bmList = await BookmarkUtil.get("3058"); //value.id
                                        // if (bmList) {
                                        //     console.log(bmList[0]);
                                        let folderList = await BookmarkUtil.getFolderLinks(value);
                                        // console.log(folderList.toString());
                                        console.log(folderList.map((value1: BookmarkTreeNode) => {
                                            return value1.title;
                                        }).join(":"))
                                        folderList.map(value1 => console.log(value1));

                                        await BookmarkUtil.makeFolderLinks(agingRoot.id, folderList.slice(2));
                                        // }
                                    }
                                })*/
      // let s = bookmarkTime[0] ? chromeBookmarks[0].url : null;
      // this.curBookMarkList =(await this.searchHistory("http://trendy.nikkeibp.co.jp/article/qa/other/20020704/101001/")).toString();
      //
      // this.progress = "0/" + chromeBookmarks.length.toString();
      // this.resultBookmark = [];
      /*
                                this.flatTitle2(bookmarkList).then(value => {
                                    let s = value.map(value1 => {
                                        const url = value1.url;

                                        return value1.title;
                                    }).join(",");
                                    this.curBookMarkList = s;
                                })
                */
    });
  }

  private showProgress(chromeBookmarks: BookmarkTreeNode[]) {
    this.count++;
    this.progress = this.count.toString() + '/' + chromeBookmarks.length.toString();
  }

  private async searchHistory(url: string): Promise<HistoryItem[]> {
    return new Promise<HistoryItem[]>(resolve => {
      let query = { text: url };
      chrome.history.search(query, (results: HistoryItem[]) => {
        results.forEach(function(result) {
          // resultひとつひとつがHistoryItem形式
          //console.log(result);
        });
        resolve(results);
      });
    });
  }

  private async getBookMarkChild(node: BookmarkTreeNode): Promise<BookmarkTreeNode[]> {
    return new Promise<BookmarkTreeNode[]>(resolve => {
      chrome.bookmarks.getChildren(node.id, (results: BookmarkTreeNode[]) => {
        resolve(results);
      });
    });
  }

  private async flatTitle(bookmarkList: BookmarkTreeNode[]): Promise<BookmarkTreeNode[]> {
    let buf = new Array<BookmarkTreeNode>();
    for (let value of bookmarkList) {
      if (value.url) {
        buf = buf.concat(value);
      } else {
        let d = await this.getBookMarkChild(value);
        buf = buf.concat(await this.flatTitle(d));
      }
    }
    let g = new Promise<BookmarkTreeNode[]>(resolve => {
      resolve(buf);
    });
    return g;
  }

  private async flatTitle2(bookmarkList: BookmarkTreeNode[]): Promise<BookmarkTreeNode[]> {
    let flatMap = bookmarkList.map(async value => {
      if (value.url) {
        return new Array(value); // value;
      } else {
        let d = await this.getBookMarkChild(value);
        let promise = this.flatTitle2(d);
        return await promise;
      }
    });
    let promise1 = await Promise.all(flatMap);
    let a = promise1.flat();
    return new Promise<BookmarkTreeNode[]>(resolve => resolve(a));
  }
}

/*
        export default Vue.extend({
                data() {
                    return {
                        label: "12",
                        curBookMarkList: ""
                    };
                },
                /!*
                    mounted(): void {

                    },
                *!/
                methods: {
                    ok() {
                        chrome.bookmarks.getChildren("0", (bookmarkList: BookmarkTreeNode[]) => {
                            this.curBookMarkList = bookmarkList.map((bookmarkTreeNode: BookmarkTreeNode) => bookmarkTreeNode.title).join(",");

                        })
                    }
                }
            }
        )
    */
</script>

<!--
<script>
  export default  {
    data() {
      return {"a": 12};
    }
  };
</script>
-->

<style lang="scss" scoped>
/*p {*/
/*    font-size: 20px;*/
/*}*/

/*pre {*/
/*    font-size: 20px;*/
/*}*/
</style>
