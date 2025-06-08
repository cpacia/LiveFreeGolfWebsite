import React from 'react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const SHOP_DOMAIN      = 'chad-622.myshopify.com';
const STOREFRONT_TOKEN = 'cfed2819f4fda26e6be3560f1f4c9198';

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    removeItem,
    updateQuantity,
    subtotal,
  } = useCart();
  

 const handleCheckout = async () => {
    if (items.length === 0) return;

    // Build the lines array with both quantity & global variant ID
    const lines = items.map(item => ({
      merchandiseId: item.variantId,  
      quantity:      item.quantity,
    }));

    const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors { field message }
          warnings   { code  message }
        }
      }
    `;

    const res = await fetch(
      `https://${SHOP_DOMAIN}/api/2024-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query: mutation, variables: { input: { lines } } }),
      }
    );

    const { data, errors } = await res.json();
    if (errors?.length || data.cartCreate.userErrors.length) {
      console.error('Cart API error', errors, data.cartCreate.userErrors);
      return;
    }

    // finally redirect into Shopify’s hosted checkout
    window.location.href = data.cartCreate.cart.checkoutUrl;
  };


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
          <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
        </footer>
      </aside>
    </>
  );
}
