import React from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "./components/Popup";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(React.createElement(Popup));
  }
});

// Add this line at the end of the file
export {};
// entry point for the popup that renders the popup component
