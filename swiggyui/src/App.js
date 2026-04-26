import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch(`${API_URL}/restaurants`);
        const data = await res.json();
        setRestaurants(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const openRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);

    try {
      const res = await fetch(`${API_URL}/restaurants/${restaurant.id}/menu`);
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error(err);
    }
  };

  const placeOrder = async (restaurantId, itemId) => {
    setOrderStatus(itemId);

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `SW-${Date.now()}`,
          customerId: "customer-1",
          restaurantId,
          itemId,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error();

      setToast("🚀 Order placed!");
    } catch {
      setToast("❌ Failed");
    } finally {
      setOrderStatus(null);
      setTimeout(() => setToast(""), 3000);
    }
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <h1 className="logo">SWIGGY ULTRA V111111</h1>
        <input className="nav-search" placeholder="Search food..." />
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>
            Discover <span>Epic Food</span>
          </h1>
          <p>Order like a legend ⚡</p>
          <input placeholder="Search restaurants..." />
        </div>
      </header>

      {/* RESTAURANTS */}
      <section className="section">
        <h2>🔥 Top Picks</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="scroll-row">
            {restaurants.map((r) => (
              <div
                key={r.id}
                className="game-card"
                onClick={() => openRestaurant(r)}
              >
                <img src={r.image} alt={r.name} />
                <div className="overlay">
                  <h3>{r.name}</h3>
                  <span>⭐ {r.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MENU PANEL */}
      {selectedRestaurant && (
        <div className="menu-panel">
          <h2>{selectedRestaurant.name}</h2>

          {menu.map((item) => (
            <div key={item.id} className="menu-item">
              <span>{item.name}</span>
              <span>₹{item.price}</span>

              <button
                onClick={() =>
                  placeOrder(selectedRestaurant.id, item.id)
                }
              >
                {orderStatus === item.id ? "⚡" : "Order"}
              </button>
            </div>
          ))}

          <button
            className="close-btn"
            onClick={() => setSelectedRestaurant(null)}
          >
            Close
          </button>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;