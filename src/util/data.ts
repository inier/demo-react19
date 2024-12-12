/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-unused-vars,no-param-reassign,no-underscore-dangle */

// 数据相关：Array和Map等
import { cloneDeep, difference, each, isEmpty, isObject, upperFirst } from 'lodash-es';

export type TreeLikeArrayItem = Record<string, any>;
export type TreeLikeArray = TreeLikeArrayItem[];

export type TreeNode = Record<string, any> & { children?: Tree };
export type Tree = TreeNode[] | TreeNode;

export interface TreeNodeFieldAlias {
  idKey?: string;
  parentIdKey?: string;
  childrenKey?: string;
}

export interface TreePathOptions {
  pathSeparator?: string;
  fieldName?: string;
  childrenKey?: string;
}

export interface TraverseOptions {
  some?: boolean;
  every?: boolean;
  returnBoolean?: boolean;
  returnArray?: boolean;
}

export enum TraverseType {
  Depth = 'depth',
  Breath = 'breath',
}

// 判断是否为对象
export { isObject };

/**
 * 将List结构的对象数组转化为树形结构
 * @param array {Array<TreeLikeArrayItem>} 源数据
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function createTreeFromTreeLikeArray(array: TreeLikeArray, options?: TreeNodeFieldAlias): TreeLikeArray {
  const { idKey = 'id', parentIdKey = 'pId', childrenKey = 'children' } = options || {};
  const idMapTemp = Object.create(null);
  const cloneData: typeof array = cloneDeep(array);
  cloneData.forEach((row: TreeLikeArrayItem): void => {
    idMapTemp[row[idKey]] = row;
  });
  const result: TreeLikeArray = [];
  cloneData.forEach((row: TreeLikeArrayItem): void => {
    const parent = idMapTemp[row[parentIdKey]];
    if (parent) {
      const v = parent[childrenKey] || (parent[childrenKey] = []);
      v.push(row);
    } else {
      result.push(row);
    }
  });
  return result;
}

/**
 * 过滤树数据. 如果子节点有匹配数据, 会连带父节点一起返回
 * @param array 要过滤的数组数据
 * @param predicate 过滤函数
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function filterTreeArray(
  array: TreeLikeArray,
  predicate: (item: TreeLikeArrayItem) => boolean,
  options?: TreeNodeFieldAlias,
): TreeLikeArray {
  const { idKey = 'id', parentIdKey = 'pId' } = options || {};
  const result: TreeLikeArray = array.filter(predicate);
  const needCheekPidArr = [...result];
  // 查找父级
  while (needCheekPidArr.length) {
    // 从末尾截取一个节点, (从末尾是因为 array 大概率是排序过的数据, 从末尾查找速度快)
    const currentItemTemp: TreeLikeArrayItem = needCheekPidArr.splice(needCheekPidArr.length - 1, 1);
    const currentItem = currentItemTemp && currentItemTemp.length && currentItemTemp[0];
    if (currentItem[parentIdKey]) {
      // 判断是否有父节点, 有父节点把父节点找出来添加进结果中
      const parentItem = array.filter((item: TreeLikeArrayItem): boolean => item[idKey] === currentItem[parentIdKey]);
      if (
        parentItem.length &&
        !result.some((item: TreeLikeArrayItem): boolean => item[idKey] === parentItem[0][idKey])
      ) {
        result.unshift(parentItem[0]);
        // 重新丢回队列, 去查找父级的父级
        needCheekPidArr.push(parentItem[0]);
      }
    }
  }
  return result;
}

/**
 * 向上查找所有父节点, 返回节点的数组
 * @param array 数组类型数据
 * @param node 要查找的节点
 * @param depth 遍历的深度
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function closestParentItemInTreeArray(
  array: TreeLikeArray,
  node: TreeLikeArrayItem,
  depth: false | number = false,
  options?: TreeNodeFieldAlias,
): TreeLikeArray {
  const { idKey = 'id', parentIdKey = 'pId' } = options || {};
  const result: TreeLikeArray = [];
  let currentItem: TreeLikeArrayItem | undefined = node;
  let deepLoopCount = typeof depth === 'number' ? depth : Infinity;
  const findItem: () => TreeLikeArrayItem | undefined = () => {
    const pId = currentItem?.[parentIdKey];
    if (pId) {
      return array.find((item: TreeLikeArrayItem) => item[idKey] === pId);
    }
    return undefined;
  };
  do {
    currentItem = findItem();
    if (currentItem) {
      result.unshift(currentItem);
    }
    deepLoopCount -= 1;
  } while (currentItem && currentItem[parentIdKey] && deepLoopCount > 0);
  return result;
}

/**
 * 向上查找所有父节点 key 值, 返回 key 值的数组
 * @param array 数组类型数据
 * @param key 要查找的节点
 * @param depth 遍历的深度
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function closestParentKeysInTreeArray(
  array: TreeLikeArray,
  key: keyof any,
  depth: false | number = false,
  options?: TreeNodeFieldAlias,
): string[] {
  const { idKey = 'id', parentIdKey = 'pId' } = options || {};
  const result: string[] = [];
  let currentItem: TreeLikeArrayItem | undefined = array.find((item: TreeLikeArrayItem) => item[idKey] === key);
  let deepLoopCount: number = typeof depth === 'number' ? depth : Infinity;
  if (!currentItem) {
    return result;
  }
  const findItem: () => TreeLikeArrayItem | undefined = () => {
    const pId = currentItem?.[parentIdKey];
    if (pId) {
      return array.find((item: TreeLikeArrayItem) => item[idKey] === pId);
    }
    return undefined;
  };
  do {
    currentItem = findItem();
    if (currentItem) {
      result.unshift(currentItem[idKey]);
    }
    deepLoopCount -= 1;
  } while (currentItem && currentItem[parentIdKey] && deepLoopCount > 0);
  return result;
}

/**
 * 向下查找所有子节点, 返回节点的数组
 * @param array 数组类型数据
 * @param targetNode 要查找的节点
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function findChildrenItemInTreeArray(
  array: TreeLikeArray,
  targetNode: TreeLikeArrayItem,
  options?: TreeNodeFieldAlias,
): TreeLikeArray {
  const { idKey = 'id', parentIdKey = 'pId' } = options || {};
  const result: TreeLikeArray = [];
  const findChildren = (pId: keyof any) => array.filter((item: TreeLikeArrayItem) => item[parentIdKey] === pId);
  let queue: TreeLikeArray = findChildren(targetNode[idKey]);
  while (queue.length) {
    const currentItem: TreeLikeArrayItem | undefined = queue.shift();
    if (currentItem) {
      const children = findChildren(currentItem[idKey]);
      result.push(currentItem);
      queue = queue.concat(children);
    }
  }
  return result;
}

/**
 * 判断是否有子节点
 * @param array 数组类型数据
 * @param targetNode 要查找的节点
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function hasChildrenNode(
  array: TreeLikeArray,
  targetNode: TreeLikeArrayItem,
  options?: TreeNodeFieldAlias,
): boolean {
  const { idKey = 'id', parentIdKey = 'pId' } = options || {};
  return array.some((item: TreeLikeArrayItem) => item[parentIdKey] === targetNode[idKey]);
}

function _normalizeObjectPath(path: string | string[]): string[] {
  if (path instanceof Array) return path;
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter((p) => p !== '');
}

function _normalizeTreePath(path: string | string[], pathSeparator: string, childrenKey: string): string[] {
  if (path instanceof Array) return path;
  const fullChildren = new RegExp(childrenKey, 'gi');
  return path
    .replace(fullChildren, '')
    .replace(/\[(\d+)]/g, '.$1')
    .split(pathSeparator)
    .filter((p) => p !== '');
}

/**
 * 按路径查找目标值
 * @param {object} tree
 * @param {string|string[]} path
 * @param {TreePathOptions} [options]
 * @returns {*}
 *
 * @example
 *   path = ''                 return treeRoot
 *   path = 'child1'           return treeRoot.children[title === 'child1']
 *   path = 'children[1]'      return treeRoot.children[1]
 *   path = 'child1.child11'   return treeRoot.children[title === 'child1'].children[title === 'child11']
 *   path = 'child1[0]'        return treeRoot.children[title === 'child1'].children[0]
 */
