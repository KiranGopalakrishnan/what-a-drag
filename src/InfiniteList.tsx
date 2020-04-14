import * as React from 'react';
import { TreeData } from './types/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import InfiniteLoader from 'react-window-infinite-loader';
import { flattenToMinimalTree } from './utils/Utils';

interface Props {
    children: any;
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<any>;
    totalCount?: number;
    batchSize: number;
    itemCount: number;
    tree: TreeData;
    listTotal: number;
}

const InfiniteList: React.FC<Props> = ({ children, loadMoreItems, itemCount, listTotal, tree, batchSize }: Props) => {
    const minimalFlatTree = flattenToMinimalTree(tree);

    const isItemLoaded = index => minimalFlatTree.length > index;
    return (
        <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            minimumBatchSize={batchSize}
            loadMoreItems={loadMoreItems}
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
