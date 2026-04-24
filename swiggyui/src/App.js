import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/restaurants`);
        const data = await res.json();
        setRestaurants(data);
      } catch (error) {
        console.error(error);
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

    const payload = {
      orderId: `SW-${Date.now()}`,
      customerId: "customer-1",
      restaurantId,
      itemId,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
    <div className={`app ${darkMode ? "dark" : ""}`}>

      {/* 🔥 Animated Background */}
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>

      {/* NAVBAR */}
      <nav className="navbar glass">
        <h1 className="logo neon">SWIGGY ULTRA</h1>

        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </nav>

      {/* HERO */}
      <header className="hero">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Premium Dining <br /> Reimagined ⚡
        </motion.h1>

        <input className="search" placeholder="Search crazy food..." />
      </header>

      {/* RESTAURANTS */}
      <section className="container">

        {loading ? (
          <div>Loading...</div>
        ) : (
          restaurants.map((r) => (
            <motion.div
              key={r.id}
              className="card glass"
              whileHover={{
                scale: 1.05,
                rotateX: 5,
                rotateY: -5
              }}
              onClick={() => openRestaurant(r)}
            >
              <img src={r.image} alt={r.name} />

              <div className="card-content">
                <h3>{r.name}</h3>
                <span className="rating">⭐ {r.rating}</span>
              </div>
            </motion.div>
          ))
        )}

      </section>

      {/* MENU PANEL */}
      <AnimatePresence>
        {selectedRestaurant && (
          <motion.div
            className="menu-panel glass"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            <h2>{selectedRestaurant.name}</h2>

            {menu.map((item) => (
              <motion.div
                key={item.id}
                className="menu-item"
                whileHover={{ scale: 1.05 }}
              >
                <span>{item.name}</span>
                <span>₹{item.price}</span>

                <button
                  className="order-btn"
                  onClick={() =>
                    placeOrder(selectedRestaurant.id, item.id)
                  }
                >
                  {orderStatus === item.id ? "⚡" : "Order"}
                </button>
              </motion.div>
            ))}

            <button onClick={() => setSelectedRestaurant(null)}>
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;