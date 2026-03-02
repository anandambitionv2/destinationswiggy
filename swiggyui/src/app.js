import React from "react";
import "./App.css";

const restaurants = [
  {
    id: 1,
    name: "Spicy Hub",
    image: "https://source.unsplash.com/400x300/?biryani"
  },
  {
    id: 2,
    name: "Burger World",
    image: "https://source.unsplash.com/400x300/?burger"
  },
  {
    id: 3,
    name: "Pizza Corner",
    image: "https://source.unsplash.com/400x300/?pizza"
  }
];

function App() {
  const placeOrder = async (restaurant) => {
    const order = {
      orderId: Date.now().toString(),
      customerId: "customer-1",
      createdAt: new Date().toISOString()
    };

    try {
      await fetch("http://<YOUR_API_IP>/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
      });

      alert(`Order placed from ${restaurant.name}! 🚀`);
    } catch (err) {
      alert("Order failed!");
    }
  };

  return (
    <div>
      <header className="header">
        <h1>SwiggyLite</h1>
      </header>

      <div className="container">
        {restaurants.map((r) => (
          <div key={r.id} className="card">
            <img src={r.image} alt={r.name} />
            <h3>{r.name}</h3>
            <button onClick={() => placeOrder(r)}>
              Order Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;