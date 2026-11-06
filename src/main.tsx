import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// An earlier version used hash URLs (/#/gaming). Turn any old shared link into a clean one.
if (window.location.hash.startsWith("#/")) {
  window.history.replaceState(null, "", window.location.hash.slice(1));
}

createRoot(document.getElementById("root")!).render(<App />);
