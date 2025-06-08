import React from 'react';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    removeItem,
    updateQuantity,
    subtotal,
  } = useCart();

  return (
    <>  {/* Overlay */}
      {isOpen && <div className="cart-overlay" onClick={closeCart} />}

      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>  {/* Drawer */}
        <header className="cart-header">
          <h2>Cart</h2>
          <button className="close-btn" onClick={closeCart}>×</button>
        </header>

        <div className="cart-items">
          {items.length > 0 ? (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} />
                <div className="item-details">
                  <span className="item-title">{item.title}</span>
                  <span className="item-price">${item.price.toFixed(2)}</span>
                  <div className="cart-item-controls">
					  <div className="quantity-selector">
			             <button
			               onClick={() => updateQuantity(item.id, item.quantity - 1)}
			               disabled={item.quantity <= 1}
			             >
			               –
			             </button>
			             <span>{item.quantity}</span>
			             <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
			               +
			             </button>
			           </div>
			           <button
			             className="remove-btn"
			             onClick={() => removeItem(item.id)}
			           >
			             Remove
			           </button>
					</div>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-msg">Your cart is empty</p>
          )}
        </div>

        <footer className="cart-footer">
          <div className="subtotal">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button className="checkout-btn">Checkout</button>
        </footer>
      </aside>
    </>
  );
}
