# What-a-drag

A React Drag and drop tree library designed with customization and usuability in mind
with added support for rendering and drag and dropping large lists.

# Installation

`npm install what-a-drag@latest --save`

#Get started
######Tree data structure
Tree is defined by a normalized data structure, where rootId defines the id of the root node and items map contains all the nodes indexed by their id. Child relationship is defined in the children field of parent in form of list of id's.

######Data attribute:

Any consumer data should be defined in the data attribute of item, e.g. title, color, selection etc.

######State handling:
This data structure is the single source of truth. After any interaction the consumer's responsibility to execute the mutation on the tree, which will be passed down in props to refresh the rendered tree. A few utils functions (mutateTree, moveItemOnTree) are provided in order to help you make those changes easily and in a efficient way.

######Performance / Side-effects:
We put some effort into optimizing rendering based on reference equality. We only re-render an Item if it's reference changed or moved on the tree.

######Events:
onDragEnd function will be triggered at the end of re-ordering. it provides the necessary information as TreePosition to change the tree.
######Example
type TreePosition = {
parentId: ItemId,
index: number,
};
  
 onDragEnd = (source: TreePosition, destination: ?TreePosition) => {
const { tree } = this.state;
  
 if (!destination) {
return;
}
const newTree = moveItemOnTree(tree, source, destination);
this.setState({
tree: newTree,
});
};
  


# Types & Tree Structure

    export type ChildItem = string;

    export type ItemId = string;

    export interface TreeItemData {
        id: string;
        [key: string]: any;
    }

    export interface TreeItem {
        id: string;
        isExpanded: boolean;
        hasChildren: boolean;
        data: TreeItemData;
        children: ChildItem[];
    }

    export interface TreeData {
        rootId: string;
        items: { [key: string]: TreeItem };
    }

####renderitem

      renderItem = ({
        item,
        onCollapse,
        onExpand
      }: RenderItemParams) => {
        return (
          <div
          >
            <div>{item.id}</div>
            <div>{item.data ? item.data.title : ''}</div>
          </div>
        );
      };

##Expand & Collapse
onExpand and onCollapse functions are triggered when there is a need to change the state of a parent. This is the right time to trigger requests to load the subtree or flip the isExpanded attribute to show the already loaded children nodes.

####Example

    onExpand = (itemId: ItemId) => {
      const { tree }: State = this.state;
      this.setState({
        tree: mutateTree(tree, itemId, { isExpanded: true }),
      });
    };

## renderPlaceholder

Allows the consumer to specify a placeholder item for when a dragged item is being hovered over an item in the tree

    renderPlaceholder({ item, isDraggingOver, isDragging }){
        return (
            <div>
                {isDraggingOver?'Dragging over':'Not dragging over'}
            </div>
        );
    }

## DraggableList

The exported component from `what-a-drag` which needs to be rendered with the tree data .

###Example
  
 import { DraggableList } from 'what-a-drag'
  
 <Draggable
tree={treeData}
renderItem={renderItem}
renderPlaceholder={placeholderToRender}
onExpand={onExpand}
onCollapse={onCollapse}
onDragEnd={onDragEnd}
height={500}
itemSize={50}
width={'100%'}
/>
