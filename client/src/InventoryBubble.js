import React from 'react';

const getColor = (qty) => {
  if (qty === 0) return 'red';
  if (qty <= 5) return 'yellow';
  return 'green';
};

const InventoryBubble = ({ variant, quantity }) => {
  const qty = variant ? variant.inventoryQuantity : quantity;
  const label = variant ? `${variant.title.split(' / ')[0]} - ${qty}` : `${qty}`;
  return (
    <div style={{
      backgroundColor: getColor(qty),
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '2px',
      fontSize: '10px',
      opacity: 0.8,
    }}>
      {label}
    </div>
  );
};

export default InventoryBubble;