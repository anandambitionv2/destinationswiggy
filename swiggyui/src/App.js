import React, { useState } from "react";
import "./App.css";

const restaurants = [
  {
    id: 1,
    name: "Spicy Hub",
    rating: "4.5",
    time: "30 mins",
    image: "https://images.unsplash.com/photo-1604908554007-8a0b33d4f19f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Burger World",
    rating: "4.2",
    time: "25 mins",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Pizza Corner",
    rating: "4.7",
    time: "20 mins",
    image: "https://images.unsplash.com/photo-1548365328-5f547fb0953c?auto=format&fit=crop&w=800&q=80"
  }
];

function App() {
  const [toast, setToast] = useState("");

  const placeOrder = async (restaurant) => {
    const order = {
      orderId: Date.now().toString(),
      customerId: "customer-1",
      createdAt: new Date().toISOString()
    };

    await fetch("http://<YOUR_API_IP>/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    setToast(`Order placed from ${restaurant.name}! 🚀`);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">SwiggyLite</div>
        <div className="nav-links">
          <span>Offers</span>
          <span>Help</span>
          <span>Cart</span>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1>Delicious food delivered to your door</h1>
        <p>Order from top restaurants near you</p>
        <input className="search" placeholder="Search for restaurants or dishes..." />
      </section>

      {/* RESTAURANTS */}
      <section className="restaurant-section">
        <h2>Top Picks For You</h2>
        <div className="container">
          {restaurants.map((r) => (
            <div key={r.id} className="card">
              <img src={r.image} alt={r.name} />
              <div className="card-content">
                <h3>{r.name}</h3>
                <div className="meta">
                  <span className="rating">⭐ {r.rating}</span>
                  <span>{r.time}</span>
                </div>
                <button onClick={() => placeOrder(r)}>Order Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}

    </div>
  );
}

export default App;