export function getTreeNodeByPath(tree: TreeNode, path: string, options: TreePathOptions = {}): unknown {
  const { pathSeparator = '.', fieldName = 'title', childrenKey = 'children' } = options || {};

  const pathNodes = _normalizeTreePath(path, pathSeparator, childrenKey);
  return pathNodes.reduce((branch, pathPart) => {
    if (!branch) return branch;
    const children = branch[childrenKey] || [];
    // eslint-disable-next-line no-restricted-globals
    const childIndex = isFinite(Number(pathPart))
      ? pathPart
      : children.findIndex((node: TreeNode) => node[fieldName] === pathPart);
    return children[childIndex];
  }, tree);
}

/**
 * 模拟 lodash.get, 但是没有默认值的参数
 * @param tree 树数据
 * @param path 路径
 */
export function getFromTree(tree: Tree, path: string | string[]): unknown {
  const pathArray = _normalizeObjectPath(path);
  return pathArray.reduce((node: TreeNode, pathPart: string | number) => {
    if (!node) return node;
    return node[pathPart];
  }, tree);
}

/**
 * 模拟 lodash.set
 * @param tree 树数据
 * @param path 路径
 * @param value 要设置的值
 */
export function setToTree(tree: Tree, path: string | string[], value: unknown): Tree {
  const pathArray = _normalizeObjectPath(path);
  pathArray.reduce((node: TreeNode, pathPart: string | number, index: number, arr: Tree) => {
    if (index + 1 === arr.length) {
      // eslint-disable-next-line no-param-reassign
      node[pathPart] = value;
      return;
    }
    // eslint-disable-next-line consistent-return
    if (node[pathPart]) return node[pathPart];
    // eslint-disable-next-line consistent-return,no-restricted-globals,no-return-assign
    return (node[pathPart] = isFinite(Number((arr as TreeNode[])[index + 1])) ? [] : {});
  }, cloneDeep(tree));
  return tree;
}

