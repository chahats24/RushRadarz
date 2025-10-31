const express = require('express');
const router = express.Router();

// Simple in-memory historical data sample for wait-time by restaurant (hour => minutes)
const historicalWaits = {
  // restaurantName: { hour: [samples] }
  'KC': { 9: [5,7,6], 12: [20,25,18], 13: [25,30,22], 18: [15,18,12] },
  'Lassi Point': { 9: [2,3], 12: [5,6], 15: [4,5], 20: [6,8] },
  'Hang on Swing': { 11: [10,12,9], 13: [30,35,28], 14: [25,22] },
  'DC Bakery': { 8: [3,4], 12: [10,12], 17: [8,9] },
  'PRP Canteen': { 12: [15,18,12], 13: [20,25], 19: [10,12] }
};

// Utility: simple average
function avg(arr){ if(!arr || arr.length===0) return null; return Math.round(arr.reduce((s,a)=>s+a,0)/arr.length); }

// Predict wait time for a restaurant using hour-of-day heuristic + optional modifiers
router.get('/wait-time', (req, res) => {
  try{
    const { restaurant, hour, weather, event } = req.query;
    if(!restaurant) return res.status(400).json({ message: 'restaurant query param required' });

    const nowHour = hour ? parseInt(hour,10) : new Date().getHours();
    const samples = (historicalWaits[restaurant] && historicalWaits[restaurant][nowHour]) || [];
    let base = avg(samples) || 10;

    // Simple modifiers
    if(weather && weather.toLowerCase().includes('rain')) base += 5;
    if(event && event.toLowerCase().includes('festival')) base += 10;

    // Confidence based on sample size
    const confidence = Math.min(95, 50 + (samples.length * 10));

    res.json({ restaurant, predictedWaitMinutes: base, confidence });
  }catch(e){
    res.status(500).json({ message: 'error predicting wait time', error: e.message });
  }
});

// Dish availability probability (simple hash-based deterministic pseudo-randomness)
router.get('/dish-availability', (req, res) => {
  try{
    const { restaurant, dish } = req.query;
    if(!restaurant || !dish) return res.status(400).json({ message: 'restaurant and dish required' });

    // deterministic pseudo-random based on string
    let seed = 0; for(let i=0;i<dish.length;i++) seed = (seed * 31 + dish.charCodeAt(i)) % 101;
    // availability probability between 20 and 98
    const probability = 20 + Math.round((seed / 100) * 78);
    const stockEstimate = Math.max(0, Math.round((probability/100) * 20));

    res.json({ restaurant, dish, availabilityProbability: probability, stockEstimate });
  }catch(e){
    res.status(500).json({ message: 'error computing availability', error: e.message });
  }
});

// Simple recommendation endpoint (no auth required for demo) — returns nearby restaurants/dishes based on lightweight rules
router.get('/recommendations', (req, res) => {
  try{
    const { prefs } = req.query; // comma-separated preferences
    const prefList = prefs ? prefs.split(',').map(s=>s.trim().toLowerCase()) : [];

    // naive catalog (should map to your real DB in production)
    const catalog = [
      { restaurant: 'Lassi Point', dish: 'Mango Lassi' },
      { restaurant: 'DC Bakery', dish: 'Red Sauce Pasta' },
      { restaurant: 'KC', dish: 'Paneer Paratha' },
      { restaurant: 'Hang on Swing', dish: 'Cheese Maggi' },
      { restaurant: 'PRP Canteen', dish: 'Veg Biryani' }
    ];

    // score items by preference overlap
    const scored = catalog.map(c => {
      const score = prefList.reduce((s,p)=> s + ( (c.dish.toLowerCase().includes(p) || c.restaurant.toLowerCase().includes(p)) ? 1 : 0 ), 0);
      return { ...c, score };
    }).sort((a,b)=>b.score-a.score);

    res.json({ recommendations: scored.slice(0,5) });
  }catch(e){
    res.status(500).json({ message: 'error generating recommendations', error: e.message });
  }
});

module.exports = router;
