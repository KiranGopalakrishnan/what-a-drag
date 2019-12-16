import * as React from 'react';
import { ItemId, TreeItem } from '../types/types';

interface DraggableitemProps {
    style: Record<string, any>;
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
}

export const DraggableItem: React.FC<DraggableitemProps> = props => {
    const {
        style,
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
    } = props;

    const isDragging = currentlyDragging === item.id;
    const isDraggingOver = currentlyDraggingOver === item.id;
    return (
        <div
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
                ...style,
                ...{
                    borderLeft: isChild ? 'solid 35px transparent' : '0',
                    boxSizing: 'border-box',
                },
            }}
        >
            {renderItem({ item, onCollapse, onExpand, isChild })}
            {isDraggingOver ? renderPlaceholder({ item, isDraggingOver, isDragging }) : null}
        </div>
    );
};
