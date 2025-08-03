import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Grid } from '@shopify/polaris';
import InventoryBubble from './InventoryBubble';

const ProductGrid = ({ products, onReorder }) => {
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newProducts = Array.from(products);
    const [moved] = newProducts.splice(result.source.index, 1);
    newProducts.splice(result.destination.index, 0, moved);
    onReorder(newProducts);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="grid" direction="horizontal">
        {(provided) => (
          <Grid columns={{sm: 2}} {...provided.droppableProps} ref={provided.innerRef}>
            {products.map((product, index) => (
              <Draggable key={product.id} draggableId={product.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ position: 'relative' }}>
                    <img src={product.images.edges[0]?.node.src} alt={product.title} style={{ width: '100%' }} />
                    <div style={{ position: 'absolute', bottom: '33%', left: 0, display: 'flex', flexWrap: 'wrap', overflow: 'auto', maxWidth: '100%' }}>
                      {(() => {
                        const variants = product.variants.edges;
                        if (variants.length === 1 && variants[0].node.title === 'Default Title') {
                          return <InventoryBubble quantity={variants[0].node.inventoryQuantity} />;
                        } else {
                          return variants.map(v => <InventoryBubble key={v.node.id} variant={v.node} />);
                        }
                      })()}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Grid>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ProductGrid;