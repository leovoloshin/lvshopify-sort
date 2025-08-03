import React from 'react';
import { List } from '@shopify/polaris';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ProductList = ({ products, onReorder }) => {
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newProducts = Array.from(products);
    const [moved] = newProducts.splice(result.source.index, 1);
    newProducts.splice(result.destination.index, 0, moved);
    onReorder(newProducts);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <List {...provided.droppableProps} ref={provided.innerRef}>
            {products.map((product, index) => (
              <Draggable key={product.id} draggableId={product.id} index={index}>
                {(provided) => (
                  <List.Item ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    {product.title} ({product.variants.edges.length} variants)
                  </List.Item>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ProductList;