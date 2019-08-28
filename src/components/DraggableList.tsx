import * as React from 'react';
import * as ReactDOM from 'react-dom';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FixedSizeList as List, areEqual } from 'react-window';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DraggableItem } from './DraggableItem';
import {
    moveItemOnTree,
    isParentExpanded,
    isChildItem,
    getSourcePosition,
    getDestinationPosition,
    flattenToMinimalTree,
    addFalseChildren,
    isFalseItem,
    buildCustomDestinationPosition,
    hasChildren,
    getParentId,
    stripOutFalseIdChars,
    preserveOrderFromtree,
} from '../utils';

import { TreeData, ItemId } from '../types/types';

interface State {
    currentlyDragging: ItemId[];
    currentlyDraggingOver: ItemId;
    tree: TreeData;
    snapshot: HTMLDivElement;
    minimalTree: ItemId[];
}

interface Props {
    tree: TreeData;
    onDragEnd: Function;
    renderItem: Function;
    renderPlaceholder: Function;
    renderSnapshot: Function;
    beforeDrop: Function;
    onCollapse: Function;
    onExpand: Function;
    width: number | string;
    height: number;
    itemHeight: number;
    selectedItems: ItemId[];
}

class DraggableList extends React.Component<Props, State> {
    state: State;
    nodeRefs = new Map();
    constructor(props) {
        super(props);
        const { tree } = this.props;
        this.state = {
            currentlyDragging: [],
            currentlyDraggingOver: null,
            tree: props.tree,
            snapshot: null,
            minimalTree: flattenToMinimalTree(tree),
        };
    }

    public static defaultProps = {
        renderItem: (): void => {},
        tree: {},
        height: 400,
        width: '100%',
        itemHeight: 32,
        beforeDrop: () => true,
        renderSnapshot: ({ snapshot }) => snapshot,
    };

    static getDerivedStateFromProps(props: Props, state: State) {
        const { tree } = props;
        const minimalTree = flattenToMinimalTree(tree);
        const { currentlyDragging, currentlyDraggingOver, snapshot } = state;
        return {
            tree,
            currentlyDragging,
            currentlyDraggingOver,
            snapshot,
            minimalTree,
        };
    }

    setRef = (id, element) => {
        this.nodeRefs.set(id, element);
    };

    onDrop = (id, event) => {
        event.preventDefault();

        const { currentlyDragging, tree, snapshot } = this.state;
        const { onDragEnd, beforeDrop } = this.props;

        const isValidDrop = beforeDrop({
            items: currentlyDragging,
            dropId: stripOutFalseIdChars(id),
            isFalseItem: isFalseItem(id),
        });
        if (isValidDrop) {
            let newTree = tree;
            let sourceArray = [];
            const destination = isFalseItem(id)
                ? buildCustomDestinationPosition(id.replace('FALSEITEM_', ''), 0)
                : getDestinationPosition(tree, id);

            currentlyDragging.slice(0).map(CurrentlyDraggingitem => {
                const source = getSourcePosition(newTree, CurrentlyDraggingitem);
                sourceArray.push(source);
                newTree = moveItemOnTree(newTree, source, destination);
            });
            if (snapshot) document.body.removeChild(this.state.snapshot);
            onDragEnd(sourceArray, destination, newTree);

            this.setState({ currentlyDragging: [], currentlyDraggingOver: null, tree: newTree, snapshot: null });
        } else {
            this.setState({ currentlyDragging: [], currentlyDraggingOver: null, snapshot: null });
        }
    };

