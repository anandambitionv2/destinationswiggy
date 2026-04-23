
import React, { useState, useEffect } from "react";
import "./App.css";

// API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {

  const [restaurants, setRestaurants] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState("");

  // -------------------------
  // Fetch Restaurants
  // -------------------------
  useEffect(() => {

    const fetchRestaurants = async () => {

      try {

        setLoading(true);

        const res = await fetch(`${API_URL}/restaurants`);

        const data = await res.json();

        setRestaurants(data);

      } catch (error) {

        console.error("Failed to fetch restaurants:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchRestaurants();

  }, []);

  // -------------------------
  // Open Restaurant Menu
  // -------------------------
  const openRestaurant = async (restaurant) => {

    setSelectedRestaurant(restaurant);

    try {

      const res = await fetch(
        `${API_URL}/restaurants/${restaurant.id}/menu`
      );

      const data = await res.json();

      setMenu(data);

    } catch (err) {

      console.error("Failed to fetch menu", err);

    }

  };

  // -------------------------
  // Place Order
  // -------------------------
  const placeOrder = async (restaurantId, itemId) => {

    setOrderStatus(itemId);

    const orderPayload = {
      orderId: `SW-${Date.now()}`,
      customerId: "customer-1",
      restaurantId: restaurantId,
      itemId: itemId,
      createdAt: new Date().toISOString()
    };

    try {

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) throw new Error("Order failed");

      setToast(" Order placed successfully!");

    } catch (err) {

      setToast("❌ Order failed");

    } finally {

      setOrderStatus(null);

      setTimeout(() => setToast(""), 4000);

    }

  };

  return (

    <div className={`app ${darkMode ? 'dark' : ''}`}>

      <div className="bg-blob"></div>

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          SWIGGY<span className="accent">ULTRAv8</span>
        </div>

        <button
          className="mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

      </nav>

      {/* HERO */}

      <header className="hero">

        <h1>
          Premium Dining,
          <br />
          Delivered.
        </h1>

        <div className="search-container">
          <input
            className="search"
            placeholder="Search your cravings..."
          />
        </div>

      </header>

      {/* RESTAURANTS */}

      <section className="restaurant-section">

        {loading ? (

          <div className="loading-state">
            <div className="shimmer-card"></div>
            <div className="shimmer-card"></div>
            <div className="shimmer-card"></div>
          </div>

        ) : (

          <div className="container">

            {restaurants.map((r) => (

              <div
                key={r.id}
                className="card"
                onClick={() => openRestaurant(r)}
              >

                <div className="image-container">

                  <img src={r.image} alt={r.name} />

                </div>

                <div className="card-content">

                  <div className="card-header">

                    <h3>{r.name}</h3>

                    <span className="rating-tag">
                      ★ {r.rating}
                    </span>

                  </div>

                  <p>{r.time}</p>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* MENU PANEL */}

      {selectedRestaurant && (

        <div className="menu-panel">

          <h2>{selectedRestaurant.name} Menu</h2>

          {menu.map((item) => (

            <div key={item.id} className="menu-item">

              <span>{item.name}</span>

              <span>₹{item.price}</span>

              <button
                className={`order-btn ${orderStatus === item.id ? 'loading' : ''}`}
                onClick={() =>
                  placeOrder(selectedRestaurant.id, item.id)
                }
              >
                {orderStatus === item.id
                  ? "Processing..."
                  : "Order"}
              </button>

            </div>

          ))}

          <button
            className="close-menu"
            onClick={() => setSelectedRestaurant(null)}
          >
            Close
          </button>

        </div>

      )}

      {/* TOAST MESSAGE */}

      {toast && <div className="toast">{toast}</div>}

    </div>

  );

}

export default App;
