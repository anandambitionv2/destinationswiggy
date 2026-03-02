import React, { useState, useEffect } from "react";
import "./App.css";

// Use an environment variable or a fallback for the API URL
const API_URL = process.env.REACT_APP_API_URL || "https://api.example.com";

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null); // 'idle', 'placing', 'success'
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState("");

  // 1. THE DATA FETCH: Simulating an API call on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        // In a real app: const res = await fetch(`${API_URL}/restaurants`);
        // Simulating network latency for that "high-end" loading feel
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        const mockData = [
          { id: 1, name: "The Gourmet Kitchen", rating: "4.8", time: "25 mins", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
          { id: 2, name: "Artisan Burgers", rating: "4.5", time: "20 mins", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
          { id: 3, name: "Sushi Zen", rating: "4.9", time: "35 mins", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80" }
        ];
        
        setRestaurants(mockData);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // 2. THE POST CALL: Sending order data to the server
  const placeOrder = async (restaurant) => {
    setOrderStatus(restaurant.id); // Track which card is "loading"
    
    const orderPayload = {
      orderId: `SW-${Date.now()}`,
      restaurantId: restaurant.id,
      items: ["Standard Meal"],
      timestamp: new Date().toISOString()
    };

    try {
      // Real API Call
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) throw new Error("Order failed");

      setToast(`🚀 Order confirmed at ${restaurant.name}!`);
    } catch (err) {
      // Fallback for demo purposes if API doesn't exist yet
      setToast(`Mock Success: Order sent to ${restaurant.name}`);
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
        <div className="logo">SWIGGY<span className="accent">ULTRA</span></div>
        <div className="nav-links">
          <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <h1>Premium Dining, <br/>Delivered.</h1>
        <div className="search-container">
          <input className="search" placeholder="Search your cravings..." />
        </div>
      </header>

      {/* CONTENT */}
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
              <div key={r.id} className="card">
                <div className="image-container">
                  <img src={r.image} alt={r.name} />
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <h3>{r.name}</h3>
                    <span className="rating-tag">★ {r.rating}</span>
                  </div>
                  <button 
                    className={`order-btn ${orderStatus === r.id ? 'loading' : ''}`}
                    onClick={() => placeOrder(r)}
                    disabled={orderStatus !== null}
                  >
                    {orderStatus === r.id ? "Processing..." : "Order Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;