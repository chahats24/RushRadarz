import React, { useState } from 'react';

function Friends() {
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: "Aadya Seth",
      preferences: ["Chineese", "Indian"],
      allergies: ["peanuts"],
      status: "online"
    },
    {
      id: 2,
      name: "Chahat Sahni",
      preferences: ["Maggi", "Indian"],
      allergies: ["None"],
      status: "offline"
    },
    {
      id: 3,
      name: "Sharva Bhushan",
      preferences: ["Italian", "Indian"],
      allergies: ["None"],
      status: "online"
    },
    {
      id: 4,
      name: "Shivika Munje",
      preferences: ["Sweets", "Italian"],
      allergies: ["None"],
      status: "offline"
    }
  ]);

  const [groupOrders, setGroupOrders] = useState([]);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [addError, setAddError] = useState('');
  const currentUser = { id: 0, name: 'You' };

  const handleOrderTogether = (friend) => {
    // Create a simple group order entry and add to state
    const newOrder = {
      id: Date.now(),
      members: [friend],
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setGroupOrders((prev) => [newOrder, ...prev]);
  };

  const handleLeaveGroup = (orderId) => {
    setGroupOrders((prev) => prev.filter(o => o.id !== orderId));
  };

  const handleJoinGroup = (orderId) => {
    setGroupOrders((prev) => prev.map(order => {
      if (order.id !== orderId) return order;
      const already = order.members.some(m => m.id === currentUser.id);
      if (already) return order;
      return {
        ...order,
        members: [...order.members, currentUser],
        status: 'Joined'
      };
    }));
  };

  const handleRemoveFriend = (friendId) => {
    // remove friend from list
    setFriends(prev => prev.filter(f => f.id !== friendId));

    // remove friend from any group orders; drop orders that become empty
    setGroupOrders(prev => prev
      .map(order => ({ ...order, members: order.members.filter(m => m.id !== friendId) }))
      .filter(order => order.members.length > 0)
    );
  };

  const handleAddFriend = () => {
    setAddError('');
    const email = (newFriendEmail || '').trim();
    if (!email) {
      setAddError('Please enter an email');
      return;
    }

    // derive a display name from the email local-part
    const local = email.split('@')[0] || email;
    const name = local.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const newFriend = {
      id: Date.now(),
      name,
      preferences: [],
      allergies: ['None'],
      status: 'offline',
      email
    };

    setFriends(prev => [...prev, newFriend]);
    setNewFriendEmail('');
  };

  return (
    <div className="space-y-8">
      <section className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Friends</h2>
        <div className="space-y-4">
          {friends.map(friend => (
            <div key={friend.id} className="card card-hover">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{friend.name}</h3>
                    <span className={`w-2 h-2 rounded-full ${
                      friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Preferences: {friend.preferences.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Allergies: {friend.allergies.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleOrderTogether(friend)}
                    className="btn-accent"
                  >
                    Order Together
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="px-3 py-1 rounded bg-sky-300 text-black card-hover-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Group Orders</h2>
        {groupOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No active group orders at the moment</div>
        ) : (
          <div className="space-y-4">
            {groupOrders.map(order => (
              <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-semibold">Group Order #{order.id}</div>
                  <div className="text-sm text-gray-600">Members: {order.members.map(m => m.name).join(', ')}</div>
                  <div className="text-sm text-gray-500">Status: {order.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  {order.members.some(m => m.id === currentUser.id) ? (
                    <button className="px-3 py-1 rounded bg-gray-300 text-gray-700" disabled>Joined</button>
                  ) : (
                    <button className="px-3 py-1 rounded btn-accent" onClick={() => handleJoinGroup(order.id)}>Join</button>
                  )}
                  <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={() => handleLeaveGroup(order.id)}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Friend</h2>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="email"
              value={newFriendEmail}
              onChange={(e) => setNewFriendEmail(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
              placeholder="Enter friend's email"
            />
            <button onClick={handleAddFriend} className="btn-accent">
              Send Invitation
            </button>
          </div>
          {addError && <div className="text-sm text-red-500">{addError}</div>}
        </div>
      </section>
    </div>
  );
}

export default Friends;