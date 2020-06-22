import * as React from 'react';
import { TreeData } from './types/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import InfiniteLoader from 'react-window-infinite-loader';
import { flattenToMinimalTree, findAllGroupChildren } from './utils/Utils';

interface Props {
    children: any;
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<any>;
    totalCount?: number;
    batchSize: number;
    itemCount: number;
    tree: TreeData;
    listTotal: number;
    threshold: number;
}

const InfiniteList: React.FC<Props> = ({
    children,
    loadMoreItems,
    itemCount,
    listTotal,
    tree,
    batchSize,
    threshold,
}: Props) => {
    const minimalFlatTree = flattenToMinimalTree(tree);

    const isItemLoaded = index => minimalFlatTree.length > index;

    const numberOfChildItems = findAllGroupChildren(tree);

    const [newBatchSize, setBatchSize] = React.useState(batchSize);

    React.useEffect(() => {
        if (minimalFlatTree.length > newBatchSize) {
            setBatchSize(minimalFlatTree.length + batchSize);
        } else {
            setBatchSize(numberOfChildItems + batchSize);
        }
    }, [minimalFlatTree.length, batchSize]);

    return (
        <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            minimumBatchSize={newBatchSize}
            loadMoreItems={loadMoreItems}
            threshold={threshold}
        >
            {({ onItemsRendered, ref }) =>
                React.Children.map(children, child =>
                    React.cloneElement(child, {
                        onItemsRendered,
                        listRef: ref,
                        minimalFlatTree,
                        tree,
                        itemCount: listTotal,
                        totalCount: itemCount,
                    }),
                )
            }
        </InfiniteLoader>
    );
};

export { InfiniteList };
