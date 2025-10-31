import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

function AvailabilityBadge({ restaurantName, itemName, fetchAvailability, availabilityMap, waitMap, estimatedTimeFallback }){
  const [state, setState] = useState(null);

  useEffect(()=>{
    let mounted = true;
    const key = `${restaurantName}@@${itemName}`;
    if(availabilityMap && availabilityMap[key]){
      setState(availabilityMap[key]);
      return;
    }
    (async ()=>{
      const res = await fetchAvailability(restaurantName, itemName);
      if(!mounted) return;
      setState(res);
    })();
    return ()=> { mounted = false; };
  }, [restaurantName, itemName, availabilityMap, fetchAvailability]);

  // If availability call hasn't returned yet, show restaurant ETA if available
  if(!state){
    const eta = waitMap && waitMap[restaurantName?.trim()];
    if(eta !== undefined) return <div className="text-sm px-2 py-1 bg-sunrise-50 text-sunrise-700 rounded">ETA: {eta}m</div>;
    if(estimatedTimeFallback) return <div className="text-sm px-2 py-1 bg-sunrise-50 text-sunrise-700 rounded">ETA: {estimatedTimeFallback}</div>;
    return <div className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">ETA: --</div>;
  }

  const p = state.availabilityProbability || 0;
  if(p > 70) return <div className="text-sm px-2 py-1 bg-green-50 text-green-700 rounded">Available ({p}%)</div>;
  if(p > 40) return <div className="text-sm px-2 py-1 bg-yellow-50 text-yellow-800 rounded">Limited ({p}%)</div>;
  return <div className="text-sm px-2 py-1 bg-red-50 text-red-700 rounded">Low ({p}%)</div>;
}

