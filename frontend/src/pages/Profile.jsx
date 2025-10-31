import React, { useEffect, useState } from 'react';

function Profile() {
  const STORAGE_KEY = 'local_profile_v1';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [dietary, setDietary] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        setName(obj.name || '');
        setEmail(obj.email || '');
        setPhone(obj.phone || '');
        setAddress(obj.address || '');
        setAllergies(Array.isArray(obj.allergies) ? obj.allergies : []);
        setDietary(Array.isArray(obj.dietary) ? obj.dietary : []);
        setNotes(obj.notes || '');
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const addAllergy = () => {
    const a = (newAllergy || '').trim();
    if (!a) return;
    setAllergies((s) => [...s, a]);
    setNewAllergy('');
  };

  const removeAllergy = (idx) => setAllergies((s) => s.filter((_, i) => i !== idx));

  const saveProfile = () => {
    const payload = { name, email, phone, address, allergies, dietary, notes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setMessage('Profile saved locally.');
    setTimeout(() => setMessage(null), 2500);
  };

  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setName(''); setEmail(''); setPhone(''); setAddress(''); setAllergies([]); setNotes('');
    setMessage('Profile cleared.');
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="space-y-8">
      <section className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Profile</h2>
        <p className="text-sm text-gray-600 mb-4"></p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Full name</label>
            <input className="w-full p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input className="w-full p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Phone</label>
            <input className="w-full p-2 border rounded" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 99999 99999" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Address</label>
            <input className="w-full p-2 border rounded" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Hostel / Apartment / Street" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 mb-1">Allergies</label>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 p-2 border rounded" value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="Add allergy (e.g. peanuts)" />
            <button className="px-4 py-2 bg-aurora text-white rounded" onClick={addAllergy}>Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map((a, i) => (
              <div key={i} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                <span className="text-sm">{a}</span>
                <button className="text-red-600" onClick={() => removeAllergy(i)}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 mb-1">Dietary preferences</label>
          <div className="flex flex-wrap gap-3">
            {['Vegetarian','Vegan','Nut-Free','Gluten-Free','Halal','No-Red-Meat'].map(pref => (
              <label key={pref} className="inline-flex items-center gap-2 px-3 py-1 border rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={dietary.includes(pref)}
                  onChange={(e) => {
                    if(e.target.checked) setDietary(d => [...d, pref]);
                    else setDietary(d => d.filter(x => x !== pref));
                  }}
                />
                <span className="text-sm">{pref}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 mb-1">Notes</label>
          <textarea className="w-full p-2 border rounded" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any other info (dietary prefs, etc.)" />
        </div>

        <div className="mt-4 flex gap-3">
          <button className="btn-accent" onClick={saveProfile}>Save</button>
          <button className="px-4 py-2 border rounded" onClick={clearProfile}>Clear</button>
          {message && <div className="text-sm text-green-600 self-center">{message}</div>}
        </div>
      </section>
    </div>
  );
}

export default Profile;