    onDragStart = (id, event) => {
        const { renderSnapshot, selectedItems } = this.props;
        const { minimalTree } = this.state;
        const orderedSelectedItems = preserveOrderFromtree(minimalTree, selectedItems);

        const selectedDraggables = selectedItems.length === 0 ? [id] : orderedSelectedItems;

        const dragCount = selectedDraggables.length;
        //Get the element being dragged on the dom
        const snapshot = this.nodeRefs.get(id);

        const relativeMousePositionX = event.nativeEvent.layerX || 0;

        const relativeMousePositionY = event.nativeEvent.layerY || 0;
        const snapshotWrapper = document.createElement('div');
        let customSnapshot = renderSnapshot({ id, ref: snapshot, dragCount });

        if (customSnapshot instanceof HTMLElement) {
            customSnapshot = customSnapshot.cloneNode(true);
            customSnapshot.style.top = '0';
            customSnapshot.style.left = '0';
            snapshotWrapper.appendChild(customSnapshot);
        } else {
            ReactDOM.render(customSnapshot, snapshotWrapper);
        }
        snapshotWrapper.style.position = 'absolute';
        snapshotWrapper.style.top = '-1000px';
        snapshotWrapper.style.display = 'block';
        document.body.appendChild(snapshotWrapper);
        this.setState({ snapshot: snapshotWrapper });
        //set a custom drag image
        event.dataTransfer.setDragImage(snapshotWrapper, relativeMousePositionX, relativeMousePositionY);
        //just so that the state is set a millisecond after since setTimeout sends the setstate through the js event loop
        setTimeout(() => {
            this.setState({ currentlyDragging: selectedDraggables });
        }, 0);
    };

    onDragOver = (id, event) => {
        event.preventDefault();
        const { currentlyDraggingOver, tree, currentlyDragging } = this.state;
        if (
            !isFalseItem(id) &&
            hasChildren(tree, id) &&
            currentlyDraggingOver !== id &&
            !currentlyDragging.includes(id)
        ) {
            this.onExpand(id);
        }
        if (currentlyDraggingOver !== id) this.setState({ currentlyDraggingOver: id });
    };

    onDragEnd = event => {
        event.preventDefault();
        event.stopPropagation();
        const { snapshot } = this.state;
        if (snapshot) document.body.removeChild(this.state.snapshot);
        this.setState({ currentlyDragging: [], currentlyDraggingOver: null, snapshot: null });
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
        const { renderItem, renderPlaceholder } = this.props;
        const { onCollapse, onExpand } = this;

        const minimalFlatTree = flattenToMinimalTree(tree);
        const minimalTreeWithFalseChilds = addFalseChildren(tree, minimalFlatTree);
        const itemId = minimalTreeWithFalseChilds[index];
        const isFalseChilditem = isFalseItem(itemId);
        const item = isFalseChilditem
            ? {
                  id: itemId,
                  isFalseItem: isFalseChilditem,
                  hasChildren: false,
                  isExpanded: false,
                  data: { id: itemId },
                  children: [],
              }
            : tree['items'][itemId];
        const isVisible = isFalseChilditem ? false : isParentExpanded(tree, itemId);
        const isChild = isFalseChilditem ? true : isChildItem(tree, itemId);
        const isDragging = currentlyDragging.includes(itemId);
        const isDraggingOver = currentlyDraggingOver === itemId;
        const parentId = isFalseChilditem ? getParentId(tree, stripOutFalseIdChars(itemId)) : getParentId(tree, itemId);
        const parentRef = this.nodeRefs.get(parentId) || null;

        return (
            <DraggableItem
                style={style}
                isFalseItem={isFalseChilditem}
                isDragging={isDragging}
                isDraggingOver={isDraggingOver}
                item={item}
                setRef={this.setRef}
                isChild={isChild}
                isVisible={isVisible}
                parentId={parentId}
                parentRef={parentRef}
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
        const { tree, currentlyDragging, currentlyDraggingOver, minimalTree } = this.state;
        const { height, itemHeight, width } = this.props;
        const minimalTreeWithFalseChilds = addFalseChildren(tree, minimalTree);

        return (
            <List
                tree={tree}
                currentlyDragging={currentlyDragging}
                currentlyDraggingOver={currentlyDraggingOver}
                height={height}
                itemCount={minimalTreeWithFalseChilds.length}
                itemSize={itemHeight}
                width={width}
            >
                {this.row}
            </List>
        );
    }
}
export { DraggableList };
