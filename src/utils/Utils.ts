import { TreeData, ItemId, TreeItem, TreeSourcePosition, TreeDestinationPosition } from '../types/types';

/*
  Changes the tree data structure with minimal reference changes.
 */
export const mutateTree = (tree: TreeData, itemId: ItemId, mutation: any): TreeData => {
    const itemToChange = tree.items[itemId];
    if (!itemToChange) {
        // Item not found
        return tree;
    }
    // Returning a clone of the tree structure and overwriting the field coming in mutation
    return {
        // rootId should not change
        rootId: tree.rootId,
        items: {
            // copy all old items
            ...tree.items,
            // overwriting only the item being changed
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
    return tree.items[itemId].hasChildren;
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
