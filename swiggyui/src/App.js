import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL;

const restaurants = [
  {
    id: 1,
    name: "Spicy Hub",
    rating: "4.5",
    time: "30 mins",
    image: "https://images.unsplash.com/photo-1604908554007-8a0b33d4f19f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    name: "Burger World",
    rating: "4.2",
    time: "25 mins",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    name: "Pizza Corner",
    rating: "4.7",
    time: "20 mins",
    image: "https://images.unsplash.com/photo-1548365328-5f547fb0953c?auto=format&fit=crop&w=1200&q=80"
  }
];

function App() {
  const [toast, setToast] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  const placeOrder = async (restaurant) => {
    setLoading(true);

    const order = {
      orderId: Date.now().toString(),
      customerId: "customer-1",
      createdAt: new Date().toISOString()
    };

    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    setLoading(false);
    setToast(`🚀 Order placed from ${restaurant.name}`);
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
          <button className="mode-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀" : "🌙"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1>Food that makes you smile</h1>
        <p>Fast delivery. Zero stress. Infinite cravings.</p>
        <input className="search" placeholder="Search restaurants or dishes..." />
      </section>

      {/* RESTAURANTS */}
      <section className="restaurant-section">
        <h2>Popular Near You</h2>

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
                <button onClick={() => placeOrder(r)}>
                  {loading ? "Placing..." : "Order Now"}
                </button>
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