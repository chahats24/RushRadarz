import React, { useEffect, useState, useCallback } from 'react';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const CART_KEY = 'local_cart_v1';

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export default function Cart() {
  const [cart, setCart] = useState(() => readCart());
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState(null);

  // keep in sync across tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === CART_KEY) {
        setCart(readCart());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  const updateQty = useCallback((id, delta) => {
    setCart(prev => {
      const next = prev.map(it => (it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it));
      return next;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setCart(prev => prev.filter(it => it.id !== id));
  }, []);

  const total = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);

  function makeTokenForRestaurant(restaurant) {
    const key = `token_counter_${restaurant.replace(/\s+/g, '_')}`;
    const raw = localStorage.getItem(key) || '0';
    const num = parseInt(raw || '0', 10) + 1;
    localStorage.setItem(key, String(num));
    return `${restaurant.replace(/\s+/g, '')}-${num}`;
  }

  function handleCheckout() {
    if (!cart || cart.length === 0) return;
    // pick first restaurant as token owner for demo simplicity
    const restaurant = cart[0].restaurant || 'restaurant';
    const token = makeTokenForRestaurant(restaurant);
    // store last order for simple persistence (demo)
    const last = { id: Date.now(), token, items: cart, total };
    try {
      localStorage.setItem('last_order', JSON.stringify(last));
    } catch (e) {}
    // clear cart both in state and localStorage so other tabs update immediately
    try {
      localStorage.setItem(CART_KEY, JSON.stringify([]));
    } catch (e) {}
    setCart([]);

    // add to active orders so Home can show it
    try {
      const keyActive = 'active_orders_v1';
      const rawActive = localStorage.getItem(keyActive);
      let arr = rawActive ? JSON.parse(rawActive) : [];
      const entry = { id: last.id, token: last.token, items: last.items, total: last.total, restaurant: restaurant, status: 'In Queue' };
      arr.unshift(entry);
      // keep only the 3 most recent active orders
      arr = arr.slice(0, 3);
      localStorage.setItem(keyActive, JSON.stringify(arr));
    } catch (e) {}

    // show a sticky toast with the token; navigate when the user dismisses it
    setToastMsg({ message: `Order placed — token ${token}`, token });
  }

  return (
    <div className="space-y-6">
      <Toast
        message={toastMsg?.message}
        onClose={() => {
          const t = toastMsg?.token;
          setToastMsg(null);
          if (t) navigate('/?checked_out=1&token=' + encodeURIComponent(t));
        }}
        duration={null}
        actionLabel="Copy token"
        onAction={() => {
          try {
            navigator.clipboard.writeText(toastMsg?.token || '');
          } catch (e) {}
        }}
      />

      <h2 className="text-2xl font-semibold">Your Cart</h2>

      {cart.length === 0 ? (
        <section className="card text-center">
          <p className="text-gray-700 mb-4">Your cart is empty.</p>
          <button onClick={() => navigate('/menu')} className="btn-accent">Browse Menu</button>
        </section>
      ) : (
        <div className="space-y-4">
          <section className="card">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3 border-b card-hover card-hover-white p-2 rounded-lg">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.restaurant}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-gray-700">Rs {item.price}</div>
                  <div className="flex items-center">
                    <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 border rounded">-</button>
                    <div className="px-3">{item.qty}</div>
                    <button onClick={() => updateQty(item.id, +1)} className="px-2 py-1 border rounded">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="px-2 py-1 rounded bg-red-500 text-white">Remove</button>
                </div>
              </div>
            ))}
          </section>

          <section className="card flex items-center justify-between">
            <div className="text-lg font-medium">Total</div>
            <div className="text-xl font-bold">Rs {total}</div>
          </section>

          <div className="flex space-x-3">
            <button onClick={handleCheckout} className="btn-accent">Checkout</button>
            <button onClick={() => { setCart([]); try{ localStorage.setItem(CART_KEY, JSON.stringify([])); }catch(e){} }} className="btn">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