function Menu() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [allergies] = useState(['peanuts', 'dairy']);

  const dummyRestaurants = React.useMemo(() => [
    {
      id: 1,
      name: "KC ",
      cuisine: "Fast Food",
      rating: 4.2,
      estimatedTime: "30-40 mins",
      menu: [
        { id: 1, name: "Paneer Paratha", price: 60, tags: ['Vegetarian'], allergens: ['dairy','gluten']},
        { id: 2, name: "Dahi Puri", price: 50, tags: ['Vegetarian'], allergens: ['dairy'] },
        { id: 3, name: "Vada Pav", price: 45, tags: ['Vegetarian'], allergens: ['gluten'] },
        { id: 4, name: "Pav Bhaji", price: 60, tags: ['Vegetarian'], allergens: ['gluten']},
        { id: 5, name: "Roll", price: 80, tags: ['Vegetarian'], allergens: ['gluten']}
      ]
    },
    {
      id: 2,
      name: "Lassi Point",
      cuisine: "Beverages",
      rating: 4.0,
      estimatedTime: "20-30 mins",
      menu: [
        { id: 1, name: "Mango Lassi", price: 35, tags: ['Vegetarian','Nut-Free'], allergens: ['dairy'] },
        { id: 2, name: "Mint Lemonade", price: 40, tags: ['Vegetarian','Nut-Free'], allergens: []},
        { id: 3, name: "Oreo Shake", price: 50, tags: ['Vegetarian'], allergens: ['dairy','gluten'] },
        { id: 4, name: "Cold Coffee", price: 60, tags: ['Vegetarian'], allergens: ['dairy']},
      ]
    },
    {
      id: 3,
      name: "Hang on Swing",
      cuisine: "Fast Food",
      rating: 3.5,
      estimatedTime: "20-30 mins",
      menu: [
        { id: 1, name: "Veg Noodles", price: 70, tags: ['Vegetarian'], allergens: [] },
        { id: 2, name: "Cheese Maggi", price: 75, tags: ['Vegetarian'], allergens: ['dairy','gluten']},
        { id: 3, name: "Chicken Burger", price: 80, tags: ['Non-Vegetarian'], allergens: [] },
        { id: 4, name: "French Fries", price: 60, tags: ['Vegetarian'], allergens: []},
        { id: 5, name: "Momos", price: 100, tags: ['Vegetarian'], allergens: ['gluten']}
      ]
    },
    {
      id: 4,
      name: "DC Bakery",
      cuisine: "Fast Food",
      rating: 4.0,
      estimatedTime: "40-50 mins",
      menu: [
        { id: 1, name: "Red Sauce Pasta", price: 110, tags: ['Vegetarian'], allergens: ['gluten','dairy'] },
        { id: 2, name: "Brownie", price: 80, tags: ['Vegetarian'], allergens: ['gluten','dairy']},
        { id: 3, name: "Pizza", price: 150, tags: ['Vegetarian'], allergens: ['gluten','dairy'] },
        { id: 4, name: "Choco Lava Cake", price: 65, tags: ['Vegetarian'], allergens: ['gluten','dairy']},
      ]
    },
    {
      id: 5,
      name: "PRP Canteen",
      cuisine: "Fast Food",
      rating: 3.0,
      estimatedTime: "40-50 mins",
      menu: [
        { id: 1, name: "Veg Biryani", price: 40, tags: ['Vegetarian'], allergens: [] },
        { id: 2, name: "Butter Paneer Masala", price: 100, tags: ['Vegetarian'], allergens: ['dairy'] },
        { id: 3, name: "Naan", price: 25, tags: ['Vegetarian'], allergens: ['gluten'] },
        { id: 4, name: "Chicken Noodles", price: 60, tags: ['Non-Vegetarian'], allergens: ['gluten']},
        { id: 5, name: "Fried Rice", price: 100, tags: ['Vegetarian'], allergens: []}
      ]
    },

  ], []);

  const restaurantImages = React.useMemo(() => ({
    'KC ': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\KC.jpg'),
    'Lassi Point': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\lassipoint.jpg'),
    'Hang on Swing': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\HangOnSwing.jpg'),
    'DC Bakery': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\DC.jpg'),
    'PRP Canteen': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\prpcanteen.jpg')
  }), []);
  const [waitMap, setWaitMap] = useState({});
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [profile, setProfile] = useState({ allergies: [], dietary: [] });

  // load profile and predicted waits (dummyRestaurants is stable here)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // load local profile (dietary / allergies)
    try {
      const raw = localStorage.getItem('local_profile_v1');
      if (raw) {
        const obj = JSON.parse(raw);
        setProfile({ allergies: obj.allergies || [], dietary: obj.dietary || [] });
      }
    } catch (e) {
      // ignore
    }

    // fetch predicted wait for each restaurant (simple parallel requests)
    (async () => {
      const map = {};
      for (const r of dummyRestaurants) {
        try {
            const rn = r.name.trim();
            const res = await fetch(`/api/analytics/wait-time?restaurant=${encodeURIComponent(rn)}`);
            if (res.ok) {
              const json = await res.json();
              map[rn] = json.predictedWaitMinutes;
            }
        } catch (e) {
          // ignore per-restaurant error
        }
      }
      setWaitMap(map);
    })();
  }, [dummyRestaurants]);

  const fetchAvailability = async (restaurantName, itemName) => {
    const key = `${restaurantName}@@${itemName}`;
    if (availabilityMap[key]) return availabilityMap[key];
    try {
      const res = await fetch(`/api/analytics/dish-availability?restaurant=${encodeURIComponent(restaurantName)}&dish=${encodeURIComponent(itemName)}`);
      if (!res.ok) return null;
      const json = await res.json();
      setAvailabilityMap(m => ({ ...m, [key]: json }));
      return json;
    } catch (e) {
      return null;
    }
  };

  const itemImages = {
    'Paneer Paratha': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\paneerparatha.jpg'),
    'Dahi Puri': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\dahipuri.jpg'),
    'Vada Pav': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\vadapav.jpg'),
    'Pav Bhaji': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\pavbhaji.jpg'),
    'Roll': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\roll.jpg'),
    'Mango Lassi': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\mangolassi.jpg'),
    'Mint Lemonade': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\mint.jpg'),
    'Oreo Shake': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\oreo.jpg'),
    'Cold Coffee': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\coldcoffee.jpg'),
    'Veg Noodles': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\noodles.jpg'),
    'Cheese Maggi': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\maggi.jpg'),
    'Chicken Burger': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\burger.jpg'),
    'French Fries': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\frenchfries.jpg'),
    'Momos': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\momos.jpg'),
    'Red Sauce Pasta': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\pasta.jpg'),
    'Brownie': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\brownie.jpg'),
    'Pizza': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\pizza.jpg'),
    'Choco Lava Cake': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\chocolava.jpg'),
    'Veg Biryani': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\biryani.jpg'),
    'Butter Paneer Masala': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\paneer.jpg'),
    'Naan': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\naan.jpg'),
    'Chicken Noodles': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\chickennoodles.jpg'),
    'Fried Rice': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\firedrice.jpg')
  };

  const getAiSuggestion = (menuItem) => {
    // Dummy AI suggestion based on allergies
    if (allergies.includes('dairy') && menuItem.name.toLowerCase().includes('cheese')) {
      return "Warning: Contains dairy";
    }
    return "Safe to eat based on your allergies";
  };

  // determine veg/non-veg/unknown label for an item
  const getDietLabel = (menuItem) => {
    const tags = menuItem.tags || [];
    const name = (menuItem.name || '').toLowerCase();
    const vegTags = ['vegetarian', 'vegan'];
    const nonVegTags = ['non-vegetarian', 'non vegetarian', 'non-veg'];
    if (tags.some(t => vegTags.includes(String(t).toLowerCase()))) return { label: 'Veg', type: 'veg' };
    if (tags.some(t => nonVegTags.includes(String(t).toLowerCase()))) return { label: 'Non-Veg', type: 'nonveg' };
    // simple name-based heuristic for common non-veg keywords
    if (/(chicken|mutton|egg|fish|prawn|prawns|meat|bacon|shrimp|keema|mutton|fish|butter chicken|chicken)/i.test(name)) {
      return { label: 'Non-Veg', type: 'nonveg' };
    }
    // fallback: assume Veg if tags empty but name suggests veg words
    if (/(paneer|vegan|veg|vegetable|paneer|tofu|potato|paneer|dal|rice|biryani)/i.test(name)) {
      return { label: 'Veg', type: 'veg' };
    }
    return { label: 'Unknown', type: 'unknown' };
  };

  // Simple in-memory cart for the menu page
  const CART_KEY = 'local_cart_v1';
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // persist cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  // listen for cart changes from other tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === CART_KEY) {
        try {
          const raw = localStorage.getItem(CART_KEY);
          setCart(raw ? JSON.parse(raw) : []);
        } catch (err) {
          // ignore
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const navigate = useNavigate();

  const handleAddToOrder = (item, restaurantName) => {
    setCart(prev => {
      // match by name + restaurant
      const key = `${item.name}@@${restaurantName}`;
      const existing = prev.find(ci => ci.key === key);
      let next;
      if (existing) {
        next = prev.map(ci => ci.key === key ? { ...ci, qty: ci.qty + 1 } : ci);
      } else {
        const cartItem = {
          key,
          id: Date.now(),
          name: item.name,
          price: item.price,
          restaurant: restaurantName,
          qty: 1
        };
        next = [...prev, cartItem];
      }
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const [reorderNotice, setReorderNotice] = useState(null);

  // consume pending reorder created from Home -> Reorder button
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pending_reorder');
      if (!raw) return;
      const obj = JSON.parse(raw);
      // remove immediately to avoid repeat
      localStorage.removeItem('pending_reorder');
      const restaurantName = obj.restaurant;
      const items = obj.items || [];
      const rest = dummyRestaurants.find(r => (r.name || '').trim() === (restaurantName || '').trim());
      if (!rest) return;
      setSelectedRestaurant(rest.id);
      items.forEach(itemName => {
        const menuItem = rest.menu.find(m => m.name === itemName);
        if (menuItem) handleAddToOrder(menuItem, rest.name);
      });
      setReorderNotice(`Added ${items.length} item(s) from ${rest.name} to cart`);
      setTimeout(() => setReorderNotice(null), 4000);
    } catch (e) {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dummyRestaurants]);

  const handleRemoveFromCart = (key) => {
    setCart(prev => prev.filter(ci => ci.key !== key));
  };

  const cartTotal = cart.reduce((s, ci) => s + ci.price * ci.qty, 0);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  // checkoutToast: { message, token } or null
  const [checkoutToast, setCheckoutToast] = useState(null);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // create a simple confirmation object (frontend-only)
    const orderId = `LOCAL-${Date.now()}`;
    const estimatedMinutes = 20 + Math.floor(Math.random() * 20); // 20-40 min
    const confirmation = {
      id: orderId,
      items: cart,
      total: cartTotal,
      eta: `${estimatedMinutes} mins`
    };

    // assign a simple token number per restaurant (persisted in localStorage)
    const mainRestaurant = cart[0]?.restaurant || 'LOCAL';
    try {
      const key = `token_counter_${mainRestaurant}`;
      const raw = localStorage.getItem(key) || '0';
      const next = parseInt(raw, 10) + 1;
      localStorage.setItem(key, String(next));
      // token format: RESTAURANTNAME-<number>
      const token = `${mainRestaurant.replace(/\s+/g, '').toUpperCase()}-${next}`;
      confirmation.token = token;
      confirmation.tokenNumber = next;
      // persist last order and add to active orders list so Home can show it
      try {
        const last = { id: Date.now(), token, items: confirmation.items, total: confirmation.total, restaurant: mainRestaurant, status: 'In Queue' };
        localStorage.setItem('last_order', JSON.stringify(last));
        const keyActive = 'active_orders_v1';
        const rawActive = localStorage.getItem(keyActive);
        let arr = rawActive ? JSON.parse(rawActive) : [];
        arr.unshift(last);
        // keep only the 3 most recent active orders
        arr = arr.slice(0, 3);
        localStorage.setItem(keyActive, JSON.stringify(arr));
      } catch (e) {}
    } catch (e) {
      // ignore localStorage errors
    }

    // clear cart and show confirmation
    // clear cart and persist immediately so other tabs see the change
    try {
      localStorage.setItem(CART_KEY, JSON.stringify([]));
    } catch (e) {
      // ignore
    }
    setCart([]);
    setOrderConfirmation(confirmation);
    // show toast briefly with token
    if (confirmation.token) {
      setCheckoutToast({ message: `Order placed — token ${confirmation.token}`, token: confirmation.token });
      // keep it visible until the user dismisses (so they can copy the token)
    }
  };

  return (
    <div className="space-y-8">
      <Toast
        message={checkoutToast?.message}
        onClose={() => setCheckoutToast(null)}
        duration={null}
        actionLabel="Copy token"
        onAction={() => {
          try {
            navigator.clipboard.writeText(checkoutToast?.token || '');
          } catch (e) {}
        }}
      />
      {reorderNotice && (
        <div className="p-3 rounded bg-sunrise-50 text-sunrise-700">{reorderNotice}</div>
      )}
      {cart.length > 0 && (
        <section className="card">
          <h2 className="text-xl font-semibold mb-3">Your Cart</h2>
          <div className="space-y-2">
            {cart.map(ci => (
              <div key={ci.key} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{ci.name}</div>
                  <div className="text-sm text-gray-500">{ci.restaurant} · {ci.qty} × Rs {ci.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold">Rs {(ci.price * ci.qty).toFixed(2)}</div>
                  <button onClick={() => handleRemoveFromCart(ci.key)} className="px-2 py-1 rounded bg-red-500 text-white">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="font-semibold">Total</div>
            <div className="font-bold">Rs {cartTotal.toFixed(2)}</div>
          </div>
          <div className="mt-3">
            <button className="btn-accent" onClick={handleCheckout}>Checkout</button>
          </div>
          {orderConfirmation && (
            <div className="mt-4 p-4 rounded bg-aurora/10 border-l-4 border-aurora">
              <div className="font-semibold text-aurora">Order Confirmed — {orderConfirmation.id}</div>
              <div className="text-sm text-gray-600">Estimated delivery: {orderConfirmation.eta}</div>
              {orderConfirmation.token && (
                <div className="text-sm text-gray-700 mt-1">Your token: <span className="font-semibold">{orderConfirmation.token}</span> {orderConfirmation.tokenNumber ? `(#${orderConfirmation.tokenNumber})` : null}</div>
              )}
              <div className="mt-2">
                <button className="px-3 py-1 rounded bg-white/10" onClick={() => setOrderConfirmation(null)}>Dismiss</button>
              </div>
            </div>
          )}
        </section>
      )}
  <section className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurants</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {dummyRestaurants.map(restaurant => (
            <div 
              key={restaurant.id} 
              className={`border p-4 rounded-lg cursor-pointer card-hover flex items-center gap-4 ${
                selectedRestaurant === restaurant.id ? 'border-aurora' : ''
              }`}
              onClick={() => setSelectedRestaurant(restaurant.id)}
            >
              <img src={restaurantImages[restaurant.name] || restaurantImages['KC ']} alt={restaurant.name} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                <p className="text-gray-600">{restaurant.cuisine}</p>
                <div className="flex justify-between mt-2 items-center">
                  <span>⭐ {restaurant.rating}</span>
                  <div className="text-sm">
                    <span className="text-aurora mr-2">{restaurant.estimatedTime}</span>
                    {waitMap[restaurant.name?.trim()] !== undefined && (
                      <span className="px-2 py-0.5 bg-sunrise-50 text-sunrise-700 rounded text-xs">ETA now: {waitMap[restaurant.name.trim()]} min</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedRestaurant && (
        <section className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu</h2>
          <div className="space-y-4">
            {dummyRestaurants
              .find(r => r.id === selectedRestaurant)
              ?.menu.map(item => (
                      <div key={item.id} className="border p-4 rounded-lg flex items-center gap-4 card-hover card-hover-white">
                        <img src={itemImages[item.name] || restaurantImages[dummyRestaurants.find(r => r.id === selectedRestaurant)?.name] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold">{item.name}</h3>
                                      {(() => {
                                        const d = getDietLabel(item);
                                        if (d.type === 'veg') return <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700">● <span className="font-medium">Veg</span></span>;
                                        if (d.type === 'nonveg') return <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700">● <span className="font-medium">Non‑Veg</span></span>;
                                        return <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700">● <span className="font-medium">Unknown</span></span>;
                                      })()}
                                    </div>
                                    <p className="text-gray-600">{item.description}</p>
                                    <p className="text-sm text-sunrise-600 mt-2">{getAiSuggestion(item)}</p>

                                    {/* dietary / allergen warnings */}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {profile.dietary && profile.dietary.length > 0 && (
                                        // if user is Vegetarian but item has no Vegetarian tag -> show warning
                                        profile.dietary.map(pref => (
                                          pref === 'Vegetarian' && !item.tags?.includes('Vegetarian') ? (
                                            <div key={pref} className="text-sm px-2 py-1 bg-yellow-50 text-yellow-800 rounded">Not marked {pref}</div>
                                          ) : null
                                        ))
                                      )}
                                    </div>
                                  </div>
                        <div className="text-right">
                          <p className="font-semibold">Rs {item.price.toFixed(2)}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button className="btn-accent" onClick={() => handleAddToOrder(item, dummyRestaurants.find(r => r.id === selectedRestaurant)?.name)}>
                              Add to Order
                            </button>
                            <AvailabilityBadge 
                              restaurantName={dummyRestaurants.find(r => r.id === selectedRestaurant)?.name} 
                              itemName={item.name} 
                              fetchAvailability={fetchAvailability} 
                              availabilityMap={availabilityMap} 
                              waitMap={waitMap}
                              estimatedTimeFallback={dummyRestaurants.find(r => r.id === selectedRestaurant)?.estimatedTime}
                            />
                          </div>
                        </div>
                      </div>
                ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Menu;