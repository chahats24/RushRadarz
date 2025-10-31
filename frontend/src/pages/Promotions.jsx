import React from 'react';
import { Link } from 'react-router-dom';

const demoPromotions = [
  { id: 1, restaurant: 'DC Bakery', offer: 'Get 10% off on combo meals', code: 'COMBO10', expiresIn: '2 days' },
  { id: 2, restaurant: 'Apples Juice Center', offer: 'Free Veg Puff on orders above Rs 300', code: 'PUFF300', expiresIn: '5 days' }
];

function Promotions(){
  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-2xl font-bold mb-3">Promotions</h2>
        <p className="text-sm text-gray-600 mb-4">Active promotions and discount codes you can use right now.</p>

        <div className="space-y-4">
          {demoPromotions.map(p => (
            <div key={p.id} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sunrise-600">{p.restaurant}</h3>
                <p className="text-gray-800 mt-1">{p.offer}</p>
                <p className="text-sm text-gray-500 mt-2">Expires in: {p.expiresIn}</p>
              </div>
              <div className="text-right">
                <div className="bg-sunrise-50 px-3 py-1 rounded-lg mb-2 inline-block">
                  <span className="font-mono text-sunrise-600">{p.code}</span>
                </div>
                <div>
                  <Link to="/menu" className="btn-accent text-sm">Use Offer</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Promotions;
