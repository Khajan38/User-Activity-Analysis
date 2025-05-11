import React from "react"
import { useEffect } from "react";
import Dashboard from "./components/Dashboard";

function App() {
  useEffect(() => {
    fetch('https://cognitick-api.onrender.com/api', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log('Login auto-triggered:', data);
      })
      .catch(err => console.error(err));
  }, []);
  return <Dashboard />;
}

export default App;