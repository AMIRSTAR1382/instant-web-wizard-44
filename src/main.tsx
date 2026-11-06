import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// The Persian font ships with the site (no Google Fonts), so it loads even where Google is slow or blocked.
import "vazirmatn/Vazirmatn-Variable-font-face.css";
import "./index.css";

// An earlier version used hash URLs (/#/gaming). Turn any old shared link into a clean one.
if (window.location.hash.startsWith("#/")) {
  window.history.replaceState(null, "", window.location.hash.slice(1));
}

createRoot(document.getElementById("root")!).render(<App />);