/**
 * 扁平化树结构
 * @param tree 树结构数据
 * @param keepChildrenField 是否保留 children 字段
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function flattenTree(tree: Tree, keepChildrenField = false, options?: TreeNodeFieldAlias): TreeNode[] {
  const treeDataClone = tree ? cloneDeep(tree) : null;
  const { childrenKey = 'children' } = options || {};
  const result: TreeNode[] = [];
  const deep = (data: TreeNode[]) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      result.push(node);
      if (node[childrenKey]) {
        deep(node[childrenKey]);
        if (!keepChildrenField) {
          delete node[childrenKey];
        }
      }
    }
  };
  if (tree instanceof Array) {
    deep(treeDataClone as TreeNode[]);
  } else if (treeDataClone) {
    deep([treeDataClone]);
  }
  return result;
}

/**
 * 遍历树数据的方法
 * @param tree 树数据
 * @param fn 遍历函数
 * @param queueMethod shift: 深度优先 | unshift: 广度优先
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
// eslint-disable-next-line consistent-return
function _traverse(
  tree: Tree,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  fn: (node: TreeNode, options?: TraverseOptions & TreePathOptions) => boolean | undefined | void,
  queueMethod: 'push' | 'unshift',
  options?: TraverseOptions & TreePathOptions,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
): Tree | TreeNode | TreeNode[] | boolean | void {
  const { some, every, returnBoolean, returnArray, childrenKey = 'children' } = options || {};
  const queue: TreeNode[] = tree instanceof Array ? [...tree] : [{ ...tree }];
  const results: Tree = [];
  let didBreak = false;
  let lastResult: boolean | undefined;
  while (queue.length) {
    const node = queue.shift();
    if (!node) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (node[childrenKey] && node[childrenKey].length) {
      // 广度优先还是深度优先
      queue[queueMethod](...node[childrenKey]);
    }
    if (some || every) {
      const result = fn(node, options);
      if (returnArray) {
        if (result) {
          results.push(node);
        }
      } else if ((every && !result) || (some && result)) {
        didBreak = true;
        lastResult = result || undefined;
        break;
      }
    } else if (fn(node, options) === false) {
      break;
    }
  }
  if (every) {
    if (returnBoolean) {
      return !didBreak;
    }
    if (returnArray) {
      return results;
    }
  } else if (some) {
    if (returnBoolean) {
      return Boolean(lastResult);
    }
    if (returnArray) {
      return results;
    }
  }
}

/**
 * 遍历树数据
 * @param tree 树数据
 * @param callbackFn 遍历函数
 * @param traverseType 遍历方式, 默认是广度优先
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function traverseTree(
  tree: Tree,
  callbackFn: (node: TreeNode) => void,
  traverseType: TraverseType | string = TraverseType.Breath,
  options?: TreePathOptions,
): void {
  _traverse(tree, callbackFn, traverseType === TraverseType.Depth ? 'unshift' : 'push', options);
}

/**
 * 遍历树数据, 如果有一个节点匹配, 则返回 true
 * @param tree 树数据
 * @param predicate 遍历函数
 * @param traverseType 遍历方式
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function someTree(
  tree: Tree,
  predicate: (node: TreeNode) => boolean,
  traverseType: TraverseType | string = TraverseType.Breath,
  options?: TreePathOptions,
): boolean {
  return _traverse(tree, predicate, traverseType === TraverseType.Depth ? 'unshift' : 'push', {
    ...options,
    some: true,
    returnBoolean: true,
  }) as boolean;
}

/**
 * 遍历树数据, 所有的节点都匹配, 则返回 true
 * @param tree 树数据
 * @param predicate 遍历函数
 * @param traverseType 遍历方式
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function everyTree(
  tree: Tree,
  predicate: (node: TreeNode) => boolean,
  traverseType: TraverseType | string = TraverseType.Breath,
  options?: TreePathOptions,
): boolean {
  return _traverse(tree, predicate, traverseType === TraverseType.Depth ? 'unshift' : 'push', {
    ...options,
    every: true,
    returnBoolean: true,
  }) as boolean;
}

/**
 * 查找树数据, 所有第一个匹配的节点
 * @param tree 树数据
 * @param predicate 遍历函数
 * @param traverseType 遍历方式 breath|depth, 默认 breath (广度优先)
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function findOneInTree(
  tree: Tree,
  predicate: (node: TreeNode) => boolean,
  traverseType: TraverseType | string = TraverseType.Breath,
  options?: TreePathOptions,
): TreeNode | null {
  return (
    (
      _traverse(tree, predicate, traverseType === TraverseType.Depth ? 'unshift' : 'push', {
        ...options,
        some: true,
        returnArray: true,
      }) as TreeNode[]
    )?.[0] ?? null
  );
}

/**
 * 查找树数据, 返回所有匹配的数据
 * @param tree 树数据
 * @param predicate 遍历函数
 * @param traverseType 遍历方式 breath|depth, 默认 breath (广度优先)
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function findAllInTree(
  tree: Tree,
  predicate: (node: TreeNode) => boolean,
  traverseType: TraverseType = TraverseType.Breath,
  options?: TreePathOptions,
): TreeNode[] {
  return (
    (_traverse(tree, predicate, traverseType === TraverseType.Depth ? 'unshift' : 'push', {
      ...options,
      every: true,
      returnArray: true,
    }) as TreeNode[]) ?? []
  );
}

/**
 * 查找父节点
 * @param tree 树结构数据
 * @param targetNode 目标节点
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function findParentTreeNode(tree: Tree, targetNode: TreeNode, options?: TreeNodeFieldAlias): TreeNode | null {
  const { idKey = 'id', parentIdKey = 'pId' } = options || {};
  if (targetNode[parentIdKey]) {
    return findOneInTree(
      tree,
      (node: TreeNode) => node[idKey] === targetNode[parentIdKey],
      TraverseType.Breath,
      options,
    );
  }
  return null;
}

/**
 * 获取目标节点所在兄弟节点中的索引
 * @param tree 树数据
 * @param targetNode 目标节点
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function findIndexInSiblingNode(tree: Tree, targetNode: TreeNode, options?: TreeNodeFieldAlias): number {
  const { idKey = 'id', childrenKey = 'children' } = options || {};
  const parentNode = findParentTreeNode(tree, targetNode, options);
  if (parentNode) {
    return parentNode ? parentNode[childrenKey].findIndex((node: TreeNode) => node[idKey] === targetNode[idKey]) : -1;
  }
  return 0;
}

/**
 * 遍历树类型数据, 并返回新的对象
 * @param tree 树数据
 * @param callbackFn 遍历函数
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function mapTree(tree: Tree, callbackFn: (node: TreeNode) => TreeNode, options?: TreeNodeFieldAlias): Tree {
  const { childrenKey = 'children' } = options || {};
  const treeClone = tree instanceof Array ? cloneDeep(tree) : [cloneDeep(tree)];
  return treeClone.map((item: TreeNode) => {
    if (item[childrenKey]) {
      item[childrenKey] = mapTree(item[childrenKey], callbackFn, options);
    }
    return callbackFn(item);
  });
}

/**
 * 遍历树类型数据
 * @param tree
 * @param compareFn
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function sortTree(
  tree: Tree,
  compareFn: (a: TreeNode, b: TreeNode) => number,
  options?: TreeNodeFieldAlias,
): Tree {
  const { childrenKey = 'children' } = options || {};
  let treeClone = tree instanceof Array ? cloneDeep(tree) : [cloneDeep(tree)];
  treeClone = treeClone.map((item: TreeNode) => {
    if (item[childrenKey]) {
      item[childrenKey] = sortTree(item[childrenKey], compareFn, options);
    }
    return item;
  });
  return treeClone.sort(compareFn);
}

/**
 * 替换树节点数据
 * @param tree 树类型数据
 * @param predicate 匹配的方法
 * @param replaceNode 要替换的值
 * @returns {[]}
 */
