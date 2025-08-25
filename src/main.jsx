import React from "react";
import ReactDOM from "react-dom/client";
import ReactGA from "react-ga4";
import App from "./App";
import "./index.css";
import { CartProvider } from "./context/CartContext";

ReactGA.initialize("G-MH5T98LNWN");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>,
);

const originalFetch = window.fetch;

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

window.fetch = function (input, init = {}) {
  if (typeof input === "string" && input.startsWith("/api")) {
    input = API_BASE + input;
  } else if (input instanceof Request && input.url.startsWith("/api")) {
    input = new Request(API_BASE + input.url, input);
  }
  return originalFetch(input, init);
};
