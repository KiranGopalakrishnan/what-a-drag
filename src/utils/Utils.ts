import { TreeData, ItemId, TreeItem, ChildItem, TreeSourcePosition, TreeDestinationPosition } from '../types/types';

/*
  Changes the tree data structure with minimal reference changes.
 */
export const mutateTree = (tree: TreeData, itemId: ItemId, mutation: any): TreeData => {
    const itemToChange = tree.items[itemId];
    if (!itemToChange) {
        return tree;
    }
    return {
        rootId: tree.rootId,
        items: {
            ...tree.items,
            [itemId]: {
                ...itemToChange,
                ...mutation,
            },
        },
    };
};

const removeItemFromTree = (
    tree: TreeData,
    position: TreeSourcePosition,
): { tree: TreeData; itemRemoved: TreeItem } => {
    const sourceParent: TreeItem = tree.items[position.parentId];
    const newSourceChildren: any = sourceParent.children.slice(0);
    const itemRemoved: TreeItem = newSourceChildren.splice(position.index, 1)[0];
    const newTree = mutateTree(tree, position.parentId, {
        children: newSourceChildren,
        hasChildren: newSourceChildren.length > 0,
        isExpanded: newSourceChildren.length > 0 && sourceParent.isExpanded,
    });
    return {
        tree: newTree,
        itemRemoved,
    };
};

const addItemToTree = (tree: TreeData, position: TreeDestinationPosition, item: any): TreeData => {
    const destinationParent: TreeItem = tree.items[position.parentId];
    const newDestinationChildren = destinationParent.children.slice(0);
    newDestinationChildren.splice(position.index, 0, item);
    return mutateTree(tree, position.parentId, {
        children: newDestinationChildren,
        hasChildren: true,
    });
};

export const getItemById = (tree: TreeData, itemId: ItemId) => {
    return tree.items[itemId] || undefined;
};

export const getParentId = (tree, itemId) => {
    const items = tree.items;
    const parentItem = Object.keys(items).filter((key: string) => {
        return (items[key].children || []).includes(itemId);
    });
    return parentItem[0] || '';
};

export const isParentExpanded = (tree, itemId) => {
    const parentId = getParentId(tree, itemId);
    return tree.items[parentId].isExpanded || false;
};

export const getIndexOfItem = (tree, parentId, itemId) => {
    return tree.items[parentId].children.findIndex(childItem => childItem === itemId);
};

export const isSelected = (tree: TreeData, itemId: ItemId) => {
    getItemById(tree, itemId).isSelected || undefined;
};

export const isChildItem = (tree, itemId) => {
    return getParentId(tree, itemId) !== tree.rootId;
};

export const getSourcePosition = (tree, itemId) => {
    const parentId = getParentId(tree, itemId);
    const index = getIndexOfItem(tree, parentId, itemId);
    return {
        parentId,
        index,
    };
};

//TODO: Refactor to support nested groups
export const hasChildren = (tree: TreeData, itemId: ItemId) => {
    return tree.items[itemId].hasChildren||null;
};

export const getDestinationPosition = (tree, destinationId) => {
    const parentId = getParentId(tree, destinationId);
    const index = getIndexOfItem(tree, parentId, destinationId);
    return {
        parentId,
        index,
    };
};

export const buildCustomDestinationPosition = (parentId: ItemId, index: number) => {
    return {
        parentId,
        index,
    };
};

export const moveItemOnTree = (tree: TreeData, from, to) => {
    const source = from.parentId ? from : getSourcePosition(tree, from);
    const destination = to.parentId ? to : getDestinationPosition(tree, to);
    const { tree: treeWithoutSource, itemRemoved } = removeItemFromTree(tree, source);
    return addItemToTree(treeWithoutSource, destination, itemRemoved);
};

export const isFalseItem = id => id.startsWith('FALSEITEM_');

//Extract id's for root items and expanded child items while keeping the order
export const flattenToMinimalTree = (tree: TreeData) => {
    const flatTreeWithNullValues = tree.items[tree.rootId].children.map((item: ChildItem) => {
        const childrenArray =
            tree['items'][item].hasChildren && tree['items'][item].isExpanded ? tree.items[item].children : null;
        return [item].concat(childrenArray);
    });

    return [].concat.apply([], flatTreeWithNullValues).filter(Boolean);
};

export const stripOutFalseIdChars = (id: ItemId) => id.replace('FALSEITEM_', '');

export const addFalseChildren = (tree: TreeData, flattenedTree: ItemId[]) => {
    const arrayOfArrays = flattenedTree.map(itemId => {
        const item = getItemById(tree, itemId);
        return hasChildren(tree, itemId) && item.children.length === 0 && item.isExpanded
            ? [itemId, `FALSEITEM_${itemId}`]
            : itemId;
    });
    return [].concat.apply([], arrayOfArrays);
};