export function replaceTreeNode(
  tree: Tree,
  predicate: (node: TreeNode) => boolean,
  replaceNode: ((node: TreeNode) => TreeNode) | TreeNode,
): Tree {
  return mapTree(tree, (node) => {
    if (predicate(node)) {
      if (replaceNode instanceof Function) {
        return replaceNode(node);
      }
      return replaceNode;
    }
    return node;
  });
}

/**
 * 删除空的 children 节点
 * @param tree 树类型数据
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function removeEmptyChildrenTreeNode(tree: Tree, options?: TreeNodeFieldAlias): Tree {
  const { childrenKey = 'children' } = options || {};
  return mapTree(tree, (node) => {
    if (Array.isArray(node[childrenKey]) && node[childrenKey].length) {
      node[childrenKey] = removeEmptyChildrenTreeNode(node[childrenKey], options);
    } else if (node[childrenKey]) {
      delete node[childrenKey];
    }
    return node;
  });
}

/**
 * 统计所有节点的子节点的数量
 * @param tree 树类型数据
 * @param deep 是否统计所有子节点
 * @param statisticsKey 统计好的数字保存在哪个字段
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function statisticsTreeNodeChildren(
  tree: Tree,
  deep = false,
  statisticsKey = 'statistics',
  options?: TreeNodeFieldAlias,
): Tree {
  const { childrenKey = 'children' } = options || {};
  return mapTree(tree, (node) => {
    if (node[childrenKey] && node[childrenKey].length) {
      if (deep) {
        node[statisticsKey] = node[childrenKey].reduce(
          (prev: number, child: TreeNode) => prev + (child[statisticsKey] as number) || 0,
          0,
        );
        node[statisticsKey] += node[childrenKey].length;
      } else {
        node[statisticsKey] = node[childrenKey].length;
      }
    }
    return node;
  });
}

/**
 * 向上查找所有父节点
 * @param tree 树数据
 * @param predicate 查找的节点的方法
 * @param isContainerTarget 是否包含匹配的节点
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function closestParentItemInTree(
  tree: Tree,
  predicate: (node: TreeNode) => boolean,
  isContainerTarget = false,
  options?: TreeNodeFieldAlias,
): TreeNode[] {
  const { childrenKey = 'children' } = options || {};
  const result: TreeNode[] = [];
  const traverseFn: (node: TreeNode) => boolean = (node) => {
    let hasExist = false;
    if (node[childrenKey] && node[childrenKey].length) {
      hasExist = node[childrenKey].filter((childrenNode: TreeNode) => traverseFn(childrenNode)).length > 0;
    }
    if (hasExist) {
      result.unshift(node);
      return true;
    }
    const matchResult = predicate(node);
    if (matchResult && isContainerTarget) {
      result.unshift(node);
    }
    return matchResult;
  };
  if (tree instanceof Array) {
    tree.forEach((item) => traverseFn(item));
  } else {
    traverseFn(tree);
  }
  return result;
}

/**
 * 过滤树类型数据, 保留匹配节点的父级
 * @param tree 树数据
 * @param predicate 匹配的方法
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 * @returns {*}
 */
