import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"; // add this file if you don’t use Tailwind base

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
