import React from "react";
import "./App.css";

const restaurants = [
  {
    id: 1,
    name: "Spicy Hub",
    rating: "4.5",
    time: "30 mins",
    image: "https://source.unsplash.com/600x400/?biryani"
  },
  {
    id: 2,
    name: "Burger World",
    rating: "4.2",
    time: "25 mins",
    image: "https://source.unsplash.com/600x400/?burger"
  },
  {
    id: 3,
    name: "Pizza Corner",
    rating: "4.7",
    time: "20 mins",
    image: "https://source.unsplash.com/600x400/?pizza"
  }
];

function App() {
  const placeOrder = async (restaurant) => {
    const order = {
      orderId: Date.now().toString(),
      customerId: "customer-1",
      createdAt: new Date().toISOString()
    };

    await fetch("http://<YOUR_API_IP>/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    });

    alert(`Order placed from ${restaurant.name}! 🚀`);
  };

  return (
    <div>
      <header className="navbar">
        <div className="logo">SwiggyLite</div>
        <div className="nav-links">
          <span>Offers</span>
          <span>Help</span>
          <span>Cart</span>
        </div>
      </header>

      <div className="hero">
        <h2>Order food from your favourite restaurants</h2>
      </div>

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
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;