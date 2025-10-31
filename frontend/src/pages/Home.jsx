import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Home() {
  const dummyOrders = [
    {
      id: 1,
      orderNumber: "ORD-2025-028",
      restaurant: "Hang on Swing",
      items: ["Cheese Maggi"],
      status: "In Queue",
      estimatedTime: "10-15 min",
      location: "KC Food Court",
      driver: "Self",
      price: 75
    },
    {
      id: 2,
      orderNumber: "ORD-2024-029",
      restaurant: "KC",
      items: ["Dahi Puri"],
      status: "Preparing",
      estimatedTime: "15-20 min",
      location: "KC Food Court",
      driver: "Self",
      price: 50
    }
  ];

  // read active orders from localStorage (persisted by checkout flows)
  const [activeOrders, setActiveOrders] = React.useState(() => {
    try {
      const raw = localStorage.getItem('active_orders_v1');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // listen for active orders updates from other tabs
  React.useEffect(() => {
    function onStorage(e) {
      if (e.key === 'active_orders_v1') {
        try {
          const raw = localStorage.getItem('active_orders_v1');
          setActiveOrders(raw ? JSON.parse(raw) : []);
        } catch (err) {
          // ignore
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const aiRecommendation = {
    dish: "Red Sauce Pasta",
    restaurant: "DC Bakery",
    reason: "Based on your recent orders, preference for Italian cuisine, and current weather (perfect for pasta!)",
    confidence: 95
  };

  const friendActivity = [
    {
      id: 1,
      name: "Aadya",
      action: "just ordered from FC Food Court",
      time: "2 minutes ago"
    },
    {
      id: 2,
      name: "Sharva",
      action: "is looking at SJT Canteen menu",
      time: "5 minutes ago"
    },
    {
      id: 3,
      name: "Shivika",
      action: "rated DC Bakery 5 stars",
      time: "15 minutes ago"
    }
  ];

  const recentOrders = React.useMemo(() => [
    {
      id: 1,
      restaurant: "Lassi Point",
      items: ["Mango Shake", "Watermelon Juice"],
      date: "Yesterday",
      rating: 5
    },
    {
      id: 2,
      restaurant: "SJT Nescafe",
      items: ["Maggi", "Cold Coffee"],
      date: "2 days ago",
      rating: 3.5
    },
    {
      id: 3,
      restaurant: "PRP Canteen",
      items: ["Chicken Biryani", "Paneer Butter Masala","Naan"],
      date: "Last week",
      rating: 4
    }
  ], []);

  const restaurantImages = React.useMemo(() => ({
    'Lassi Point': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\lassipoint.jpg'),
    'SJT Nescafe': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\nescafe.jpg'),
    'PRP Canteen': require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\prpcanteen.jpg')
  }), []);

  const navigate = useNavigate();

  const handleReorder = (order) => {
    try {
      // store minimal reorder info and navigate to menu
      const payload = {
        restaurant: order.restaurant,
        items: order.items
      };
      localStorage.setItem('pending_reorder', JSON.stringify(payload));
      navigate('/menu');
    } catch (e) {
      // ignore
    }
  };

  

  const promotions = [
    {
      id: 1,
      restaurant: "DC Bakery",
      offer: "Get 10% off on combo meals",
      code: "COMBO10",
      expiresIn: "2 days"
    },
    {
      id: 2,
      restaurant: "Apples Juice Center",
      offer: "Free Veg Puff on orders above Rs 300",
      code: "PUFF300",
      expiresIn: "5 days"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-black/40" />
        <div className="h-48 md:h-64 bg-center bg-cover flex items-center" style={{ backgroundImage: `url(${require('C:\\Users\\chaha\\OneDrive\\Desktop\\SEM\\frontend\\src\\Images\\hero.jpg')})` }}>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-white max-w-xl">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gradient">Delicious food, delivered fast</h1>
              <p className="mt-2 text-sm md:text-base">Explore menus, order with friends, and keep track of your favorite dishes — all in one place.</p>
              <div className="mt-4 flex gap-3">
                <Link to="/menu" className="btn-accent">Order Now</Link>
                <Link to="/friends" className="btn">Group Order</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
  <section className="card card-hover">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Orders</h2>
        <div className="space-y-4">
          {(activeOrders && activeOrders.length > 0 ? activeOrders : dummyOrders).map((order, idx) => (
            <div key={order.id || idx} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{order.restaurant || order.restaurant}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-sunrise-50 text-sunrise-700">{order.status || 'In Queue'}</span>
              </div>
              <div className="mt-2 space-y-2">
                {order.orderNumber ? <p className="text-gray-600">Order #{order.orderNumber}</p> : null}
                {order.token ? <p className="text-gray-600">Token: <span className="font-semibold">{order.token}</span></p> : null}
                {order.items ? (
                  Array.isArray(order.items) ? (
                    <div className="text-gray-600">
                      <div className="text-sm font-medium mb-1">Items</div>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {order.items.map((it, i) => {
                          if (!it) return null;
                          if (typeof it === 'string') return <li key={i}>{it}</li>;
                          // object expected: { name, qty, price }
                          const name = it.name || it.item || it.label || JSON.stringify(it);
                          const qty = it.qty || it.quantity || 1;
                          const price = it.price !== undefined ? ` — Rs ${Number(it.price).toFixed(2)}` : '';
                          return <li key={i}>{name} × {qty}{price}</li>;
                        })}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-600">Items: {String(order.items)}</p>
                  )
                ) : null}
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Driver: {order.driver || 'Self'}</p>
                  <p className="font-semibold">Rs {order.total ? Number(order.total).toFixed(2) : (order.price ? Number(order.price).toFixed(2) : '0.00')}</p>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-aurora" 
                    style={{ width: (order.status === "In Queue" ? "30%" : "70%") }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

  <div className="grid md:grid-cols-2 gap-8">
  <section className="card card-hover">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Recommendation</h2>
          <div className="bg-sunrise-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-indigo-600">
                  {aiRecommendation.dish} from {aiRecommendation.restaurant}
                </h3>
                <p className="text-gray-600 mt-2">{aiRecommendation.reason}</p>
              </div>
              <div className="bg-aurora text-white px-3 py-1 rounded-full text-sm">
                {aiRecommendation.confidence}% Match
              </div>
            </div>
            <Link 
              to="/menu" 
              className="mt-4 inline-block btn-accent"
            >
              Order Now
            </Link>
          </div>
        </section>

  <section className="card card-hover">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Friend Activity</h2>
          <div className="space-y-4">
            {friendActivity.map(activity => (
              <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-lagoon rounded-full"></div>
                <div>
                  <p className="text-gray-800">
                    <span className="font-semibold">{activity.name}</span> {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
  <section className="card card-hover">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg fade-up">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img src={restaurantImages[order.restaurant] || 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=200&auto=format&fit=crop'} alt={order.restaurant} className="dish-img" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{order.restaurant}</h3>
                    <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < order.rating ? 'fill-current' : 'stroke-current'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button className="btn-accent text-sm" onClick={() => handleReorder(order)}>Reorder</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

  <section className="card card-hover">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Special Offers</h2>
          <div className="space-y-4">
            {promotions.map(promo => (
              <div key={promo.id} className="border border-dashed border-indigo-300 p-4 rounded-lg card-hover card-hover-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sunrise-600">{promo.restaurant}</h3>
                    <p className="text-gray-800 mt-1">{promo.offer}</p>
                    <p className="text-sm text-gray-500 mt-2">Expires in: {promo.expiresIn}</p>
                  </div>
                  <div className="bg-sunrise-50 px-3 py-1 rounded-lg">
                    <p className="text-sunrise-600 font-mono">{promo.code}</p>
                  </div>
                </div>
                <Link 
                  to="/menu" 
                  className="mt-3 inline-block btn-accent text-sm"
                >
                  Order Now →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

  <section className="card card-hover">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link 
            to="/menu" 
            className="bg-sunrise-50 p-4 rounded-lg text-center hover:bg-sunrise-100"
          >
            <h3 className="font-semibold">Browse Menu</h3>
            <p className="text-gray-600 text-sm mt-1">Explore restaurants</p>
          </Link>
          <Link 
            to="/friends" 
            className="bg-sunrise-50 p-4 rounded-lg text-center hover:bg-sunrise-100 text-black"
          >
            <h3 className="font-semibold">Group Order</h3>
            <p className="text-gray-600 text-sm mt-1">Order with friends</p>
          </Link>
          <Link 
            to="/profile" 
            className="bg-sunrise-50 p-4 rounded-lg text-center hover:bg-sunrise-100"
          >
            <h3 className="font-semibold">Preferences</h3>
            <p className="text-gray-600 text-sm mt-1">Update your taste</p>
          </Link>
          <Link 
            to="/promotions" 
            className="bg-sunrise-50 p-4 rounded-lg text-center hover:bg-sunrise-100"
          >
            <h3 className="font-semibold">Promotions</h3>
            <p className="text-gray-600 text-sm mt-1">View current offers</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;