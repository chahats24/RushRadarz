import React from 'react';

function OrderHistory() {
  const orders = [
    {
      id: 1,
      restaurant: "Burger King",
      items: ["Whopper", "French Fries", "Coke"],
      total: 15.99,
      date: "2025-10-29",
      status: "completed"
    },
    {
      id: 2,
      restaurant: "Pizza Hut",
      items: ["Pepperoni Pizza", "Garlic Bread"],
      total: 22.50,
      date: "2025-10-28",
      status: "completed"
    },
    {
      id: 3,
      restaurant: "Taco Bell",
      items: ["Crunchy Taco", "Burrito"],
      total: 12.99,
      date: "2025-10-27",
      status: "cancelled"
    }
  ];

  const getStatusColor = (status) => {
    return status === 'completed' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order History</h2>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{order.restaurant}</h3>
                  <p className="text-gray-600 mt-1">
                    {order.items.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Ordered on {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Rs {order.total.toFixed(2)}</p>
                  <p className={`text-sm mt-1 ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                  {order.status === 'completed' && (
                    <button className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm">
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-indigo-600">{orders.length}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Completed Orders</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(order => order.status === 'completed').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-indigo-600">
              Rs {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OrderHistory;