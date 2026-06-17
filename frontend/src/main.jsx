import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

// Setup global Axios interceptor for JWT
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);