export function filterTree(tree: Tree, predicate: (node: TreeNode) => boolean, options?: TreeNodeFieldAlias): Tree {
  const { childrenKey = 'children' } = options || {};
  return cloneDeep(tree).filter((child: TreeNode) => {
    if (child[childrenKey]) {
      child[childrenKey] = filterTree(child[childrenKey], predicate, options);
      // 如果子节点有匹配的结果, 就直接返回父节点
      if (child[childrenKey] && child[childrenKey].length) {
        return child;
      }
    }
    return predicate(child);
  });
}

/**
 * 为没有父节点的树数据添加父节点
 * @param tree
 * @param options 别名配置, 默认值为 { idKey: 'id', parentIdKey: 'pId', childrenKey: 'children' }
 */
export function completionTreeNodePid(tree: Tree, options?: TreeNodeFieldAlias): Tree {
  const { idKey = 'id', parentIdKey = 'pId', childrenKey = 'children' } = options || {};
  const treeDataClone = cloneDeep(tree) as TreeNode[];
  for (let i = 0; i < treeDataClone.length; i += 1) {
    treeDataClone[i][childrenKey] = completionTreeNodePid(
      treeDataClone[i][childrenKey] &&
        treeDataClone[i][childrenKey].length &&
        treeDataClone[i][childrenKey].map((item: TreeNode) => ({
          ...item,
          [parentIdKey]: item[parentIdKey] || treeDataClone[i][idKey],
        })),
    );
  }
  return treeDataClone;
}

/**
 * 获取目标节点的右侧节点
 * @param tree 树数据
 * @param targetNode 目标节点
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function getRightNode(tree: Tree, targetNode: TreeNode, options?: TreeNodeFieldAlias): TreeNode | null {
  const { idKey = 'id', childrenKey = 'children' } = options || {};
  const parentNode = findParentTreeNode(tree, targetNode, options);
  if (parentNode) {
    const targetIndex: number = parentNode
      ? parentNode[childrenKey].findIndex((node: TreeNode) => node[idKey] === targetNode[idKey])
      : -1;
    return parentNode[childrenKey].slice(targetIndex + 1, targetIndex + 2)?.[0];
  }
  return null;
}

/**
 * 获取目标节点的所有右侧节点
 * @param tree 树数据
 * @param targetNode 目标节点
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function getAllRightNode(tree: Tree, targetNode: TreeNode, options?: TreeNodeFieldAlias): TreeNode[] {
  const { idKey = 'id', childrenKey = 'children' } = options || {};
  const parentNode = findParentTreeNode(tree, targetNode, options);
  if (parentNode) {
    const targetIndex: number = parentNode
      ? parentNode[childrenKey].findIndex((node: TreeNode) => node[idKey] === targetNode[idKey])
      : -1;
    return parentNode[childrenKey].slice(targetIndex + 1);
  }
  return [];
}

/**
 * 获取目标节点的左侧节点
 * @param tree 树数据
 * @param targetNode 目标节点
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function getLeftNode(tree: Tree, targetNode: TreeNode, options?: TreeNodeFieldAlias): TreeNode | null {
  const { idKey = 'id', childrenKey = 'children' } = options || {};
  const parentNode = findParentTreeNode(tree, targetNode, options);
  if (parentNode) {
    const targetIndex = parentNode
      ? parentNode[childrenKey].findIndex((node: TreeNode) => node[idKey] === targetNode[idKey])
      : -1;
    return parentNode[childrenKey].slice(targetIndex - 1, targetIndex - 2)?.[0];
  }
  return null;
}

/**
 * 获取目标节点的所有左侧节点
 * @param tree 树数据
 * @param targetNode 目标节点
 * @param options 别名配置, 默认值为 { idKey: 'id', childrenKey: 'children' }
 */
