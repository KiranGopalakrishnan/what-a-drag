import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FixedSizeList as List, areEqual } from 'react-window';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DraggableItem } from './components/DraggableItem';
import {
    moveItemOnTree,
    isParentExpanded,
    isChildItem,
    getSourcePosition,
    getDestinationPosition,
    hasChildren,
    getParentId,
    buildCustomDestinationPosition,
} from './utils/Utils';
import { Tree, ItemId, TreeData } from './types/types';

interface State {
    currentlyDragging: string;
    currentlyDraggingOver: string;
    tree: Tree;
}

interface Props {
    renderItem: Function;
    tree?: TreeData;
    onDragEnd: Function;
    onDragStart: Function;
    renderPlaceholder: Function;
    onCollapse: Function;
    onExpand: Function;
    width: number | string;
    height: number;
    itemHeight: number;
    onItemsRendered: Function;
    listRef: any;
    minimalFlatTree?: ItemId[];
    renderLoading: Function;
    itemCount: number;
    totalCount: number;
}

class DraggableList extends React.Component<Props, State> {
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
        height: 400,
        width: '100%',
        itemHeight: 32,
        renderLoading: () => <div>Loading...</div>,
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
        event.preventDefault();
        event.stopPropagation();

        const { currentlyDragging, tree } = this.state;
        const { onDragEnd } = this.props;
        const source = getSourcePosition(tree, currentlyDragging);

        const parentId = getParentId(tree, currentlyDragging);
        const isComingFromGroup = !(hasChildren(tree, parentId) && parentId !== tree.rootId && parentId === id);
        //If the item is a group item move the dropped items inside the group and into the first position
        const destination =
            hasChildren(tree, id) && isComingFromGroup
                ? buildCustomDestinationPosition(id, 0)
                : getDestinationPosition(tree, id);
        moveItemOnTree(tree, source, destination);
        const newTree = moveItemOnTree(tree, currentlyDragging, id);
        onDragEnd(source, destination);
        this.setState({ currentlyDragging: null, currentlyDraggingOver: null, tree: newTree });
    };

    onDragStart = id => {
        const { onDragStart } = this.props;
        //just so that the state is set a millisecond after since settimeout sends the setstate through the js event loop
        setTimeout(() => {
            this.setState({ currentlyDragging: id });
        }, 0);
        onDragStart(id);
    };

    onDragOver = (id, event) => {
        event.preventDefault();
        const { currentlyDraggingOver } = this.state;
        if (currentlyDraggingOver !== id) this.setState({ currentlyDraggingOver: id });
    };

    onDragEnd = event => {
        const { onDragEnd } = this.props;
        event.preventDefault();
        this.setState({ currentlyDragging: null, currentlyDraggingOver: null });
        onDragEnd(null, null);
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
        this.props.onExpand(itemId);
        return copyOfTree;
    };

    row = props => {
        const { index, style } = props;
        const { tree, currentlyDragging, currentlyDraggingOver } = this.state;
        const { renderItem, renderPlaceholder, minimalFlatTree, renderLoading } = this.props;
        const { onCollapse, onExpand } = this;

        if (index > minimalFlatTree.length - 1) {
            return <div style={style}>{renderLoading()}</div>;
        }

        const itemId = minimalFlatTree[index];
        if (!itemId) return null;
        const isVisible = isParentExpanded(tree, itemId);
        const item = tree['items'][itemId];
        if (!item) {
            return <div style={style}>{renderLoading()}</div>;
        }

        const isChild = isChildItem(tree, itemId);
        return (
            <DraggableItem
                style={style}
                currentlyDragging={currentlyDragging}
                currentlyDraggingOver={currentlyDraggingOver}
                item={item}
                isChild={isChild}
                isVisible={isVisible}
                renderItem={renderItem}
                renderPlaceholder={renderPlaceholder}
                onCollapse={onCollapse}
                onExpand={onExpand}
                onDragStart={this.onDragStart}
                onDragOver={this.onDragOver}
                onDrop={this.onDrop}
                onDragEnd={this.onDragEnd}
            />
        );
    };

    render() {
        const { tree, currentlyDragging, currentlyDraggingOver } = this.state;
        const { height, itemHeight, width, onItemsRendered, listRef, minimalFlatTree, itemCount } = this.props;
        const currentTreeLength = minimalFlatTree.length;
        const listLength = currentTreeLength < itemCount - 1 ? currentTreeLength + 3 : currentTreeLength;
        return (
            <List
                ref={listRef}
                tree={tree}
                currentlyDragging={currentlyDragging}
                currentlyDraggingOver={currentlyDraggingOver}
                height={height}
                itemCount={listLength}
                itemSize={itemHeight}
                width={width}
                onItemsRendered={onItemsRendered}
            >
                {this.row}
            </List>
        );
    }
}
export { moveItemOnTree, DraggableList };
