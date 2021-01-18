const compare = (a, b) => a - b;

const enum Color {
  RED,
  BLACK
}

type Key = string | number;

class RedBlackNode {
  key: Key;
  value: any;
  color: Color;
  left: RedBlackNode | null;
  right: RedBlackNode | null;

  constructor(key, value, color) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
    this.color = color;
  }
}

/**
 * 根据2-3 树演变
 * 红链接表示将两个2- 节点构成一个3- 节点
 * 黑链接表示2-3 树中的普通节点
 * 定义:
 * 1. 红链接均为左链接
 * 2. 没有一个节点同时和两条红链接相连
 * 3. 该树是完美黑色平衡的, 即任意空链接到根节点的路径上的黑链接数量相同
 * 药店:
 * 和 2-3 树一样, 插入的时候插入底部, 自底向上分解节点(通过左旋右旋和颜色变换)
 * 如果一个节点下面两个红子节点, 将两个子节点颜色变黑, 同时将父节点的颜色由黑变红, 向上转化
 * 如果根节点由红变黑, 树的高度是加1
 */
export class RedBlackBST {
  root: RedBlackNode = null;

  public put(key: Key, value?: any) {
    value = value || key;
    this.root = this._put(this.root, key, value);
    this.root.color = Color.BLACK;
  }

  public del(key: Key) {
    if (!this.isRed(this.root.left) && !this.isRed(this.root.right)) {
      this.root.color = Color.RED;
    }
    this.root = this._del(this.root, key);
    if (this.root) {
      this.root.color = Color.BLACK;
    }
  }

  private _put(node: RedBlackNode, key: Key, value: any): RedBlackNode {
    if (node === null) {
      return new RedBlackNode(key, value, Color.RED);
    }
    const cmp = compare(key, node.key);
    if (cmp < 0) {
      node.left = this._put(node.left, key, value);
    } else if (cmp > 0) {
      node.right = this._put(node.right, key, value);
    } else {
      node.value = value;
    }
    if (this.isRed(node.right) && !this.isRed(node.left)) {
      node = this.rotateLeft(node);
    }
    if (this.isRed(node.left) && this.isRed(node.left.left)) {
      node = this.rotateRight(node);
    }
    if (this.isRed(node.left) && this.isRed(node.right)) {
      this.flipColors(node);
    }

    return node;
  }

  /**
   * 删除节点也是向下遍历, 确保当前节点不是2- 节点, 如果键在树的底部直接删除, 如果不在, 和二叉树一样交换右子树中最小的元素,
   * 问题就转化为删除一棵根节点(右子树)不是2- 节点的最小值
   * @param node
   * @param key
   */
  private _del(node: RedBlackNode, key: Key) {
    if (compare(key, node.key) < 0) {
      if (!this.isRed(node.left) && !this.isRed(node.left.left)) {
        node = this.moveRedLeft(node);
      }
      node.left = this._del(node.left, key);
    } else {
      // 如果左子接点是 红 就右旋
      if (this.isRed(node.left)) {
        node = this.rotateRight(node);
      }
      // 如果是树的底部, 直接删除
      if (compare(key, node.key) === 0 && node.right === null) {
        return null;
      }
      // 不是树的底部, 确保右子节点不是2- 节点
      if (!this.isRed(node.right) && !this.isRed(node.right.left)) {
        node = this.moveRedRight(node);
      }
      // 和二叉树 一样替换右子树最小节点
      if (compare(key, node.key) === 0) {
        const temp = node;
        node = this._min(node.right);
        node.left = temp.left;
        node.right = this._delMin(temp);
      } else {
        node.right = this._del(node.right, key);
      }
    }
    return this.balance(node);
  }

  private _min(node: RedBlackNode) {
    if (node.left === null) {
      return node;
    }
    return this._min(node.left);
  }

  /**
   * 向下转化, 保证左子节点 不是2- 节点
   * @param node
   */
  private _delMin(node: RedBlackNode) {
    // 最左节点
    if (node.left === null) {
      return null;
    }
    // 如果 左子节点是 2- 节点, 借节点
    if (!this.isRed(node.left) && !this.isRed(node.left.left)) {
      node = this.moveRedLeft(node);
    }

    node.left = this._delMin(node.left);
    return this.balance(node);
  }

  /**
   * 从右边借红节点, 让左子节点变成3- 或 4- 节点
   * @param node
   */
  private moveRedLeft(node: RedBlackNode) {
    // 现将节点 结合成4- 节点
    this.flipColors(node);
    // 如果 node.right.left是红, 那就不是4- 节点
    if (this.isRed(node.right.left)) {
      node.right = this.rotateRight(node.right);
      node = this.rotateLeft(node);
      // 现在将left, right由红变黑 保证是3- 或 4- 节点, 便于理解, 也可以在后面向上配平的时候转化.
      this.flipColors(node);
    }
    return node;
  }

  private moveRedRight(node: RedBlackNode) {
    this.flipColors(node);
    if (this.isRed(node.left.left)) {
      node = this.rotateRight(node);
      this.flipColors(node);
    }
    return node;
  }

  /**
   * 向上分解临时的4- 节点
   * @param node
   */
  private balance(node: RedBlackNode) {
    if (this.isRed(node.right) && !this.isRed(node.left)) {
      node = this.rotateLeft(node);
    }
    if (this.isRed(node.left) && this.isRed(node.left.left)) {
      node = this.rotateRight(node);
    }
    if (this.isRed(node.left) && this.isRed(node.right)) {
      this.flipColors(node);
    }
    return node;
  }

  // 将红色右链接转化为左链接,
  private rotateLeft(node) {
    const x = node.right;
    node.right = x.left;
    x.left = node;
    x.color = node.color;
    node.color = Color.RED;
    return x;
  }
  private rotateRight(node) {
    const x = node.left;
    node.left = x.right;
    x.right = node;
    x.color = node.color;
    node.color = Color.RED;
    return x;
  }
  private flipColors(node) {
    node.color = !node.color;
    node.left.color = !node.left.color;
    node.right.color = !node.right.color;
  }
  private isRed(node) {
    return node !== null && node.color === Color.RED;
  }
}