export function getAllLeftNode(tree: Tree, targetNode: TreeNode, options?: TreeNodeFieldAlias): TreeNode[] {
  const { idKey = 'id', childrenKey = 'children' } = options || {};
  const parentNode = findParentTreeNode(tree, targetNode, options);
  if (parentNode && parentNode[childrenKey] instanceof Array) {
    const targetIndex = parentNode
      ? parentNode[childrenKey].findIndex((node: TreeNode) => node[idKey] === targetNode[idKey])
      : -1;
    return parentNode[childrenKey].slice(0, targetIndex);
  }
  return [];
}

/**
 * 删除空的 children 节点
 *
 * @export
 * @param tree 树类型数据
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function removeEmptyChildren(tree: Tree = [], options?: TreeNodeFieldAlias): Tree {
  const { childrenKey = 'children' } = options || {};
  return Array.isArray(tree)
    ? cloneDeep(tree).map((item) => {
        const result = { ...item };
        const { children } = result;
        if (Array.isArray(children) && children.length) {
          result[childrenKey] = removeEmptyChildren(children, options);
        } else {
          delete result[childrenKey];
        }
        return result;
      })
    : [];
}

/**
 * 获取树的深度
 * @param tree 树类型数据
 * @param options 别名配置, 默认值为 { childrenKey: 'children' }
 */
export function getTreeDepth(tree: Tree, options?: TreeNodeFieldAlias): number {
  const { childrenKey = 'children' } = options || {};
  let deep = 0;
  const fn = (data: any[], index: number) => {
    data.forEach((elem) => {
      if (index > deep) {
        deep = index;
      }
      if (elem[childrenKey]?.length > 0) {
        fn(elem[childrenKey], deep + 1);
      }
    });
  };
  if (tree instanceof Array) {
    fn(tree, 1);
  } else {
    fn([tree], 0);
  }
  return deep;
}

/**
 * 父节点影响子节点
 */
export function effectSubNode(
  tree: Tree = [],
  fieldName: string,
  fieldValue: any,
  effectObj = {},
  options?: TreeNodeFieldAlias,
): Tree {
  const { childrenKey = 'children' } = options || {};
  return cloneDeep(tree).map((item: Record<string, any>) => {
    let result = { ...item };
    const children = result[childrenKey];
    if (item[fieldName] === fieldValue) {
      result = { ...result, ...effectObj };
      if (Array.isArray(children) && children.length) {
        result[childrenKey] = mapTree(children, (data) => ({ ...data, ...effectObj }));
      }
    } else if (Array.isArray(children) && children.length) {
      result[childrenKey] = effectSubNode(children, fieldName, fieldValue, effectObj, options);
    }
    return result;
  });
}

/**
 * 子节点影响父节点
 */
export function effectParentNode(
  tree: Tree = [],
  fieldName: string,
  fieldValue: any,
  effectObj: Record<string, any>,
  options?: TreeNodeFieldAlias,
): Tree {
  const parentPathArray = closestParentItemInTree(tree, (item) => item[fieldName] === fieldValue, true, options);
  const { idKey = 'id' } = options || {};
  let result = cloneDeep(tree);
  parentPathArray.forEach((item) => {
    result = replaceTreeNode(
      result,
      (node) => node[idKey] === item[idKey],
      (node) => ({ ...node, ...effectObj }),
    );
  });
  return result;
}

/**
 * 对比扁平数组
 * @param {array} newValue 新值，默认值[]
 * @param {array} oldValue 旧值，默认值[]
 * @returns {object} 返回结果，格式: {adds:[], dels:[]}
 */
export function diffFlatArray(newValue = [], oldValue = []) {
  if (!newValue.length) {
    return {
      adds: [],
      dels: oldValue,
    };
  }
  const tNew = difference(newValue, oldValue); // 新增
  return {
    adds: tNew,
    dels: difference(oldValue, difference(newValue, tNew)), // 删除
  };
}

// 清空对象的value
export function initObjValue(obj) {
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] && Array.isArray(obj[key].slice())) {
      result[key] = [];
    } else {
      result[key] = '';
    }
    return result;
  }, {});
}

/**
 * 对象数组中按指定键值深度查找
 * @param {array} data 数据源，格式：[{xxx:1,yyy:2,zzz:[{xxx:1,yyy:2,zzz:[{...}]}]}]
 * @param {object}  {key:"",value:[] } 指定的key和value
 * @param {object} seed 遍历因子
 * @returns {object} 找到的对象，没找到返回{}
 */
