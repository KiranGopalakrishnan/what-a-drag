import * as React from 'react';
import { TreeItem, ItemId } from '../types/types';

interface DraggableitemProps {
    style: Record<string, any>;
    item: TreeItem;
    isDragging: boolean;
    isDraggingOver: boolean;
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
    setRef: Function;
    isFalseItem: boolean;
    parentId: ItemId;
    parentRef: HTMLElement;
}

export const DraggableItem: React.FC<DraggableitemProps> = props => {
    const {
        style,
        isDragging,
        isDraggingOver,
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
        setRef,
        isFalseItem,
        parentId,
        parentRef,
    } = props;
    return (
        <div
            key={item.id}
            className={'draggableItem'}
            draggable
            ref={element => setRef(item.id, element)}
            onDragOver={event => onDragOver(item.id, event)}
            onDrop={event => onDrop(item.id, event)}
            onDragStart={event => {
                event.dataTransfer.setData('text', item.id);
                onDragStart(item.id, event);
            }}
            onDragEnd={event => onDragEnd(event)}
            style={{
                ...style,
                ...{
                    borderLeft: isChild ? 'solid 35px transparent' : '0',
                    boxSizing: 'border-box',
                    display: 'block',
                },
            }}
        >
            {renderItem({ item, onCollapse, onExpand, isFalseItem, isChild, parentId })}
            {isDraggingOver
                ? renderPlaceholder({ item, isDraggingOver, isDragging, isFalseItem, parentId, parentRef })
                : null}
        </div>
    );
};
