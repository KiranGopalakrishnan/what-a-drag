import * as React from 'react';
import { ItemId, TreeItem } from '../types/types';

interface DraggableitemProps {
    item: TreeItem;
    currentlyDragging: ItemId;
    currentlyDraggingOver: ItemId;
    isChild: boolean;
    isVisible: boolean;
    renderItem: Function;
    renderPlaceholder: Function;
    onCollapse: Function;
    onExpand: Function;
    onDragStart: Function;
    onDragOver: Function;
    onDrop: Function;
    onDragEnd: Function;
    itemRef: any;
}

export const DraggableItem: React.FC<DraggableitemProps> = React.memo(props => {
    const {
        currentlyDragging,
        currentlyDraggingOver,
        item,
        isChild,
        renderItem,
        renderPlaceholder,
        onCollapse,
        onExpand,
        onDragStart,
        onDragOver,
        onDrop,
        onDragEnd,
        itemRef,
    } = props;

    const isDragging = currentlyDragging === item.id;
    const isDraggingOver = currentlyDraggingOver === item.id;
    return (
        <div
            ref={itemRef}
            key={item.id}
            className={'draggableItem'}
            draggable
            onDragOver={event => onDragOver(item.id, event)}
            onDrop={event => onDrop(item.id, event)}
            onDragStart={event => {
                event.dataTransfer.setData('text', item.id);
                onDragStart(item.id);
            }}
            onDragEnd={event => onDragEnd(event)}
            style={{
                borderLeft: isChild ? 'solid 35px transparent' : '0',
                boxSizing: 'border-box',
                position: 'relative',
            }}
        >
            {renderItem({ item, onCollapse, onExpand, isChild })}
            {isDraggingOver ? renderPlaceholder({ item, isDraggingOver, isDragging }) : null}
        </div>
    );
});