export function findDeepByKey(data, { key, value }, seed) {
  const result: any = [];

  function tFindDeepByKey(dataT: string | any[], checkKey: string | number) {
    for (let i = 0; i < dataT.length; i++) {
      const item = dataT[i];
      const tValue = item[key];
      const tData = item[seed];

      if (tValue === checkKey || (typeof tValue === 'object' && tValue[checkKey])) {
        result.push(item);

        // eslint-disable-next-line no-continue
        continue;
      }
      if (!isEmpty(tData)) {
        tFindDeepByKey(tData, checkKey);
      }
    }
  }
  value.forEach((val) => {
    tFindDeepByKey(data, val);
  });

  return result;
}

/**
 * 查找叶子结点
 * @param {array} arr 数据源，格式：[{xxx:1,yyy:2,zzz:[{xxx:1,yyy:2,zzz:[{...}]}]}]
 * @param {object} seed 遍历因子, 默认值：'data'
 * @returns {array} 叶子结点数组，格式:[{}]
 */
export function findLeafForMap(arr = [], seed = 'data') {
  // 选择对象片段
  const tArr = [];
  (function tFindData(array) {
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      if (Object.prototype.hasOwnProperty.call(item, seed)) {
        tFindData(item[seed]);
      } else {
        tArr.push(item);
      }
    }
  })(arr);
  return tArr;
}

/**
 * 从集合中获取指定的key的值，返回数组
 * @param {*} data 数据
 * @param {string} [key='id'] 指定key
 * @returns {array} 返回指定key的value集合 [xx,xxx]
 */
export function getValuesForMap(data: string[] = [], key = 'id'): any[] {
  if (isEmpty(data) || data === null) {
    return [];
  }
  return data.map((item) => {
    return item[key];
  });
}

/**
 * tree组件data组装
 * @param {array} arr 数据源，格式：[{xxx:1,yyy:2,zzz:[{xxx:1,yyy:2,zzz:[{...}]}]}]
 * @param {object} [keysMap={ id: 'key', name: 'label', data: 'children' }] 键值映射表，{原key: 目标key}
 * @param {object} [options={key:"",value:"", props:{}}] 操作项，扩展操作，用于筛选符合条件的子树
 * @returns 组装后的数组，格式:[{}], key由keysMap映射
 */
export function assembleData(
  arr = [],
  keysMap = { id: 'key', name: 'label', data: 'children' },
  options = { key: '', value: '', props: {}, seed: 'data' },
) {
  const tMapKeys = Object.keys(keysMap);
  const { key: optKey, value: optValue, props, seed } = options;
  // 是否扩展的开关
  let flag = false;
  // 选择对象片段
  const tArr: any = [];
  return (function tAssembleData(array: any) {
    if (array === null) {
      return [];
    }

    return array.map((item) => {
      if (optKey && optValue) {
        if (item[optKey] === optValue) {
          flag = true;
        }
      }

      // 获取满足options中key和value相等的子树
      if (item[optKey] === optValue) {
        (function tMapResult(result: any) {
          return result.map((it: any) => {
            tArr.push(it[optKey]);
            const data = it[seed];
            if (data && data.length) {
              return tMapResult(data);
            }
            return it[optKey];
          }, []);
        })([item]);
      }

      // 根据keysMap条件组合数据
      const tResult = tMapKeys.reduce((result, key) => {
        const res = { ...result };
        const tData: any = item[key];

        if (key === seed && tData !== null && typeof tData === 'object' && Array.isArray(tData) && tData.length > 0) {
          res[keysMap[key]] = tAssembleData(tData);
        } else {
          res[keysMap[key]] = item[key];
        }

        return res;
      }, {});

      // 对符合条件的树合并options中的props
      flag && tArr.includes(item[optKey]) && Object.assign(tResult, props);

      return tResult;
    });
  })(arr);
}

/**
 * 给arr对象集合绑定key，值为子项中对应的seed的key
 * @param {array} data 数据源，格式：[{xxx:1,yyy:2}]
 * @param {object} [keysMap={ value: 'key' }] 键值映射表，{原key: 目标key}
 * @returns 组装后的数组，格式:[{}]
 */
export function bindKeyForData(data: any[], keysMap: object = { value: 'key' }) {
  if (data !== null && typeof data === 'object' && Array.isArray(data) && data.length > 0) {
    const tKey = Object.keys(keysMap)[0];

    data.forEach((item) => {
      item[keysMap[tKey]] = item[tKey];
    });

    return data;
  }
  return [];
}

/**
 * 扁平对象key映射
 * @param {string} [prefix=''] 前缀
 * @param {*} [mapKeys=[]] 要映射的keys  ['id', 'name', 'code', 'pid']
 * @param {*} flatObj 操作对象
 * @returns 映射对象
 */
export function flatObjectMap(prefix = '', mapKeys: string[] = [], flatObj = {}) {
  if (mapKeys.length === 0) {
    return;
  }
  let tKeys = Object.keys(flatObj);
  if (tKeys.length === 0) {
    tKeys = mapKeys;
  }
  return tKeys.map((key: string) => {
    if (mapKeys.includes(key)) {
      return {
        [key]: `${prefix}${upperFirst(key)}`,
      };
    } else {
      return { [key]: key };
    }
  });
}

