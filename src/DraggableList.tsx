import * as React from 'react';
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
    debounce,
} from './utils/Utils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Loading } from './components/Loading';

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
    minimalTree: ItemId[];
}

interface Props {
    renderItem: Function;
    tree?: Tree;
    onDragEnd: Function;
    onDragStart: Function;
    renderPlaceholder: Function;
    renderLoading: Function;
    onCollapse: Function;
    onExpand: Function;
    itemHeight: number;
    loadMoreItems: Function;
    listRef: any;
}

//Extract id's for root items and expanded child items while keeping the order
const flattenToMinimalTree = (tree: Tree, filter: Function = () => true) => {
    const flatTreeWithNullValues = tree.items[tree.rootId].children.map((item: ChildItem) => {
        const childrenArray =
            filter(tree['items'][item]) && tree['items'][item].hasChildren && tree['items'][item].isExpanded
                ? tree.items[item].children
                : null;
        return [item].concat(childrenArray);
    });

    return [].concat.apply([], flatTreeWithNullValues).filter(Boolean);
};

class DraggableList extends React.Component<Props, State> {
    state: State;
    lastItem: any;
    constructor(props) {
        super(props);
        this.state = {
            currentlyDragging: null,
            currentlyDraggingOver: null,
            tree: props.tree,
            minimalTree: flattenToMinimalTree(props.tree),
        };
        this.lastItem = React.createRef();
    }

    public static defaultProps = {
        renderItem: (): void => {},
        tree: {},
        height: 400,
        width: '100%',
        itemHeight: 32,
        renderLoading: () => <Loading />,
    };

    static getDerivedStateFromProps(props: Props, state: State) {
        const { tree } = props;
        const { currentlyDragging, currentlyDraggingOver } = state;
        return {
            tree,
            currentlyDragging,
            currentlyDraggingOver,
            minimalTree: flattenToMinimalTree(tree),
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onWindowScroll, true);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onWindowScroll, true);
    }

    onWindowScroll = debounce(() => {
        const { minimalTree } = this.state;
        const { loadMoreItems } = this.props;
        var rect = this.lastItem.getBoundingClientRect();
        const isLastItemInView =
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth);
        if (isLastItemInView) {
            const currentLastIndex = minimalTree.length - 1;
            loadMoreItems(currentLastIndex, currentLastIndex + 10);
        }
    }, 200);

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

    row = (itemId: string) => {
        const { tree, currentlyDragging, currentlyDraggingOver } = this.state;
        const { renderItem, renderPlaceholder } = this.props;
        const { onCollapse, onExpand } = this;
        const item = tree['items'][itemId];
        const isVisible = isParentExpanded(tree, itemId);
        const isChild = isChildItem(tree, itemId);
        return (
            <DraggableItem
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
                itemRef={el => (this.lastItem = el)}
                key={item.id}
            />
        );
    };

    render() {
        const { minimalTree } = this.state;
        const { renderLoading } = this.props;
        return (
            <>
                {minimalTree.map(item => this.row(item))}
                {Array(3)
                    .fill('LOADING')
                    .map(() => renderLoading())}
            </>
        );
    }
}
export { moveItemOnTree, DraggableList, flattenToMinimalTree };
