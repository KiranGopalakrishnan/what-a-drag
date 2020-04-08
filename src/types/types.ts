export type ChildItem = string;

export type ItemId = string;

export interface TreeItemData {
    id: string;
    [key: string]: any;
}

export interface TreeItem {
    id: string;
    isExpanded: boolean;
    hasChildren: boolean;
    data: TreeItemData;
    children: ChildItem[];
}

export interface TreeData {
    rootId: string;
    items: { [key: string]: TreeItem };
}

export interface TreeSourcePosition {
    parentId: ItemId;
    index: number;
}

export interface TreeDestinationPosition {
    parentId: ItemId;
    index?: number;
}

export interface Tree {
    rootId: string;
    items: { [key: string]: TreeItem };
}