export function flatDataToArr(data = [], seed = 'data') {
  if (isEmpty(data)) {
    return [];
  }
  const result = [];
  (function tFlatData(dataT) {
    dataT.forEach((item) => {
      const tArr = item[seed];
      result.push(item);
      if (tArr !== null && !isEmpty(tArr)) {
        tFlatData(tArr);
      }
    });
  })(data);
  return result;
}

// 无限级分类格式化数据，供筛选逻辑使用, 格式：{根id：[{子id:text}]，父id:[{子id:text}], 叶子id:{叶子id:text}}
export function flatDataToObj(data, key = 'id', seed = 'data') {
  const results = {};
  const mROOT = '0';

  (function tFlatData(dataT) {
    const r: any = [];

    dataT.forEach((item) => {
      r.push(item);
      results[item[key]] = item;
      const tArr = item[seed];
      if (tArr && tArr.length) {
        tFlatData(tArr);
      } else {
        return r;
      }
    });

    if (dataT[key]) {
      results[dataT[key]] = r;
    } else {
      results[mROOT] = r;
    }
  })(data);

  return results;
}

/**
 * 重命名扁平对象
 * @param {*} flatObj 操作对象
 * @param {string} [prefix=''] 前缀
 * @param {*} [renameKeys=[]] 要重命名的keys  ['id', 'name', 'code', 'pid']
 * @returns 重命名后的对象
 */
export function renameFlatObject(flatObj: any, prefix = '', renameKeys: any = []) {
  if (renameKeys.length === 0) {
    return;
  }
  const tKeys: string[] = Object.keys(flatObj);
  return tKeys.map((key) => {
    if (renameKeys.includes(key)) {
      return {
        [`${prefix}${upperFirst(key)}`]: flatObj[key],
      };
    } else {
      return { [key]: flatObj[key] };
    }
  });
}

/**
 * @description 通过id获取其遗传基因链，顺序：[...,父id,当前id]
 * @param {*} data 源数据
 * @param {*} id id
 * @param {*} reverse 是否反序
 * @returns {array}
 */
export function getGenes(data: any, id: any, reverse = false) {
  const genes: number[] = [];
  const mROOT = '0';

  if (!isEmpty(data)) {
    (function tGetGenes(dataT, idT) {
      each(dataT, (value: any, key: any) => {
        if (idT === key) {
          genes.push(Number(idT));

          if (idT !== mROOT) {
            tGetGenes(dataT, value);
          }
        }
      });
    })(data, id);
  }

  if (reverse) {
    return genes;
  } else {
    return genes.reverse();
  }
}

/**
 * json字符串识别和转换
 * @param {string} jsonStr 对象字符串
 * @param {string | undefined} errMessage 错误信息
 * @param {function | undefined} errCb 错误提示回调
 * @returns {any} 正常转换返回{}，不符合对象字符串的返回null
 */
export function jsonParse(jsonStr: string = '', errMessage: string | undefined = '', errCb?: Function): any {
  if (!jsonStr) {
    return null;
  }

  if (typeof jsonStr === 'string') {
    try {
      if (jsonStr.indexOf('{') === -1 && jsonStr.lastIndexOf('}') === -1) {
        return null;
      } else if (errMessage && (jsonStr.indexOf('{') === -1 || jsonStr.lastIndexOf('}') === -1)) {
        throw Error(errMessage);
      }

      const obj = JSON.parse(jsonStr);

      if (isObject(obj) && Object.keys(obj).length) {
        return obj;
      }

      throw Error(errMessage);
    } catch (e) {
      // console.log(e);
      errCb && errMessage && errCb(e, errMessage);

      return null;
    }
  }

  return jsonStr;
}

/**
 * 以 old 对象中的 key 判断 target 中对应的值是否相等
 */
export function simpleEquals(target: any, old: any) {
  if (!target && !old) {
    return true;
  } else if (!target || !old) {
    return false;
  }
  let isEquals = true;
  Object.keys(old).forEach(key => {
    if (String(old[key] || '') !== String(target[key] || '')) {
      isEquals = false;
      return false;
    }
    return true;
  });
  return isEquals;
}

/**
 * 将对象 KEY 去除开头的下划线
 * @param params 对象
 * @returns 去除 KEY 开头的下划线的对象
 */
export function trimUnderline(params: object) {
  return trimPrefix(params, '_');
}

/**
 * 将对象 KEY 去除开头的 prefix 前缀
 * @param params 对象
 * @param prefix 前缀
 * @returns 去除 KEY 开头的 prefix 的对象
 */
 export function trimPrefix(params: object, prefix: string) {
  let result = {};
  Object.entries(params).forEach(item => {
    if (item[0].startsWith(prefix)) {
      result[item[0].replace(prefix, '')] = item[1];
    } else {
      result[item[0]] = item[1];
    }
  });
  return result;
}