// @ts-ignore
import Chrome = require('chrome');
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import BookmarkCreateArg = chrome.bookmarks.BookmarkCreateArg;
import BookmarkDestinationArg = chrome.bookmarks.BookmarkDestinationArg;
import HistoryItem = chrome.history.HistoryItem;

export class BookmarkUtil {
  static RootName = 'Aging Bookmarks';
  static RootParentId = '1';

  /**
   * 移動先のAging Bookmarkを取得する
   */
  static async getAgingFolder(): Promise<BookmarkTreeNode | undefined> {
    const bmList = await this.getChild(this.RootParentId);
    return bmList.find(value => value.title == this.RootName);
  }

  /**
   * もし存在しなければ移動先のAging Bookmarkのブックマークを作る
   */
  static async makeAgingFolderIfNot(): Promise<BookmarkTreeNode> {
    const find = await this.getAgingFolder();
    if (find) return find;
    return await this.create({
      title: this.RootName,
      parentId: this.RootParentId,
    });
  }

  /**
   * 再帰的にツリー上の全ブックマークを取り出す
   * 指定のルートのみは除外する(Aging Bookmarkを再付加しないようにするために)
   */
  static async pickupBookmarkItems(bookmarkList: BookmarkTreeNode[]): Promise<BookmarkTreeNode[]> {
    let flatMap = bookmarkList.flatMap(async value => {
      if (value.parentId == this.RootParentId && value.title == this.RootName) {
        return [];
      }
      if (value.url) {
        return value;
      }
      let d = await this.getChild(value.id);
      return await this.pickupBookmarkItems(d);
    });
    let promise1 = await Promise.all(flatMap);
    return promise1.flat();
  }

  /**
   * 指定したブックマークノードから親ノードを探索取得して、それを逆順に並べる
   */
  static async getFolderLinks(node: BookmarkTreeNode): Promise<BookmarkTreeNode[]> {
    let nodes = await this.getParentNode(node);
    return nodes.slice(1); //  ルートフォルダは除去
  }

  /**
   * 指定ノードの親ノードを再帰取得
   * @param node
   */
  private static async getParentNode(node: BookmarkTreeNode): Promise<BookmarkTreeNode[]> {
    if (node.parentId) {
      const bmList = await this.get(node.parentId);
      if (bmList && bmList.length >= 1) {
        let parentList = await this.getParentNode(bmList[0]);
        parentList.push(bmList[0]);
        return parentList;
      }
    }
    return [];
  }

  /**
   * 指定のルートブックマークにフォルダのリストを子展開しながらフォルダを作る ただし同じ名前の子があれば新たに作らずにそのフォルダを使って子を作る
   */
  static async makeFolderLinks(root: string, nameList: BookmarkTreeNode[]): Promise<BookmarkTreeNode | null> {
    let list: (BookmarkTreeNode | null)[];
    list = Array.from<BookmarkTreeNode | null>(nameList);
    list.unshift(null);
    const nameWithParentId = list.map((value, index) => {
      return new Promise<[BookmarkTreeNode | null, string]>(r => r([value, root]));
    });
    let result = await nameWithParentId.reduce(async (previousValue, currentValue) => {
      let p = await previousValue;
      let c = await currentValue;
      let child = await this.getChild(p[1]);
      let find = child.find(value => c[0]?.title == value.title);
      if (find != undefined && find.parentId) {
        let v = <string>find.id;
        return new Promise<[BookmarkTreeNode | null, string]>(r => r([<BookmarkTreeNode>find, v]));
      } else {
        const b = await this.create({
          parentId: p[1],
          title: c[0]?.title,
          url: c[0]?.url,
        });
        return new Promise<[BookmarkTreeNode | null, string]>(r => r([b, b.id]));
      }
    });
    return result[0] ? result[0] : null;
  }

  /**
   * chrome.bookmarks.getChildrenのスタブ
   * @param parent
   */
  static async getChild(parent: string) {
    return new Promise<BookmarkTreeNode[]>(resolve => {
      chrome.bookmarks.getChildren(parent, (bookmarkList: BookmarkTreeNode[]) => {
        resolve(bookmarkList);
      });
    });
  }

  /**
   * chrome.bookmarks.createのスタブ
   * @param bookmark
   */
  static async create(bookmark: BookmarkCreateArg) {
    return new Promise<BookmarkTreeNode>(resolve => {
      chrome.bookmarks.create(bookmark, result => {
        resolve(result);
      });
    });
  }

  /**
   * chrome.bookmarks.moveのスタブ
   * @param id
   * @param destination
   */
  static async move(id: string, destination: BookmarkDestinationArg) {
    return new Promise<BookmarkTreeNode>(resolve => {
      // @ts-ignore
      chrome.bookmarks.move(id, destination, result => {
        resolve(result);
      });
    });
  }

  /**
   * chrome.bookmarks.moveのスタブ
   * @param id
   */
  static async remove(id: string) {
    return new Promise<BookmarkTreeNode>(resolve => {
      // @ts-ignore
      chrome.bookmarks.remove(id, () => {
        resolve();
      });
    });
  }
  /**
   * chrome.history.searchのスタブ
   * @param url
   * @returns {Promise<HistoryItem[]>}
   */
  static async searchHistory(url: string): Promise<HistoryItem[]> {
    return new Promise<HistoryItem[]>(resolve => {
      let query = { text: url, startTime: 0 };
      chrome.history.search(query, (results: HistoryItem[]) => {
        resolve(results);
      });
    });
  }

  /**
   * chrome.bookmarks.getのスタブ
   * @param id
   */
  static async get(id: string): Promise<BookmarkTreeNode[] | undefined> {
    return new Promise<BookmarkTreeNode[]>(resolve => {
      // @ts-ignore
      chrome.bookmarks.get(id, list => {
        resolve(list);
      });
    });
  }
}
