/**
 * 定义:
 * 一颗二叉查找树是一颗二叉树
 * 其中每个节点都含有一个Comparable的键(以及相关联的值)且每个节点的键都大于其左子树中的任意节点的键而小于右子树的任意节点的键
 */

export const compare = (a, b) => a - b;

export type Key = string | number;

export class BaseNode {
  key: Key;
  value: any;
  left: BaseNode | null;
  right: BaseNode | null;
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class BST {
  root: BaseNode = null;
  public get(key: Key) {
    this._get(this.root, key);
  }

  public del(key) {
    this._del(this.root, key);
  }

  public min() {
    return this.root ? this._min(this.root) : null;
  }

  public print() {
    this._print(this.root);
  }

  public put(key: Key, value: any) {
    this.root = this._put(this.root, key, value);
  }

  private _get(node: BaseNode, key: Key) {
    if (node === null) {
      return null;
    }
    const cmp = compare(key, node.key);
    if (cmp < 0) {
      return this._get(node.left, key);
    } else if (cmp > 0) {
      return this._get(node.right, key);
    }
    return node.value;
  }

  private _min(node: BaseNode) {
    if (node.left === null) {
      return node;
    }
    return this._min(node.left);
  }

  private _put(node: any, key: Key, value: any) {
    if (node === null) {
      return new BaseNode(key, value);
    }
    const cmp = compare(key, node.key);
    if (cmp < 0) {
      node.left = this._put(node.left, key, value);
    } else if (cmp > 0) {
      node.right = this._put(node.right, key, value);
    } else {
      node.value = value;
    }
    return node;
  }

  private _deleteMin(node) {
    if (node.left === null) {
      return node.right;
    }
    node.left = this._deleteMin(node.left);
    return node;
  }

  // 一种删除节点的方法是用它的后继节点填补, 如果left, right都有值, 后继节点就用右子树中的最小节点
  private _del(node, key) {
    if (node === null) {
      return null;
    }
    const cmp = compare(key, node.key);
    if (cmp < 0) {
      node.left = this._del(node.left, key);
    } else if (cmp > 0) {
      node.right = this._del(node.right, key);
    } else {
      if (!node.left) {
        return node.right;
      }
      if (!node.right) {
        return node.left;
      }
      const temp = node;
      node = this._min(temp.right);
      node.left = temp.left;
      node.right = this._deleteMin(temp.right);
    }
    return node;
  }

  private _print(node) {
    if (node === null) {
      return;
    }
    this._print(node.left);
    console.log(node.value);
    this._print(node.right);
  }
}
