import * as React from 'react';
import { TreeData } from './types/types';

interface Props {
    children: any;
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<any>;
    tree: TreeData;
    totalCount?: number;
}

const InfiniteList: React.FC<Props> = ({ children, loadMoreItems, totalCount }: Props) => {
    return (
        <>
            {React.Children.map(children, child =>
                React.cloneElement(child, {
                    loadMoreItems,
                    totalCount,
                }),
            )}
        </>
    );
};

export { InfiniteList };
