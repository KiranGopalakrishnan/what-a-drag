import * as React from 'react';

import {
    moveItemOnTree,
    isParentExpanded,
    isChildItem,
    getSourcePosition,
    getDestinationPosition,
} from './utils/Utils';

interface DraggableItemProps {
    key: string;
    draggable: boolean;
    isVisible: boolean;
    onDragOver: React.DragEvent<HTMLDivElement>;
    onDrop: React.DragEvent<HTMLDivElement>;
    onDragStart: React.DragEvent<HTMLDivElement>;
}

type ChildItem = string;

type ItemId = string;

interface TreeItem {
    id: string;
    isExpanded: boolean;
    hasChildren: boolean;
    data: {
        id: string;
        [key: string]: any;
    };
    children: ChildItem[];
}

interface Tree {
    rootId: string;
    items: { [key: string]: TreeItem };
}

interface State {
    currentlyDragging: string;
    currentlyDraggingOver: string;
    tree: Tree;
}

interface Props {
    renderItem: Function;
    tree: TreeItem[];
    onDragEnd: Function;
    renderPlaceholder: Function;
    onCollapse: Function;
}

//Extract id's for root items and their children while keeping the order
const flattenToMinimalTree = (tree: Tree) => {
    const flatTreeWithNullValues = tree.items[tree.rootId].children.map((item: ChildItem) => {
        const childrenArray = tree['items'][item].hasChildren ? tree.items[item].children : null;
        return [item].concat(childrenArray);
    });

    return [].concat.apply([], flatTreeWithNullValues).filter(Boolean);
};

export class Draggable extends React.Component<Props, State> {
    state: State;
    constructor(props) {
        super(props);
        this.state = {
            currentlyDragging: null,
            currentlyDraggingOver: null,
            tree: props.tree,
        };
    }

    public static defaultProps = {
        renderItem: (): void => {},
        tree: {},
    };

    static getDerivedStateFromProps(props: Props, state: State) {
        const { tree } = props;
        const { currentlyDragging, currentlyDraggingOver } = state;
        return {
            tree,
            currentlyDragging,
            currentlyDraggingOver,
        };
    }

    onDrop = (id, event) => {
        const { currentlyDragging, tree } = this.state;
        const { onDragEnd } = this.props;
        const source = getSourcePosition(tree, currentlyDragging);
        const destination = getDestinationPosition(tree, id);
        moveItemOnTree(tree, currentlyDragging, id);
        const newTree = moveItemOnTree(tree, currentlyDragging, id);
        onDragEnd(source, destination);
        this.setState({ currentlyDragging: null, currentlyDraggingOver: null, tree: newTree });
    };

    onDrag = (id, event) => {
        //just so that the state is set a millisecond after since settimeout sends the setstate through the js event loop
        setTimeout(() => {
            this.setState({ currentlyDragging: id });
        }, 0);
    };

    onDragOver = (id, event) => {
        event.preventDefault();
        const { currentlyDraggingOver } = this.state;
        if (currentlyDraggingOver !== id) this.setState({ currentlyDraggingOver: id });
    };

    onCollapse = itemId => {
        const { tree } = this.state;
        let copyOfTree = (Object as any).assign({}, tree);
        copyOfTree.items[itemId].isExpanded = false;
        this.props.onCollapse(itemId);
        return copyOfTree;
    };

    onExpand = itemId => {
        const { tree } = this.state;
        let copyOfTree = (Object as any).assign({}, tree);
        copyOfTree.items[itemId].isExpanded = true;
        return copyOfTree;
    };

    render() {
        const { tree, currentlyDragging, currentlyDraggingOver } = this.state;
        const { renderItem, renderPlaceholder } = this.props;
        const { onCollapse, onExpand } = this;

        const minimalFlatTree = flattenToMinimalTree(tree);

        return (
            <div>
                {minimalFlatTree.map((itemId: ItemId) => {
                    const item = tree['items'][itemId];
                    const isDragging = currentlyDragging === itemId;
                    const isDraggingOver = currentlyDraggingOver === itemId;
                    const isVisible = isParentExpanded(tree, itemId);
                    const isChild = isChildItem(tree, itemId);
                    return (
                        <div
                            key={item.id}
                            draggable
                            onDragOver={event => this.onDragOver(item.id, event)}
                            onDrop={event => this.onDrop(item.id, event)}
                            onDragStart={event => this.onDrag(item.id, event)}
                            style={{
                                position: 'relative',
                                display: isVisible ? 'block' : 'none',
                                marginLeft: isChild ? '35px' : '0',
                            }}
                        >
                            {renderItem({ item, onCollapse, onExpand })}
                            {isDraggingOver ? renderPlaceholder({ item, isDraggingOver, isDragging }) : null}
                        </div>
                    );
                })}
            </div>
        );
    }
}
export { moveItemOnTree };
