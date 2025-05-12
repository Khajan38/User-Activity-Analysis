import React from "react"
import { useEffect } from "react";
import Dashboard from "./components/Dashboard";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  useEffect(() => {
    fetch(`${BASE_URL}/api`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log('Login auto-triggered:', data);
      })
      .catch(err => console.error(err));
  }, []);
  return <Dashboard />;
}

export default App;